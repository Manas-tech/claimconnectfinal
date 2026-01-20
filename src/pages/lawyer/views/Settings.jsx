import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Perform Supabase sign out and redirect to login
    await supabase.auth.signOut();
    navigate('/lawyer/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Firm Settings</h2>
        <p className="text-slate-500 text-sm">
          Manage your account and security preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Session &amp; Security
          </h3>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-red-50 p-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Sign out of attorney portal
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ends your current session on this device. You&apos;ll need to sign in again with Google or email to access the dashboard.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

