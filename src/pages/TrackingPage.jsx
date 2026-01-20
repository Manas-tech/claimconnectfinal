import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, FileText, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const TrackingPage = () => {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const storedClaims = JSON.parse(localStorage.getItem('claims') || '[]');
    setClaims(storedClaims);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending Review':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'Pending Review':
        return 33;
      case 'Under Review':
        return 66;
      case 'Approved':
        return 100;
      default:
        return 10;
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Your Claims - ClassAction Claims</title>
        <meta name="description" content="Monitor the status of your submitted class action settlement claims and track estimated payment dates." />
      </Helmet>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Track Your Claims
            </h1>
            <p className="text-xl text-slate-600">
              Monitor the status of your submitted settlement claims
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {claims.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Claims Yet</h2>
            <p className="text-slate-600 mb-6">
              You haven't submitted any claims yet. Browse available settlements to get started.
            </p>
            <a
              href="/settlements"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Settlements
            </a>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {getStatusIcon(claim.status)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {claim.settlementName}
                          </h2>
                          <p className="text-sm text-slate-500">Claim ID: {claim.id}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Claim Progress</span>
                      <span className="text-sm text-slate-500">{getProgressValue(claim.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(claim.status)} className="h-2" />
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Submitted</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(claim.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Est. Completion</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(claim.estimatedCompletion).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Claimant</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {claim.firstName} {claim.lastName}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Claim Amount</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {claim.claimAmount ? `$${claim.claimAmount}` : 'TBD'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Claim Submitted</p>
                          <p className="text-xs text-slate-500">
                            {new Date(claim.submittedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {claim.status === 'Pending Review' && (
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-100 p-1 rounded-full mt-0.5">
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Under Review</p>
                            <p className="text-xs text-slate-500">Expected completion in 60-90 days</p>
                          </div>
                        </div>
                      )}
                      {claim.status === 'Approved' && (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-1 rounded-full mt-0.5">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Claim Approved</p>
                              <p className="text-xs text-slate-500">Payment processing initiated</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Payment Pending</p>
                              <p className="text-xs text-slate-500">Estimated arrival in 14-21 days</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TrackingPage;