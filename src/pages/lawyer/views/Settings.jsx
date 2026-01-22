import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Mail, Database, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// CSV parser function
const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.toLowerCase().trim()] = cols[idx] || '';
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

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [manualEntry, setManualEntry] = useState({ name: '', email: '' });
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        loadEmailList(session.user.id);
      }
    };
    checkSession();
  }, []);

  const loadEmailList = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('email_database')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEmailList(data || []);
    } catch (err) {
      console.error('Error loading email list:', err);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      
      if (parsed.length === 0) {
        toast({
          title: "Empty File",
          description: "The CSV file appears to be empty.",
          variant: "destructive",
        });
        return;
      }

      // Find name and email columns (case-insensitive)
      const nameKey = Object.keys(parsed[0]).find(k => k.includes('name'));
      const emailKey = Object.keys(parsed[0]).find(k => k.includes('email'));

      if (!nameKey || !emailKey) {
        toast({
          title: "Invalid Format",
          description: "CSV must contain 'name' and 'email' columns.",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for insertion
      const emailsToInsert = parsed
        .filter(row => row[emailKey] && row[nameKey])
        .map(row => ({
          user_id: user.id,
          name: row[nameKey].trim(),
          email: row[emailKey].trim().toLowerCase(),
        }));

      if (emailsToInsert.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid name/email pairs found in CSV.",
          variant: "destructive",
        });
        return;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('email_database')
        .upsert(emailsToInsert, { onConflict: 'email,user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${emailsToInsert.length} email(s).`,
      });

      loadEmailList(user.id);
      e.target.value = '';
    } catch (err) {
      console.error('Error uploading CSV:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to upload CSV file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualEntry.name || !manualEntry.email) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_database')
        .upsert({
          user_id: user.id,
          name: manualEntry.name.trim(),
          email: manualEntry.email.trim().toLowerCase(),
        }, { onConflict: 'email,user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email added successfully.",
      });

      setManualEntry({ name: '', email: '' });
      loadEmailList(user.id);
    } catch (err) {
      console.error('Error adding email:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (id) => {
    try {
      const { error } = await supabase
        .from('email_database')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Email removed successfully.",
      });

      loadEmailList(user.id);
    } catch (err) {
      console.error('Error deleting email:', err);
      toast({
        title: "Error",
        description: "Failed to delete email.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
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

      {/* Database Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Database
            </h3>
          </div>
        </div>
        <div className="p-6">
          <Tabs defaultValue="emails" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="consumer">Consumer Database</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emails" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Upload CSV</h4>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Upload a CSV file with name and email columns</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      disabled={loading || !user}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading || !user}
                        className="cursor-pointer"
                        asChild
                      >
                        <span>Choose CSV File</span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Manual Entry</h4>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter name"
                          value={manualEntry.name}
                          onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                          disabled={loading || !user}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          value={manualEntry.email}
                          onChange={(e) => setManualEntry({ ...manualEntry, email: e.target.value })}
                          disabled={loading || !user}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading || !user}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Email
                    </Button>
                  </form>
                </div>

                {emailList.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Email List ({emailList.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {emailList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.email}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmail(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="consumer" className="mt-6">
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Consumer Database coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Session & Security Section */}
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

