import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Download, AlertCircle, Loader2, Calendar, DollarSign, FileText, Gavel, X, Plus, Upload, Link as LinkIcon, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const ClaimReview = () => {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [currentClaimId, setCurrentClaimId] = useState(null);
  const [currentSettlementId, setCurrentSettlementId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState(null);
  const [formData, setFormData] = useState({
    documentUrl: '',
    comment: '',
    uploadedFile: null,
    fileName: ''
  });

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const { data, error } = await supabase
          .from('claim_review_queue')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setClaims(data || []);
      } catch (err) {
        console.error('Error loading claim review queue:', err);
        toast({
          title: "Error",
          description: "Failed to load claim review queue.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadClaims();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { error } = await supabase
        .from('claim_review_queue')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );

      toast({
        title: status === 'Approved' ? 'Claim Approved' : 'Claim Rejected',
        description: `Claim #${String(id).slice(-6)} has been updated.`,
        variant: status === 'Approved' ? 'default' : 'destructive'
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, DOC, DOCX, or image files only.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setFormData({ ...formData, uploadedFile: file, fileName: file.name });
    }
  };

  const uploadFileToSupabase = async (file, claimId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${claimId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAddDocument = async () => {
    if (!currentClaimId) return;

    if (!formData.uploadedFile && !formData.documentUrl && !formData.comment) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a document, URL, or comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingFile(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let fileUrl = formData.documentUrl;

      if (formData.uploadedFile) {
        fileUrl = await uploadFileToSupabase(formData.uploadedFile, currentClaimId);
      }

      if (editingAttachment) {
        // Update existing attachment
        const { error } = await supabase
          .from('claim_attachments')
          .update({
            file_url: fileUrl || editingAttachment.file_url,
            file_name: formData.fileName || editingAttachment.file_name,
            comment: formData.comment || null,
            settlement_id: currentSettlementId || editingAttachment.settlement_id || selectedClaim?.settlement_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAttachment.id);

        if (error) throw error;

        toast({
          title: "Updated",
          description: "Attachment has been updated successfully.",
        });
      } else {
        // Insert new attachment
        const { error } = await supabase
          .from('claim_attachments')
          .insert({
            claim_id: currentClaimId,
            settlement_id: currentSettlementId || selectedClaim?.settlement_id || null,
            user_id: session.user.id,
            file_url: fileUrl,
            file_name: formData.fileName || null,
            comment: formData.comment || null,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Document Added",
          description: "Document and comment have been saved successfully.",
        });
      }

      // Refresh attachments if viewing details
      if (selectedClaim && selectedClaim.id === currentClaimId) {
        await loadAttachments(currentClaimId);
      }

      setIsAddFormOpen(false);
      setFormData({ documentUrl: '', comment: '', uploadedFile: null, fileName: '' });
      setCurrentClaimId(null);
      setEditingAttachment(null);
    } catch (err) {
      console.error('Error saving document:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenAddForm = (claimId, attachment = null, settlementId = null) => {
    setCurrentClaimId(claimId);
    setCurrentSettlementId(settlementId);
    setEditingAttachment(attachment);
    if (attachment) {
      setFormData({
        documentUrl: attachment.file_url || '',
        comment: attachment.comment || '',
        uploadedFile: null,
        fileName: attachment.file_name || ''
      });
    } else {
      setFormData({ documentUrl: '', comment: '', uploadedFile: null, fileName: '' });
    }
    setIsAddFormOpen(true);
  };

  const loadAttachments = async (claimId) => {
    if (!claimId) return;
    try {
      setLoadingAttachments(true);
      const { data, error } = await supabase
        .from('claim_attachments')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAttachments(data || []);
    } catch (err) {
      console.error('Error loading attachments:', err);
      toast({
        title: "Error",
        description: "Failed to load attachments.",
        variant: "destructive",
      });
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      const { error } = await supabase
        .from('claim_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast({
        title: "Deleted",
        description: "Attachment has been deleted.",
      });
    } catch (err) {
      console.error('Error deleting attachment:', err);
      toast({
        title: "Error",
        description: "Failed to delete attachment.",
        variant: "destructive",
      });
    }
  };

  const filteredClaims = filter === 'all' 
    ? claims 
    : claims.filter(c => c.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Claim Review Queue</h2>
          <p className="text-slate-500">Review and adjudicate consumer claims</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Tabs defaultValue="all" onValueChange={(val) => setFilter(val === 'all' ? 'all' : val)}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All Claims</TabsTrigger>
                <TabsTrigger value="Pending Review">Pending</TabsTrigger>
                <TabsTrigger value="Approved">Approved</TabsTrigger>
                <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  placeholder="Search by ID or Name..." 
                />
              </div>
            </div>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading review queue...
              </div>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="h-8 w-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No claims found</h3>
               <p className="text-slate-500">There are no claims matching the current filter.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Settlement Amount</th>
                  <th className="px-6 py-4 font-semibold">Claim Deadline</th>
                  <th className="px-6 py-4 font-semibold">Case Number</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredClaims.map((claim) => (
                    <motion.tr 
                      key={claim.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 max-w-xs truncate">
                          {claim.title || claim.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          {claim.category || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {claim.settlement_amount_total || claim.amount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {claim.claim_deadline_date 
                          ? new Date(claim.claim_deadline_date).toLocaleDateString()
                          : claim.deadline 
                          ? new Date(claim.deadline).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-600">
                          {claim.case_number || claim.caseNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(claim.status || 'Pending Review')} border-0`}>
                          {claim.status || 'Pending Review'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOpenAddForm(claim.id)}
                            title="Add Document/Comment"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={async () => {
                              setSelectedClaim(claim);
                              setIsDetailsOpen(true);
                              await loadAttachments(claim.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {claim.status === 'Pending Review' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(claim.id, 'Approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(claim.id, 'Rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-md border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {selectedClaim?.title || selectedClaim?.name || 'Claim Details'}
            </DialogTitle>
            <DialogDescription>
              Complete information about this claim
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6 mt-4">
              {/* Main Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Title</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedClaim.title || selectedClaim.name || 'N/A'}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {selectedClaim.category || 'N/A'}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Category</span>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Settlement Amount</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedClaim.settlement_amount_total || selectedClaim.amount || 'N/A'}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Claim Deadline</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedClaim.claim_deadline_date 
                      ? new Date(selectedClaim.claim_deadline_date).toLocaleDateString()
                      : selectedClaim.deadline 
                      ? new Date(selectedClaim.deadline).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gavel className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Case Number</span>
                  </div>
                  <p className="text-sm font-mono text-slate-900">
                    {selectedClaim.case_number || selectedClaim.caseNumber || 'N/A'}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                  </div>
                  <Badge className={`${getStatusColor(selectedClaim.status || 'Pending Review')} border-0`}>
                    {selectedClaim.status || 'Pending Review'}
                  </Badge>
                </div>
              </div>

              {/* Additional Details */}
              {(selectedClaim.company || selectedClaim.estimatedPayout || selectedClaim.proofOfPurchase !== undefined) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedClaim.company && (
                      <div>
                        <span className="text-xs text-slate-500">Company</span>
                        <p className="text-sm font-medium text-slate-900">{selectedClaim.company}</p>
                      </div>
                    )}
                    {selectedClaim.estimatedPayout && (
                      <div>
                        <span className="text-xs text-slate-500">Estimated Payout</span>
                        <p className="text-sm font-medium text-slate-900">{selectedClaim.estimatedPayout}</p>
                      </div>
                    )}
                    {selectedClaim.proofOfPurchase !== undefined && (
                      <div>
                        <span className="text-xs text-slate-500">Proof of Purchase</span>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedClaim.proofOfPurchase ? 'Required' : 'Not Required'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents & Comments Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents & Comments
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAddForm(selectedClaim.id, null, selectedClaim.settlement_id)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {loadingAttachments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No documents or comments yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddForm(selectedClaim.id)}
                      className="mt-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {attachment.file_name && (
                              <div className="flex items-center gap-2 mb-2">
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
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {attachment.file_url.startsWith('http') ? 'View Document' : 'Download File'}
                              </a>
                            )}
                            {attachment.comment && (
                              <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-1">Comment:</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                  {attachment.comment}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              Added {new Date(attachment.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOpenAddForm(selectedClaim.id, attachment, selectedClaim.settlement_id)}
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                {selectedClaim.status === 'Pending Review' && (
                  <>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleStatusUpdate(selectedClaim.id, 'Approved');
                        setIsDetailsOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        handleStatusUpdate(selectedClaim.id, 'Rejected');
                        setIsDetailsOpen(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Document/Comment Dialog */}
      <Dialog open={isAddFormOpen} onOpenChange={(open) => {
        setIsAddFormOpen(open);
        if (!open) {
          setEditingAttachment(null);
          setCurrentSettlementId(null);
          setFormData({ documentUrl: '', comment: '', uploadedFile: null, fileName: '' });
        }
      }}>
        <DialogContent className="sm:max-w-2xl bg-white/80 backdrop-blur-md border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingAttachment ? 'Edit Document & Comment' : 'Add Document & Comment'}
            </DialogTitle>
            <DialogDescription>
              {editingAttachment 
                ? 'Update the document, URL, or comments for this claim'
                : 'Upload a document, add a URL, or provide comments for this claim'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-sm font-semibold text-slate-700">
                Upload Document (PDF, DOC, DOCX, or Image)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {formData.fileName && (
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {formData.fileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP
              </p>
            </div>

            {/* URL Field */}
            <div className="space-y-2">
              <Label htmlFor="documentUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Add URL for Supported Document
              </Label>
              <Input
                id="documentUrl"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={formData.documentUrl}
                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Enter a URL to an external document or resource
              </p>
            </div>

            {/* Comment/Discussion */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-semibold text-slate-700">
                Comment and Discussion
              </Label>
              <Textarea
                id="comment"
                placeholder="Add your comments, notes, or discussion points here..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="min-h-[150px] resize-y"
                rows={6}
              />
              <p className="text-xs text-slate-500">
                Add detailed comments, notes, or discussion points about this claim
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddFormOpen(false);
                setFormData({ documentUrl: '', comment: '', uploadedFile: null, fileName: '' });
                setCurrentClaimId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={uploadingFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingAttachment ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                <>
                  {editingAttachment ? (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Update Document
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Document
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClaimReview;