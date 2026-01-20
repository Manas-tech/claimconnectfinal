import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 This feature isn't implemented yet",
      description: "You can request it in your next prompt! 🚀",
    });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                ClaimConnect
              </span>
            </Link>
            <p className="text-sm">
              Empowering consumers to easily access justice and claim their share of class action settlements.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/settlements" className="hover:text-white transition-colors text-sm">
                  Browse Settlements
                </Link>
              </li>
              <li>
                <Link to="/track-claims" className="hover:text-white transition-colors text-sm">
                  Track My Claim
                </Link>
              </li>
              <li>
                <Link to="/lawyer/login" className="hover:text-white transition-colors text-sm">
                  Lawyer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={handleLinkClick} className="hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {currentYear} ClaimConnect. All rights reserved.</p>
          <p className="mt-2">Disclaimer: This is a demo application. Do not use for real legal matters.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;