import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import SettlementsPage from '@/pages/SettlementsPage';
import SettlementDetailsPage from '@/pages/SettlementDetailsPage';
import ClaimFormPage from '@/pages/ClaimFormPage';
import TrackingPage from '@/pages/TrackingPage';
import LawyerLogin from '@/pages/lawyer/LawyerLogin';
import LawyerDashboard from '@/pages/lawyer/LawyerDashboard';
import Footer from '@/components/Footer'; // Import the new Footer component
import { Toaster } from '@/components/ui/toaster';
import { initializeStorage } from '@/lib/storage';

const AppContent = () => {
  const location = useLocation();
  const isLawyerRoute = location.pathname.startsWith('/lawyer');

  return (
    <div className={`min-h-screen flex flex-col ${isLawyerRoute ? 'bg-slate-100' : 'bg-slate-50'}`}>
      {!isLawyerRoute && <Header />}
      <main className="flex-grow"> {/* main tag to ensure footer sticks to bottom */}
        <Routes>
          {/* Consumer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/settlements" element={<SettlementsPage />} />
          <Route path="/settlements/:id" element={<SettlementDetailsPage />} />
          <Route path="/file-claim/:id" element={<ClaimFormPage />} />
          <Route path="/track-claims" element={<TrackingPage />} />

          {/* Lawyer Routes */}
          <Route path="/lawyer/login" element={<LawyerLogin />} />
          <Route path="/lawyer/dashboard/*" element={<LawyerDashboard />} />
        </Routes>
      </main>
      <Footer /> {/* Render the Footer component */}
      <Toaster />
    </div>
  );
};

function App() {
  useEffect(() => {
    initializeStorage().catch(console.error);
  }, []);

  return (
    <Router>
      <Helmet>
        <title>ClaimConnect - Class Action Platform</title>
      </Helmet>
      <AppContent />
    </Router>
  );
}

export default App;