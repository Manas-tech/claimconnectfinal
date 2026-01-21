import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, FileText, Calendar, DollarSign, ArrowRight, LogIn, LogOut, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const TrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [claims, setClaims] = useState([]);
  const [trackedSettlements, setTrackedSettlements] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isProofsOpen, setIsProofsOpen] = useState(false);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [proofsSettlement, setProofsSettlement] = useState(null);

  useEffect(() => {
    checkAuth();
    loadClaims();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUser(session.user);
        setIsDialogOpen(false);
        loadClaims();
        loadTrackedSettlements(session.user.id);
        
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 500);
        }
      } else {
        setUser(null);
        setTrackedSettlements([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams, navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        setUser(session.user);
        loadTrackedSettlements(session.user.id);
      } else {
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClaims = () => {
    const storedClaims = JSON.parse(localStorage.getItem('claims') || '[]');
    setClaims(storedClaims);
  };

  const loadTrackedSettlements = async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('tracked_settlements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const normalized = (data || []).map((item) => ({
        id: item.settlement_id || item.id,
        name: item.name,
        company: item.company,
        amount: item.amount,
        deadline: item.deadline,
        estimatedPayout: item.estimated_payout,
        proofOfPurchase: item.proof_of_purchase,
        logoUrl: item.logo_url,
        claimUrl: item.claim_url,
      }));
      setTrackedSettlements(normalized);
    } catch (err) {
      console.error('Error loading tracked settlements:', err);
      setTrackedSettlements([]);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const returnTo = searchParams.get('returnTo');
      const redirectUrl = returnTo 
        ? `${window.location.origin}/track-claims?returnTo=${encodeURIComponent(returnTo)}`
        : `${window.location.origin}/track-claims`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setUser(data.session.user);
        loadTrackedSettlements(data.session.user.id);
        toast({
          title: "Welcome back!",
          description: "You can now track your claims.",
        });
        setIsDialogOpen(false);
        setEmail('');
        setPassword('');
        
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 500);
        }
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Please enter valid credentials.",
        variant: "destructive"
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
        if (data.session) {
          setUser(data.session.user);
          loadTrackedSettlements(data.session.user.id);
          setIsDialogOpen(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          
          const returnTo = searchParams.get('returnTo');
          if (returnTo) {
            setTimeout(() => {
              navigate(returnTo);
            }, 500);
          }
        } else {
          setIsSignUp(false);
        }
      }
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setTrackedSettlements([]);
      setIsAuthenticated(false);
      setIsDialogOpen(true);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to log out.",
        variant: "destructive",
      });
    }
  };

  const loadProofs = async (settlement) => {
    if (!settlement) return;
    try {
      setProofsLoading(true);
      setProofs([]);
      setProofsSettlement(settlement);

      const { data: attachments, error: attachmentsError } = await supabase
        .from('claim_attachments')
        .select('*')
        .eq('settlement_id', settlement.id)
        .order('created_at', { ascending: false });

      if (attachmentsError) throw attachmentsError;

      setProofs(attachments || []);
    } catch (err) {
      console.error('Error loading proofs:', err);
      toast({
        title: "Error",
        description: "Failed to load proofs for this settlement.",
        variant: "destructive",
      });
    } finally {
      setProofsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Track Your Claims - ClassAction Claims</title>
        <meta name="description" content="Monitor the status of your submitted class action settlement claims and track estimated payment dates." />
      </Helmet>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-white">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-base">
                {isSignUp 
                  ? 'Join thousands tracking their settlement claims' 
                  : 'Sign in to track your submitted claims and monitor progress'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 bg-white">
            <div className="mb-6 flex justify-center">
              <div className="bg-slate-100 rounded-xl p-1.5 border border-slate-200 inline-flex shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    !isSignUp
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isSignUp
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isAuthLoading}
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 font-semibold border-2 border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              {isGoogleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </span>
              )}
            </Button>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={isSignUp ? handleSignUp : handleLogin}>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={isSignUp ? "Minimum 6 characters" : "Enter your password"}
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Re-enter your password"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isAuthLoading || isGoogleLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isAuthLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proofs Dialog */}
      <Dialog open={isProofsOpen} onOpenChange={setIsProofsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-white/90 backdrop-blur border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Proofs & Documents
            </DialogTitle>
            <DialogDescription>
              {proofsSettlement?.name || 'Settlement'} — documents and comments (view only)
            </DialogDescription>
          </DialogHeader>

          {proofsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-600 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading proofs...
            </div>
          ) : proofs.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No documents or comments found for this settlement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proofs.map((attachment) => (
                <div
                  key={attachment.id}
                  className="bg-white rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      {attachment.file_name && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-900">
                            {attachment.file_name}
                          </span>
                        </div>
                      )}
                      {attachment.file_url && (
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Document
                        </a>
                      )}
                      {attachment.comment && (
                        <div className="mt-1">
                          <p className="text-xs text-slate-500 mb-1">Comment</p>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {attachment.comment}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        Added {new Date(attachment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                <FileText className="h-4 w-4" />
                Claim Tracking
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                Track Your Claims
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
                Monitor the status of your submitted settlement claims and stay updated on payment progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-slate-600">Signed in</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
              {!isAuthenticated && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Track
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {trackedSettlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Tracked Settlements</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {trackedSettlements.map((settlement, index) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {settlement.logoUrl && (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3 overflow-hidden">
                        <img
                          src={settlement.logoUrl}
                          alt={settlement.company}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      {settlement.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{settlement.company}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>{settlement.amount || 'Amount varies'}</span>
                      <Badge className="bg-blue-100 text-blue-700">Tracking</Badge>
                    </div>
                    <Link to={`/settlements/${settlement.id}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      className="w-full mt-2"
                      variant="ghost"
                      onClick={async () => {
                        await loadProofs(settlement);
                        setIsProofsOpen(true);
                      }}
                    >
                      Proofs
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {claims.length === 0 && trackedSettlements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center"
          >
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">No Claims Yet</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              You haven't submitted any claims yet. Browse available settlements to get started and claim what you're owed.
            </p>
            <a
              href="/settlements"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Browse Settlements
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        ) : (
          <>
            {claims.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Your Claims</h2>
                </div>
              </motion.div>
            )}
            <div className="space-y-6">
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200"
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
          </>
        )}
      </div>
    </>
  );
};

export default TrackingPage;