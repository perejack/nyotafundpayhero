import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Download, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  CreditCard,
  Mail,
  Briefcase,
  GraduationCap,
  Smartphone,
  Wallet,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { downloadFile, formatFileSize } from '@/lib/fileUpload';
import type { Database } from '@/lib/supabase';

type Application = Database['public']['Tables']['loan_applications']['Row'];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  under_review: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  under_review: AlertCircle,
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  under_review: 'Under Review',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
    totalAmount: 0,
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[Admin] Fetching applications...');
      
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[Admin] Query result:', { data, error, count: data?.length });

      if (error) {
        console.error('[Admin] Supabase error:', error);
        throw error;
      }

      setApplications(data || []);
      console.log('[Admin] Applications loaded:', data?.length || 0);
      
      // Calculate stats
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(a => a.status === 'pending').length || 0,
        approved: data?.filter(a => a.status === 'approved').length || 0,
        rejected: data?.filter(a => a.status === 'rejected').length || 0,
        underReview: data?.filter(a => a.status === 'under_review').length || 0,
        totalAmount: data?.reduce((sum, a) => sum + (a.loan_amount || 0), 0) || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDownload = async (path: string | null, baseFileName: string) => {
    if (!path) {
      toast({
        title: 'Error',
        description: 'File not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDownloadingFile(path);
      
      // Extract actual file extension from path
      const pathParts = path.split('.');
      const actualExt = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'pdf';
      const fileName = `${baseFileName}.${actualExt}`;
      
      const blob = await downloadFile(path);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Downloaded ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const updateStatus = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status } : app)
      );

      if (selectedApplication?.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, status } : null);
      }

      toast({
        title: 'Status Updated',
        description: `Application status changed to ${STATUS_LABELS[status]}`,
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.national_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mobile_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color,
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string;
    trend?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
              {trend && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  NYOTA Fund Admin
                </h1>
                <p className="text-xs text-muted-foreground">Loan Applications Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApplications}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            color="bg-blue-500/10 text-blue-600"
            trend="All time"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="bg-yellow-500/10 text-yellow-600"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="bg-green-500/10 text-green-600"
          />
          <StatCard
            title="Total Loan Value"
            value={`KES ${stats.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-500/10 text-purple-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Applications
                  </CardTitle>
                  
                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, ID, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <FileText className="w-12 h-12 mb-4 opacity-50" />
                      <p>No applications found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredApplications.map((app, index) => {
                        const StatusIcon = STATUS_ICONS[app.status];
                        return (
                          <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedApplication(app)}
                            className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                              selectedApplication?.id === app.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    {app.full_name?.charAt(0).toUpperCase()}
                                  </span>
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{app.full_name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    ID: {app.national_id} • {app.mobile_number}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      KES {app.loan_amount?.toLocaleString()}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {app.loan_type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={`${STATUS_COLORS[app.status]} border`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {STATUS_LABELS[app.status]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(app.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedApplication ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-24">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Application Details</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedApplication(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <select
                          value={selectedApplication.status}
                          onChange={(e) => updateStatus(selectedApplication.id, e.target.value as Application['status'])}
                          className={`h-8 rounded-md px-3 py-1 text-xs font-medium border ${STATUS_COLORS[selectedApplication.status]}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <Separator />

                      {/* Personal Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Full Name</p>
                            <p className="font-medium">{selectedApplication.full_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{selectedApplication.date_of_birth}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{selectedApplication.gender}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Education</p>
                            <p className="font-medium">{selectedApplication.education_level}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedApplication.mobile_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span>ID: {selectedApplication.national_id}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Loan Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Loan Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Loan Type</p>
                            <p className="font-medium">{selectedApplication.loan_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-medium">KES {selectedApplication.loan_amount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Purpose</p>
                            <p className="font-medium">{selectedApplication.purpose}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Outstanding Loan</p>
                            <p className="font-medium">{selectedApplication.has_outstanding_loan}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Financial Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-primary" />
                          Financial Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Monthly Income</p>
                            <p className="font-medium">KES {selectedApplication.monthly_income?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Income Source</p>
                            <p className="font-medium">{selectedApplication.income_source}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Other Income</p>
                            <p className="font-medium">{selectedApplication.has_other_income}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Income Type</p>
                            <p className="font-medium">{selectedApplication.income_type}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Device Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-primary" />
                          Device Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Phone Usage</p>
                            <p className="font-medium">{selectedApplication.phone_usage_duration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Owns Phone</p>
                            <p className="font-medium">{selectedApplication.owns_phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone Condition</p>
                            <p className="font-medium">{selectedApplication.phone_condition}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Documents */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-primary" />
                          Documents
                        </h4>
                        <div className="space-y-2">
                          {selectedApplication.id_front_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between"
                              onClick={() => handleDownload(
                                selectedApplication.id_front_path,
                                `ID_Front_${selectedApplication.national_id}`
                              )}
                              disabled={downloadingFile === selectedApplication.id_front_path}
                            >
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                ID Front
                              </span>
                              {downloadingFile === selectedApplication.id_front_path ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          
                          {selectedApplication.id_back_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between"
                              onClick={() => handleDownload(
                                selectedApplication.id_back_path,
                                `ID_Back_${selectedApplication.national_id}`
                              )}
                              disabled={downloadingFile === selectedApplication.id_back_path}
                            >
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                ID Back
                              </span>
                              {downloadingFile === selectedApplication.id_back_path ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          
                          {selectedApplication.kra_pin_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between"
                              onClick={() => handleDownload(
                                selectedApplication.kra_pin_path,
                                `KRA_PIN_${selectedApplication.national_id}`
                              )}
                              disabled={downloadingFile === selectedApplication.kra_pin_path}
                            >
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                KRA PIN
                              </span>
                              {downloadingFile === selectedApplication.kra_pin_path ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Metadata */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Applied: {new Date(selectedApplication.created_at).toLocaleString()}</p>
                        <p>Last Updated: {new Date(selectedApplication.updated_at).toLocaleString()}</p>
                        <p>Referral: {selectedApplication.referral_source}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-muted-foreground"
                >
                  <Eye className="w-12 h-12 mb-4 opacity-50" />
                  <p>Select an application to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
