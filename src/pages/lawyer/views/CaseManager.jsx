import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, FileText, Calendar, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getSettlements, saveSettlement } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const CaseManager = () => {
  const [cases, setCases] = useState([]);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    name: '',
    company: '',
    category: '',
    amount: '',
    deadline: '',
    status: 'Active',
    eligibility: '',
    estimatedPayout: '',
    proofOfPurchase: false,
  });
  const [trackingCounts, setTrackingCounts] = useState({});
  const [addingCaseId, setAddingCaseId] = useState(null);

  useEffect(() => {
    const loadCases = async () => {
      const data = await getSettlements();
      setCases(data);
      await loadTrackingCounts();
    };
    loadCases();
  }, []);

  const loadTrackingCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('tracked_settlements')
        .select('settlement_id');
      if (error) throw error;

      const counts = {};
      (data || []).forEach((row) => {
        const key = String(row.settlement_id);
        counts[key] = (counts[key] || 0) + 1;
      });
      setTrackingCounts(counts);
    } catch (err) {
      console.error('Error loading tracking counts:', err);
      setTrackingCounts({});
    }
  };

  const handleAddToClaimReview = async (c) => {
    try {
      setAddingCaseId(c.id);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to add to claim review.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('claim_review_queue').insert({
        settlement_id: c.id,
        settlement_name: c.name,
        title: c.name,
        category: c.category,
        settlement_amount_total: c.amount,
        claim_deadline_date: c.deadline,
        case_number: c.caseNumber || c.case_number,
        company: c.company,
        estimated_payout: c.estimatedPayout,
        proof_of_purchase: c.proofOfPurchase,
        user_id: session.user.id,
        status: 'Pending Review',
      });
      if (error) throw error;

      toast({
        title: "Added to Claim Review",
        description: `${c.name} is now in the review queue.`,
      });
    } catch (err) {
      console.error('Error adding to claim review:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add to claim review.",
        variant: "destructive",
      });
    } finally {
      setAddingCaseId(null);
    }
  };

  const handleCreateCase = async () => {
    if (!newCase.name || !newCase.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const created = await saveSettlement({
      ...newCase,
      claimants: '0',
    });
    
    const updatedCases = await getSettlements();
    setCases(updatedCases);
    setIsNewCaseOpen(false);
    setNewCase({ name: '', company: '', category: '', amount: '', deadline: '', status: 'Active', eligibility: '', estimatedPayout: '', proofOfPurchase: false });
    
    toast({
      title: "Case Created",
      description: "The new settlement case has been published successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Case Management</h2>
          <p className="text-slate-500">Manage your firm's class action settlements</p>
        </div>
        
        <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Class Action Case</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Case Name</Label>
                  <Input 
                    value={newCase.name} 
                    onChange={(e) => setNewCase({...newCase, name: e.target.value})}
                    placeholder="e.g. Data Breach Litigation" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Defendant Company</Label>
                  <Input 
                    value={newCase.company} 
                    onChange={(e) => setNewCase({...newCase, company: e.target.value})}
                    placeholder="e.g. MegaCorp Inc." 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Settlement Amount</Label>
                  <Input 
                    value={newCase.amount} 
                    onChange={(e) => setNewCase({...newCase, amount: e.target.value})}
                    placeholder="e.g. $50 Million" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Individual Payout</Label>
                  <Input 
                    value={newCase.estimatedPayout} 
                    onChange={(e) => setNewCase({...newCase, estimatedPayout: e.target.value})}
                    placeholder="e.g. $100 - $300" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setNewCase({...newCase, category: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                      <SelectItem value="Consumer Rights">Consumer Rights</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Employment">Employment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filing Deadline</Label>
                  <Input 
                    type="date"
                    value={newCase.deadline} 
                    onChange={(e) => setNewCase({...newCase, deadline: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eligibility Criteria</Label>
                <Input 
                  value={newCase.eligibility} 
                  onChange={(e) => setNewCase({...newCase, eligibility: e.target.value})}
                  placeholder="Who can file a claim?" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="proofOfPurchase"
                  checked={newCase.proofOfPurchase}
                  onCheckedChange={(checked) => setNewCase({...newCase, proofOfPurchase: checked})}
                />
                <Label htmlFor="proofOfPurchase" className="text-sm font-normal cursor-pointer">
                  Proof of Purchase Required
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewCaseOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCase} className="bg-blue-600">Create Case</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="Filter cases..." 
            />
          </div>
          <div className="flex gap-2 ml-auto">
             <Button variant="outline" size="sm">Active Only</Button>
             <Button variant="outline" size="sm">Export CSV</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Case Name / Defendant</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Fund Amount</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Claimants</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-slate-500 text-xs">{c.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{c.amount}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(c.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-400" />
                      {trackingCounts[String(c.id)] ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      Active
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleAddToClaimReview(c)}
                        disabled={addingCaseId === c.id}
                      >
                        {addingCaseId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Add to Claim Review
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {cases.length} cases</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="ghost" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseManager;