import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClaims, updateClaimStatus } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ClaimReview = () => {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setClaims(getClaims());
  }, []);

  const handleStatusUpdate = (id, status) => {
    const updated = updateClaimStatus(id, status);
    setClaims(updated);
    toast({
      title: status === 'Approved' ? 'Claim Approved' : 'Claim Rejected',
      description: `Claim #${id} has been updated.`,
      variant: status === 'Approved' ? 'default' : 'destructive'
    });
  };

  const filteredClaims = filter === 'all' 
    ? claims 
    : claims.filter(c => c.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Claim Review Queue</h2>
          <p className="text-slate-500">Review and adjudicate consumer claims</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Tabs defaultValue="all" onValueChange={(val) => setFilter(val === 'all' ? 'all' : val)}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All Claims</TabsTrigger>
                <TabsTrigger value="Pending Review">Pending</TabsTrigger>
                <TabsTrigger value="Approved">Approved</TabsTrigger>
                <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  placeholder="Search by ID or Name..." 
                />
              </div>
            </div>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="h-8 w-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No claims found</h3>
               <p className="text-slate-500">There are no claims matching the current filter.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Claim ID / Date</th>
                  <th className="px-6 py-4 font-semibold">Claimant</th>
                  <th className="px-6 py-4 font-semibold">Case Name</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredClaims.map((claim) => (
                    <motion.tr 
                      key={claim.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900">#{claim.id.slice(-6)}</div>
                        <div className="text-slate-500 text-xs">{new Date(claim.submittedDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{claim.firstName} {claim.lastName}</div>
                        <div className="text-slate-500 text-xs">{claim.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                        {claim.settlementName}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {claim.claimAmount ? `$${claim.claimAmount}` : 'Standard'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(claim.status)} border-0`}>
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {claim.status === 'Pending Review' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(claim.id, 'Approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(claim.id, 'Rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimReview;