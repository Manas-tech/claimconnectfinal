import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  LayoutDashboard, 
  Briefcase, 
  Files, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Users,
  DollarSign,
  Gavel,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import CaseManager from '@/pages/lawyer/views/CaseManager';
import ClaimReview from '@/pages/lawyer/views/ClaimReview';
import Analytics from '@/pages/lawyer/views/Analytics';
import SettingsView from '@/pages/lawyer/views/Settings';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    activeCases: 0,
    casesAvailable: 25,
    settlementValue: '$0',
    totalClaimants: 0
  });
  const [loading, setLoading] = useState(true);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    notification: '',
    notificationDetails: '',
    recipientType: '',
    noOfApplicants: ''
  });
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  // Format time ago helper
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  };

  // Load activities
  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Load activities
        await loadActivities();

        // Load Active Cases (from claim_review_queue for this user)
        const { data: claimReviewData, error: claimError } = await supabase
          .from('claim_review_queue')
          .select('id')
          .eq('user_id', session.user.id);

        if (claimError) throw claimError;

        // Load all settlements to calculate totals
        const { getSettlements } = await import('@/lib/storage');
        const settlements = await getSettlements();

        // Get tracking counts for all settlements
        const { data: trackingData, error: trackingError } = await supabase
          .from('tracked_settlements')
          .select('settlement_id');

        const trackingCounts = {};
        if (!trackingError && trackingData) {
          trackingData.forEach((row) => {
            const key = String(row.settlement_id);
            trackingCounts[key] = (trackingCounts[key] || 0) + 1;
          });
        }

        // Calculate Settlement Value (sum of all amounts)
        let totalValue = 0;
        let totalClaimants = 0;

        settlements.forEach(settlement => {
          // Parse amount (e.g., "$125 Million" -> 125000000)
          const amountStr = settlement.amount || settlement.settlement_amount_total || '';
          const match = amountStr.match(/[\d.]+/);
          if (match) {
            const num = parseFloat(match[0]);
            if (amountStr.toLowerCase().includes('billion') || amountStr.toLowerCase().includes('b')) {
              totalValue += num * 1000000000;
            } else if (amountStr.toLowerCase().includes('million') || amountStr.toLowerCase().includes('m')) {
              totalValue += num * 1000000;
            } else if (amountStr.toLowerCase().includes('thousand') || amountStr.toLowerCase().includes('k')) {
              totalValue += num * 1000;
            } else {
              totalValue += num;
            }
          }

          // Sum claimants from tracking counts
          const settlementId = String(settlement.id);
          totalClaimants += trackingCounts[settlementId] || 0;
        });

        // Format settlement value
        let formattedValue = '$0';
        if (totalValue >= 1000000000) {
          formattedValue = `$${(totalValue / 1000000000).toFixed(1)}B`;
        } else if (totalValue >= 1000000) {
          formattedValue = `$${(totalValue / 1000000).toFixed(1)}M`;
        } else if (totalValue >= 1000) {
          formattedValue = `$${(totalValue / 1000).toFixed(1)}K`;
        } else {
          formattedValue = `$${totalValue.toLocaleString()}`;
        }

        // Format total claimants
        let formattedClaimants = '0';
        if (totalClaimants >= 1000000) {
          formattedClaimants = `${(totalClaimants / 1000000).toFixed(1)}M`;
        } else if (totalClaimants >= 1000) {
          formattedClaimants = `${(totalClaimants / 1000).toFixed(1)}K`;
        } else {
          formattedClaimants = totalClaimants.toLocaleString();
        }

        setStats({
          activeCases: claimReviewData?.length || 0,
          casesAvailable: 25,
          settlementValue: formattedValue,
          totalClaimants: formattedClaimants
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Set up real-time subscription for activity logs
    const channel = supabase
      .channel('activity_logs_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          setRecentActivities((prev) => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setIsSendingNotification(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to send notifications.",
          variant: "destructive",
        });
        return;
      }

      // Fetch emails from email_database
      const { data: emailData, error: emailError } = await supabase
        .from('email_database')
        .select('email, name')
        .eq('user_id', session.user.id);

      if (emailError) throw emailError;

      if (!emailData || emailData.length === 0) {
        toast({
          title: "No Emails Found",
          description: "Please add emails to your database first.",
          variant: "destructive",
        });
        return;
      }

      const recipients = emailData.map(item => ({
        email: item.email,
        name: item.name || 'Valued Client'
      }));

      // Send notification via API
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: notificationForm.notification,
          notificationDetails: notificationForm.notificationDetails,
          recipientType: notificationForm.recipientType,
          noOfApplicants: notificationForm.noOfApplicants,
          userId: session.user.id,
          recipients: recipients,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to send notifications' };
        }
        throw new Error(errorData.error || 'Failed to send notifications');
      }

      const result = await response.json();

      // Log activity
      const { error: activityError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          activity_type: 'notification_created',
          activity_title: `Notification broadcast initiated: ${notificationForm.notification}`,
          activity_description: `Notification payload dispatched to ${result.successful} recipient(s) via SMTP gateway. Recipient type: ${notificationForm.recipientType || 'N/A'}. Notification details: ${notificationForm.notificationDetails.substring(0, 100)}${notificationForm.notificationDetails.length > 100 ? '...' : ''}`,
          metadata: {
            notification: notificationForm.notification,
            recipientCount: result.successful,
            recipientType: notificationForm.recipientType,
            noOfApplicants: notificationForm.noOfApplicants
          }
        });

      if (activityError) {
        console.error('Error logging activity:', activityError);
      }

      toast({
        title: "Success",
        description: result.message || `Notification sent to ${result.successful} recipient(s).`,
      });

      setIsNotificationDialogOpen(false);
      setNotificationForm({ notification: '', notificationDetails: '', recipientType: '', noOfApplicants: '' });
    } catch (err) {
      console.error('Error sending notification:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to send notification emails.",
        variant: "destructive",
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <Button onClick={() => setIsNotificationDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Notification
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Cases', value: stats.activeCases.toLocaleString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cases Available', value: stats.casesAvailable.toLocaleString(), icon: Files, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Settlement Value', value: stats.settlementValue, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Claimants', value: stats.totalClaimants, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">+12% this week</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No recent activity
              </div>
            ) : (
              recentActivities.map((activity) => {
                const isNotification = activity.activity_type === 'notification_created';
                const iconBg = isNotification ? 'bg-blue-100' : 'bg-violet-100';
                const iconColor = isNotification ? 'text-blue-600' : 'text-violet-600';
                const Icon = isNotification ? Bell : Gavel;
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium">{activity.activity_title}</p>
                      {activity.activity_description && (
                        <p className="text-xs text-slate-600 mt-1">{activity.activity_description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Firm Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Claims Processed</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Client Satisfaction</span>
                <span className="font-bold">92%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">SLA Compliance</span>
                <span className="font-bold">98%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Send a notification to your selected recipients
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification">Notification</Label>
              <Input
                id="notification"
                placeholder="Enter notification title"
                value={notificationForm.notification}
                onChange={(e) => setNotificationForm({ ...notificationForm, notification: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notificationDetails">Notification Details</Label>
              <Textarea
                id="notificationDetails"
                placeholder="Enter notification details"
                value={notificationForm.notificationDetails}
                onChange={(e) => setNotificationForm({ ...notificationForm, notificationDetails: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientType">Recipient Type</Label>
              <Select
                value={notificationForm.recipientType}
                onValueChange={(value) => setNotificationForm({ ...notificationForm, recipientType: value })}
                required
              >
                <SelectTrigger id="recipientType">
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumer database">Consumer Database</SelectItem>
                  <SelectItem value="email list">Email List</SelectItem>
                  <SelectItem value="no. of applicants">No. of Applicants</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="noOfApplicants">No. of Applicants</Label>
              <Input
                id="noOfApplicants"
                type="number"
                placeholder="Enter number of applicants"
                value={notificationForm.noOfApplicants}
                onChange={(e) => setNotificationForm({ ...notificationForm, noOfApplicants: e.target.value })}
                min="0"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNotificationDialogOpen(false)} disabled={isSendingNotification}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingNotification}>
                {isSendingNotification ? 'Sending...' : 'Create Notification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LawyerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Supabase auth check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/lawyer/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/lawyer/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const navLinks = [
    { path: '/lawyer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/lawyer/dashboard/cases', label: 'Case Management', icon: Briefcase },
    { path: '/lawyer/dashboard/claims', label: 'Claim Review', icon: Files },
    { path: '/lawyer/dashboard/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { path: '/lawyer/dashboard/settings', label: 'Firm Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/lawyer/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Attorney Dashboard | ClaimConnect Legal</title>
      </Helmet>
      
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-slate-900 text-white w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} fixed md:relative z-20 h-full`}>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CC Legal</span>
          </div>

          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
             <button 
               onClick={handleLogout}
               className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2 w-full transition-colors text-sm font-medium"
             >
               <LogOut className="h-5 w-5" />
               Sign Out
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
               {/* Mobile toggle would go here */}
               <h1 className="text-xl font-semibold text-slate-800 hidden md:block">
                 {navLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'}
               </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search cases or claimants..." 
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative text-slate-500 hover:text-slate-700">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold text-slate-900">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Attorney'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user?.user_metadata?.role || 'Lawyer'}
                  </div>
                </div>
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Viewport */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="cases" element={<CaseManager />} />
                <Route path="claims" element={<ClaimReview />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<SettingsView />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default LawyerDashboard;