import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, TrendingUp, ShieldCheck, Smartphone, ArrowRight, Apple, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettlements } from '@/lib/storage';

// Parse amount string to numeric value for sorting
const parseAmountToNumber = (amountStr) => {
  if (!amountStr || amountStr === 'Not specified' || amountStr === 'Varies') return 0;
  
  const str = amountStr.replace(/[^0-9.BMK]/g, '');
  const numeric = parseFloat(str);
  
  if (isNaN(numeric)) return 0;
  
  if (amountStr.includes('B')) return numeric * 1_000_000_000;
  if (amountStr.includes('M')) return numeric * 1_000_000;
  if (amountStr.includes('K')) return numeric * 1_000;
  
  return numeric;
};

const HomePage = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const settlements = await getSettlements();
        
        // Sort by settlement amount (highest first) and take top 3
        const sorted = [...settlements]
          .sort((a, b) => parseAmountToNumber(b.amount) - parseAmountToNumber(a.amount))
          .slice(0, 3)
          .map(s => ({
            id: s.id,
            company: s.company,
            type: s.category || 'Class Action',
            amount: s.amount,
            hot: true
          }));
        
        setTrending(sorted);
      } catch (error) {
        console.error('Error loading trending settlements:', error);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrending();
  }, []);
  return <>
      <Helmet>
        <title>ClaimConnect - Get Paid What You're Owed</title>
        <meta name="description" content="The easiest way to find and file class action settlements. Download the app or browse online." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-600 blur-[120px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"> {/* Reduced padding here */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.6
          }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-sm font-medium text-white/90">2,400+ Active Settlements</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                Your Money.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
                  Your Rights.
                </span><br />
                Your App.
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-lg leading-relaxed">Discover class action settlements you may be eligible for. File claims quickly and track your compensation - all from your phone.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://apps.apple.com/us/app/zapsettle/id6749248728" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-transform active:scale-95 shadow-xl shadow-white/10"
                >
                  <Apple className="h-6 w-6" />
                  <div className="text-left leading-none">
                    <div className="text-[10px] font-medium uppercase text-slate-500">Download on the</div>
                    <div className="text-base">App Store</div>
                  </div>
                </a>
                <button className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-transform active:scale-95">
                  <Play className="h-6 w-6 fill-current" />
                  <div className="text-left leading-none">
                    <div className="text-[10px] font-medium uppercase text-slate-400">Get it on</div>
                    <div className="text-base">Google Play</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs overflow-hidden">
                       <img alt={`User ${i}`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1695232536513-550dfcb74069" />
                    </div>)}
                </div>
                <p>Trusted by 1.2M+ claimants</p>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 40
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="relative hidden lg:block">
              <div className="relative z-10 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                 <img alt="App Interface Mockup" className="rounded-[2.5rem] border-8 border-slate-800 shadow-2xl shadow-violet-500/20 mx-auto max-w-[320px]" src="https://images.unsplash.com/photo-1569144157595-7a2d2e32258f" />
              </div>
              
              {/* Floating Elements */}
              <motion.div animate={{
              y: [0, -10, 0]
            }} transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }} className="absolute top-20 -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl z-20 max-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-green-400">Payment Received</span>
                </div>
                <div className="text-2xl font-bold text-white">$124.50</div>
                <div className="text-xs text-slate-400">TechCorp Settlement</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Trending Now 🔥</h2>
              <p className="text-lg text-slate-500">Everyone's filing for these right now.</p>
            </div>
            <Link to="/settlements" className="hidden md:flex items-center gap-2 text-violet-600 font-bold hover:gap-3 transition-all">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading trending settlements...</p>
              </div>
            ) : trending.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-600">No settlements available.</p>
              </div>
            ) : (
              trending.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    delay: i * 0.1
                  }}
                  className="group relative bg-slate-50 rounded-3xl p-8 hover:bg-slate-900 hover:text-white transition-all duration-300 border border-slate-100 hover:border-slate-800 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1"
                >
                  <div className="mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      {item.type}
                    </span>
                    <h3 className="text-2xl font-bold mb-1">{item.company}</h3>
                    <div className="text-sm text-slate-500 group-hover:text-slate-400">Class Action</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-sm font-medium opacity-60 mb-1">Settlement Amount</div>
                    <div className="text-4xl font-black tracking-tight text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all">
                      {item.amount}
                    </div>
                  </div>
                  <Link to={`/settlements/${item.id}`}>
                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/settlements">
              <Button size="lg" className="w-full bg-slate-900 text-white rounded-xl py-6">Browse All Settlements</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recalls Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Important Updates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Product Recalls</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay informed about recent product recalls and safety notices that may affect you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Automotive Safety Recall",
                category: "Vehicles",
                date: "January 2025",
                description: "Major automaker issues recall for airbag system in select models",
                severity: "High"
              },
              {
                title: "Consumer Electronics Recall",
                category: "Electronics",
                date: "December 2024",
                description: "Battery safety issue prompts recall of popular smartphone models",
                severity: "Medium"
              },
              {
                title: "Food & Beverage Recall",
                category: "Food Safety",
                date: "January 2025",
                description: "Contamination concerns lead to voluntary recall of packaged goods",
                severity: "High"
              }
            ].map((recall, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {recall.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    recall.severity === 'High' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {recall.severity}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{recall.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{recall.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{recall.date}</span>
                  <Link to="/recalls">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View Recall
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/recalls">
              <Button variant="outline" size="lg" className="border-slate-300 hover:bg-slate-50">
                View All Recalls
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - Bento Grid Style */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Easy Money.</h2>
            <p className="text-xl text-slate-600">No lawyers needed. Just you and the app.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Step 1 */}
            <motion.div whileHover={{
            scale: 1.02
          }} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">1. Find Your Match</h3>
                <p className="text-slate-500 text-lg max-w-md">Our algorithm scans active settlements to find the ones that match your purchase history and digital footprint.</p>
              </div>
              <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-[-10deg]">
                <Search className="w-64 h-64" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div whileHover={{
            scale: 1.02
          }} className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">2. Tap to File</h3>
                <p className="text-white/80">Fill out simple forms in seconds. Upload proof directly from your camera roll.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div whileHover={{
            scale: 1.02
          }} className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">3. Get Paid</h3>
                <p className="text-slate-400">Direct deposit, PayPal, or Venmo. We track it until it hits your account.</p>
              </div>
            </motion.div>

            {/* Stat Card */}
            <motion.div whileHover={{
            scale: 1.02
          }} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center gap-8">
              <div className="flex-1">
                <h3 className="text-4xl font-black text-slate-900 mb-2">$2.5 Billion+</h3>
                <p className="text-slate-500 font-medium">Recovered for consumers like you.</p>
              </div>
              <div className="hidden sm:flex -space-x-4">
                 {[1, 2, 3].map(i => <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                       <img alt={`Happy user ${i}`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1695754422870-b7073b364756" />
                    </div>)}
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    +1M
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
               <div className="absolute top-[-50%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600 blur-[100px]"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                Don't leave money<br />on the table.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="https://apps.apple.com/us/app/zapsettle/id6749248728" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-14 px-8 rounded-full bg-white text-slate-900 font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Apple className="w-5 h-5" /> App Store
                </a>
                <button className="h-14 px-8 rounded-full bg-transparent border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" /> Google Play
                </button>
              </div>
              <div className="mt-8">
                <Link to="/settlements" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">
                  Or continue on the web
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>;
};
export default HomePage;