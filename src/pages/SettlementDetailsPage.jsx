import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Gavel,
  Landmark,
  ExternalLink,
  FileCheck,
  XCircle,
  ShieldCheck,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSettlements } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const SettlementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingCount, setTrackingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettlements();
        const found = data.find((s) => String(s.id) === String(id));
        setSettlement(found || null);
      } catch (error) {
        console.error('Error loading settlement details:', error);
        setSettlement(null);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      await checkAuth();
      await load();
    };
    
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [id]);

  useEffect(() => {
    if (settlement && isAuthenticated) {
      checkIfTracking();
    }
    if (settlement) {
      fetchTrackingCount();
    }
  }, [settlement, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    }
  };

  const checkIfTracking = async () => {
    if (!settlement) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsTracking(false);
      await fetchTrackingCount();
      return;
    }

    const { data, error } = await supabase
      .from('tracked_settlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('settlement_id', settlement.id)
      .limit(1);

    if (error) {
      console.error('Error checking tracking state:', error);
      setIsTracking(false);
    } else {
      setIsTracking((data || []).length > 0);
    }

    await fetchTrackingCount(user.id);
  };

  const handleTrackSettlement = async () => {
    if (!settlement) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate(`/track-claims?returnTo=/settlements/${id}`);
      toast({
        title: "Sign In Required",
        description: "Please sign in to track this settlement.",
      });
      return;
    }

    try {
      if (isTracking) {
        const { error } = await supabase
          .from('tracked_settlements')
          .delete()
          .eq('user_id', session.user.id)
          .eq('settlement_id', settlement.id);
        if (error) throw error;

        setIsTracking(false);
        await fetchTrackingCount(session.user.id);
        toast({
          title: "Settlement Removed",
          description: "This settlement is no longer being tracked.",
        });
      } else {
        const { error } = await supabase.from('tracked_settlements').insert({
          settlement_id: settlement.id,
          user_id: session.user.id,
          name: settlement.name,
          company: settlement.company,
          amount: settlement.amount,
          deadline: settlement.deadline || settlement.claimDeadlineText,
          estimated_payout: settlement.estimatedPayout,
          proof_of_purchase: settlement.proofOfPurchase,
          logo_url: settlement.logoUrl,
          claim_url: settlement.claimUrl,
        });
        if (error) throw error;

        setIsTracking(true);
        await fetchTrackingCount(session.user.id);
        toast({
          title: "Settlement Tracked",
          description: "This settlement has been added to your tracking list.",
        });
      }
    } catch (error) {
      console.error('Error tracking settlement:', error);
      toast({
        title: "Error",
        description: "Failed to track settlement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTrackingCount = async (userId) => {
    try {
      const { count, error } = await supabase
        .from('tracked_settlements')
        .select('id', { count: 'exact', head: true })
        .eq('settlement_id', settlement.id);
      if (error) throw error;
      setTrackingCount(count || 0);
      if (userId) {
        const { data: existing } = await supabase
          .from('tracked_settlements')
          .select('id')
          .eq('user_id', userId)
          .eq('settlement_id', settlement.id)
          .limit(1);
        setIsTracking((existing || []).length > 0);
      }
    } catch (err) {
      console.error('Error fetching tracking count:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading settlement details...</p>
        </div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-slate-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Settlement not found</h1>
          <p className="text-slate-600 mb-6">
            We couldn&apos;t find details for this settlement. It may no longer be available.
          </p>
          <Link to="/settlements">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Browse all settlements</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{settlement.name} - Settlement Details | ClaimConnect</title>
      </Helmet>

      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-violet-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-slate-200 hover:text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start gap-4 mb-4">
                {settlement.logoUrl && (
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    <img
                      src={settlement.logoUrl}
                      alt={settlement.company}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                      {settlement.name}
                    </h1>
                    {settlement.category && (
                      <Badge className="bg-violet-500/20 text-violet-100 border-violet-400/40">
                        {settlement.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-200 text-lg font-medium">
                    {settlement.company}
                  </p>
                </div>
              </div>

              {settlement.summary && (
                <p className="mt-4 text-slate-200/90 leading-relaxed max-w-3xl">
                  {settlement.summary}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur"
            >
              <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase mb-4">
                At a glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-900/60 rounded-xl">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-slate-300/80 text-xs uppercase tracking-wide">
                      Settlement Amount
                    </div>
                    <div className="text-base font-semibold">
                      {settlement.amount || 'Not specified'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-900/60 rounded-xl">
                    <Calendar className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-slate-300/80 text-xs uppercase tracking-wide">
                      Claim Deadline
                    </div>
                    <div className="text-base font-semibold">
                      {settlement.deadline
                        ? new Date(settlement.deadline).toLocaleDateString()
                        : settlement.claimDeadlineText || 'See official site'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-900/60 rounded-xl">
                    <FileText className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-slate-300/80 text-xs uppercase tracking-wide">
                      Est. Individual Payout
                    </div>
                    <div className="text-base font-semibold">
                      {settlement.estimatedPayout || 'Varies'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-900/60 rounded-xl">
                    {settlement.proofOfPurchase ? (
                      <FileCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-slate-300/80 text-xs uppercase tracking-wide">
                      Proof of Purchase
                    </div>
                    <div className="text-base font-semibold">
                      {settlement.proofOfPurchase ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleTrackSettlement}
                  className={`flex items-center gap-2 ${
                    isTracking
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-violet-500 hover:bg-violet-600 text-white'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isTracking ? 'fill-current' : ''}`} />
                  {isTracking ? 'Tracking Settlement' : 'Track Settlement'}
                </Button>
                {settlement.claimUrl && (
                  <a
                    href={settlement.claimUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="bg-violet-500 hover:bg-violet-600 text-white flex items-center gap-2">
                      Go to Official Claim Site
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Link to="/settlements">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Browse all settlements
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Case overview
              </h2>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <dt className="text-slate-500 mb-1 flex items-center gap-1">
                  <Landmark className="h-3.5 w-3.5 text-slate-400" />
                  Court
                </dt>
                <dd className="font-medium text-slate-900">
                  {settlement.court}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Case Number</dt>
                <dd className="font-medium text-slate-900">
                  {settlement.caseNumber}
                </dd>
              </div>
            </dl>

            {settlement.payoutDescription && (
              <div className="mt-2 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  How payouts are calculated
                </h3>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {settlement.payoutDescription}
                </p>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-sky-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Important notes
                </h2>
              </div>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li>This is a high-level summary based on publicly available settlement information.</li>
                <li>Always review the official claim site and notice documents before filing.</li>
                <li>Individual payouts can vary based on your purchases and number of valid claims.</li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default SettlementDetailsPage;

