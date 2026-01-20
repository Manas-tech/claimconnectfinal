import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, DollarSign, ChevronRight, FileCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getSettlements } from '@/lib/storage';

const SettlementsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [settlements, setSettlements] = useState([]);
  const [filteredSettlements, setFilteredSettlements] = useState([]);

  useEffect(() => {
    // Load from centralized storage (async)
    const loadData = async () => {
      const data = await getSettlements();
      setSettlements(data);
      setFilteredSettlements(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = settlements;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    setFilteredSettlements(filtered);
  }, [searchTerm, categoryFilter, settlements]);

  // Extract unique categories dynamically
  const categories = ['all', ...new Set(settlements.map(s => s.category))];

  return (
    <>
      <Helmet>
        <title>Browse Active Settlements - ClaimConnect</title>
        <meta name="description" content="Discover active class action settlements. Search and filter by case type, company, and eligibility to find settlements you may qualify for." />
      </Helmet>

      <div className="bg-gradient-to-br from-slate-50 to-violet-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Active Settlements
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Browse {settlements.length} available class action settlements and find ones you're eligible for
            </p>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search settlements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {filteredSettlements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No settlements found matching your criteria.</p>
            </div>
          ) : (
            filteredSettlements.map((settlement, index) => (
              <motion.div
                key={settlement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex items-start gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">
                            {settlement.name}
                          </h2>
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                            {settlement.category}
                          </Badge>
                        </div>
                        <p className="text-slate-600 font-medium">{settlement.company}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-slate-500">Settlement Amount</div>
                            <div className="font-semibold text-slate-900">{settlement.amount}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-slate-500">Deadline</div>
                            <div className="font-semibold text-slate-900">
                              {new Date(settlement.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-slate-500">Est. Payout</div>
                            <div className="font-semibold text-slate-900">{settlement.estimatedPayout}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`p-2 rounded-lg ${settlement.proofOfPurchase ? 'bg-blue-100' : 'bg-slate-100'}`}>
                            {settlement.proofOfPurchase ? (
                              <FileCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-slate-500">Proof of Purchase</div>
                            <div className={`font-semibold ${settlement.proofOfPurchase ? 'text-blue-600' : 'text-slate-600'}`}>
                              {settlement.proofOfPurchase ? 'Required' : 'Not Required'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:ml-6 flex items-center">
                      <Link to={`/settlements/${settlement.id}`} className="w-full">
                        <Button className="w-full lg:w-auto bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200">
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SettlementsPage;