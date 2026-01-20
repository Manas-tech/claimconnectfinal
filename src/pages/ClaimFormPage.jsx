import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';

const ClaimFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    purchaseDate: '',
    claimAmount: '',
    description: '',
    agreeTerms: false,
  });

  useEffect(() => {
    const mockSettlements = {
      1: {
        id: 1,
        name: 'TechCorp Data Breach Settlement',
        company: 'TechCorp Inc.',
        amount: '$125 Million',
      },
      2: {
        id: 2,
        name: 'AutoMaker Emissions Settlement',
        company: 'AutoMaker Corp',
        amount: '$800 Million',
      },
      3: {
        id: 3,
        name: 'PharmaCo Drug Pricing Settlement',
        company: 'PharmaCo Ltd',
        amount: '$450 Million',
      },
    };

    setSettlement(mockSettlements[id] || mockSettlements[1]);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the terms and conditions to submit your claim.',
        variant: 'destructive',
      });
      return;
    }

    const claims = JSON.parse(localStorage.getItem('claims') || '[]');
    const newClaim = {
      id: Date.now().toString(),
      settlementId: settlement.id,
      settlementName: settlement.name,
      ...formData,
      status: 'Pending Review',
      submittedDate: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    claims.push(newClaim);
    localStorage.setItem('claims', JSON.stringify(claims));

    toast({
      title: 'Claim Submitted Successfully!',
      description: 'Your claim has been received. You can track its status on the tracking page.',
    });

    setTimeout(() => {
      navigate('/track-claims');
    }, 2000);
  };

  if (!settlement) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>File Claim - {settlement.name} | ClassAction Claims</title>
        <meta name="description" content={`File your claim for ${settlement.name}. Complete the secure online form to submit your class action settlement claim.`} />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/settlements')}
            className="mb-6 hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settlements
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                File Your Claim
              </h1>
              <p className="text-lg text-slate-600 mb-4">{settlement.name}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Settlement Fund:</strong> {settlement.amount}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Claim Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="purchaseDate">Date of Purchase/Incident *</Label>
                    <Input
                      id="purchaseDate"
                      name="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="claimAmount">Claim Amount</Label>
                    <Input
                      id="claimAmount"
                      name="claimAmount"
                      type="number"
                      placeholder="Optional"
                      value={formData.claimAmount}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="description">Description of Claim *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about your claim..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div className="mt-6">
                  <Label>Supporting Documents (Optional)</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload receipts, invoices, or other supporting documents</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="agreeTerms" className="text-sm text-slate-700 cursor-pointer">
                  I certify that the information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in denial of my claim and potential legal consequences.
                </Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Claim
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/settlements')}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ClaimFormPage;