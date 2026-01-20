import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>
          <p className="text-slate-500">Insights into claim trends and settlement performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Last 30 Days</Button>
          <Button>Download Report</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Conversion Rate</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">12.4%</div>
          <p className="text-sm text-green-600 font-medium">+2.1% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Avg. Claim Value</h3>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">$142.50</div>
          <p className="text-sm text-slate-500">Consistent with projections</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Processing Time</h3>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">4.2 Days</div>
          <p className="text-sm text-green-600 font-medium">-0.8 days efficiency gain</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col justify-center items-center text-center">
           <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
           <p className="text-slate-500">Claim Volume by Month Chart</p>
           <p className="text-xs text-slate-400 mt-2">(Visualization Placeholder)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col justify-center items-center text-center">
           <MapPin className="h-12 w-12 text-slate-300 mb-4" />
           <p className="text-slate-500">Geographic Distribution</p>
           <p className="text-xs text-slate-400 mt-2">(Map Placeholder)</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;