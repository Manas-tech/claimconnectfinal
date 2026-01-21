import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Loader2, ArrowRight, Calendar, Package, AlertCircle, Shield, MapPin, Factory, Truck, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Lightweight CSV line parser to handle quoted commas
const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] || '';
    });
    return obj;
  });
};

const parseLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((c) => c.replace(/""/g, '"').trim());
};

const RecallsPage = () => {
  const [recalls, setRecalls] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecall, setSelectedRecall] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const loadRecalls = async () => {
      try {
        setLoading(true);
        const resp = await fetch('/recalls_recall_listing.csv');
        if (!resp.ok) throw new Error('Unable to load recalls CSV');
        const text = await resp.text();
        const parsed = parseCsv(text);
        // Map all CSV fields
        const mapped = parsed.slice(0, 200).map((r, idx) => ({
          id: r['Recall Number'] || `recall-${idx}`,
          recallNumber: r['Recall Number'] || '',
          productSafetyWarningNumber: r['Product Safety Warning Number'] || '',
          date: r['Date'] || '',
          productSafetyWarningDate: r['Product Safety Warning Date'] || '',
          heading: r['Recall Heading'] || 'Recall',
          product: r['Name of product'] || 'Product',
          description: r['Description'] || '',
          hazard: r['Hazard Description'] || '',
          consumerAction: r['Consumer Action'] || '',
          originalProductSafetyWarning: r['Original Product Safety Warning Announcement'] || '',
          remedyType: r['Remedy Type'] || '',
          units: r['Units'] || '',
          incidents: r['Incidents'] || '',
          remedy: r['Remedy'] || '',
          soldAtLabel: r['Sold At Label'] || '',
          soldAt: r['Sold At'] || '',
          importers: r['Importers'] || '',
          manufacturers: r['Manufacturers'] || '',
          distributors: r['Distributors'] || '',
          manufacturedIn: r['Manufactured In'] || '',
          customLabel: r['Custom Label'] || '',
          customField: r['Custom Field'] || '',
        }));
        setRecalls(mapped);
      } catch (err) {
        console.error('Error loading recalls:', err);
        setError('Failed to load recalls data.');
      } finally {
        setLoading(false);
      }
    };
    loadRecalls();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return recalls;
    return recalls.filter(
      (r) =>
        r.heading.toLowerCase().includes(term) ||
        r.product.toLowerCase().includes(term) ||
        r.hazard.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        (r.manufacturedIn && r.manufacturedIn.toLowerCase().includes(term)) ||
        (r.soldAt && r.soldAt.toLowerCase().includes(term))
    );
  }, [recalls, search]);

  const handleViewDetails = (recall) => {
    setSelectedRecall(recall);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Recalls | ClaimConnect</title>
      </Helmet>

      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-violet-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
              <AlertTriangle className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Product Safety</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Recalls & Safety Notices</h1>
            </div>
          </div>
          <p className="text-slate-300 max-w-3xl">
            Browse recent product recalls, safety warnings, and recommended consumer actions.
          </p>
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recalls by product, hazard, category..."
                className="pl-9 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading recalls...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No recalls found.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((recall, i) => (
                <motion.div
                  key={recall.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {recall.recallNumber && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            #{recall.recallNumber}
                          </Badge>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
                          {recall.heading}
                        </h3>
                      </div>
                      {recall.date && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                          <Calendar className="h-3 w-3" />
                          <span>{recall.date}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">{recall.product}</p>
                      </div>
                      
                      {recall.hazard && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 line-clamp-2">{recall.hazard.replace(/&nbsp;/g, ' ').substring(0, 120)}...</p>
                        </div>
                      )}

                      {recall.manufacturedIn && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>Made in {recall.manufacturedIn}</span>
                        </div>
                      )}

                      {recall.units && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary" className="text-xs">
                            {recall.units} units
                          </Badge>
                          {recall.remedyType && (
                            <Badge variant="outline" className="text-xs">
                              {recall.remedyType}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <Button 
                        variant="ghost" 
                        className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 justify-between group-hover:bg-amber-50 transition-colors"
                        onClick={() => handleViewDetails(recall)}
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 shadow-2xl">
          {selectedRecall && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {selectedRecall.recallNumber && (
                      <Badge variant="outline" className="mb-2">
                        Recall #{selectedRecall.recallNumber}
                      </Badge>
                    )}
                    <DialogTitle className="text-2xl font-bold text-slate-900 mt-2">
                      {selectedRecall.heading}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      {selectedRecall.product}
                    </DialogDescription>
                  </div>
                  {selectedRecall.date && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedRecall.date}</span>
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedRecall.description && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">Description</h4>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedRecall.description.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                )}

                {/* Hazard Description */}
                {selectedRecall.hazard && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <h4 className="font-semibold text-amber-900">Hazard Description</h4>
                    </div>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">
                      {selectedRecall.hazard.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                )}

                {/* Consumer Action */}
                {selectedRecall.consumerAction && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Consumer Action Required</h4>
                    </div>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {selectedRecall.consumerAction.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedRecall.remedyType && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Remedy Type</div>
                      <p className="text-sm font-medium text-slate-900">{selectedRecall.remedyType}</p>
                    </div>
                  )}

                  {selectedRecall.units && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Units Affected</div>
                      <p className="text-sm font-medium text-slate-900">{selectedRecall.units}</p>
                    </div>
                  )}

                  {selectedRecall.incidents && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Incidents</div>
                      <p className="text-sm font-medium text-slate-900">{selectedRecall.incidents}</p>
                    </div>
                  )}

                  {selectedRecall.remedy && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Remedy</div>
                      <p className="text-sm font-medium text-slate-900">{selectedRecall.remedy}</p>
                    </div>
                  )}
                </div>

                {/* Where Sold */}
                {(selectedRecall.soldAt || selectedRecall.soldAtLabel) && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">
                        {selectedRecall.soldAtLabel || 'Sold At'}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedRecall.soldAt.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                )}

                {/* Company Information */}
                {(selectedRecall.manufacturers || selectedRecall.importers || selectedRecall.distributors) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Company Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedRecall.manufacturers && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Manufacturers</div>
                          <p className="text-sm text-slate-700">{selectedRecall.manufacturers}</p>
                        </div>
                      )}
                      {selectedRecall.importers && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Importers</div>
                          <p className="text-sm text-slate-700">{selectedRecall.importers}</p>
                        </div>
                      )}
                      {selectedRecall.distributors && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Distributors</div>
                          <p className="text-sm text-slate-700">{selectedRecall.distributors}</p>
                        </div>
                      )}
                      {selectedRecall.manufacturedIn && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <div className="text-xs font-semibold text-slate-500 uppercase">Manufactured In</div>
                          </div>
                          <p className="text-sm text-slate-700">{selectedRecall.manufacturedIn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {selectedRecall.originalProductSafetyWarning && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Original Product Safety Warning</div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedRecall.originalProductSafetyWarning.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                )}

                {selectedRecall.productSafetyWarningNumber && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Product Safety Warning Number</div>
                    <p className="text-sm font-medium text-slate-900">{selectedRecall.productSafetyWarningNumber}</p>
                  </div>
                )}

                {selectedRecall.productSafetyWarningDate && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Product Safety Warning Date</div>
                    <p className="text-sm font-medium text-slate-900">{selectedRecall.productSafetyWarningDate}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecallsPage;
