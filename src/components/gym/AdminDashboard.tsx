import { useState, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientCard } from './ClientCard';
import { ClientDetailModal } from './ClientDetailModal';
import { EditClientModal } from './EditClientModal';
import { SendEmailModal } from './SendEmailModal';
import { PaymentModal } from './PaymentModal';
import { ExportPdfModal, ExportOptions } from './ExportPdfModal';
import { BirthdayAlertModal } from './BirthdayAlertModal';
import { PendingPaymentsModal, isPaymentReminderInCooldown } from './PendingPaymentsModal';
import { FestivalEmailModal } from './FestivalEmailModal';
import { isBirthdayEmailInCooldown } from './BirthdayAlertModal';
import { Client } from '@/types/gym';
import { useToast } from '@/hooks/use-toast';
import { calculateDiscountedPrice } from '@/utils/pricing';
import { 
  Search, Users, LogOut, CreditCard, TrendingUp, 
  UserPlus, Dumbbell, Download, Cake, IndianRupee, PartyPopper
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function AdminDashboard() {
  const { clients, loading, adminLogout, deleteClient, getClientBySearch } = useGym();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [emailClient, setEmailClient] = useState<Client | null>(null);
  const [paymentClient, setPaymentClient] = useState<Client | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [showFestivalEmail, setShowFestivalEmail] = useState(false);
  const [, forceUpdate] = useState(0);
  
  // Callback to refresh counts when email is sent
  const handleEmailSent = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  const filteredClients = getClientBySearch(searchTerm);

  // Count today's birthdays (excluding those in cooldown)
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const birthdayCount = clients.filter((client) => {
    if (!client.dob) return false;
    // Skip if birthday email already sent (in cooldown)
    if (isBirthdayEmailInCooldown(client.clientId)) return false;
    let dobDate: Date;
    if (client.dob.includes('-')) {
      const parts = client.dob.split('-');
      if (parts[0].length === 4) {
        dobDate = new Date(client.dob);
      } else {
        dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else if (client.dob.includes('/')) {
      const parts = client.dob.split('/');
      dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      return false;
    }
    return dobDate.getMonth() + 1 === todayMonth && dobDate.getDate() === todayDay;
  }).length;

  // Count pending payments (excluding those in cooldown)
  const pendingPaymentsCount = clients.filter((client) => {
    // Skip if reminder already sent (in cooldown)
    if (isPaymentReminderInCooldown(client.clientId)) return false;
    const totalPaid = client.payments?.reduce((sum, p) => sum + p.paidAmount, 0) || 0;
    const totalAmount = client.finalAmount || calculateDiscountedPrice(client.membershipType, client.membershipPeriod);
    return totalAmount - totalPaid > 0;
  }).length;

  const handleDelete = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await deleteClient(clientId);
      toast({
        title: "Client Deleted",
        description: "The client has been removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const getMembershipTypes = (membershipType: Client['membershipType']) => {
    const types = [];
    if (membershipType.gym) types.push('Gym');
    if (membershipType.cardio) types.push('Cardio');
    if (membershipType.crossfit) types.push('Crossfit');
    if (membershipType.pt) types.push('PT');
    return types.join(', ') || 'None';
  };

  const handleExportPDF = (options: ExportOptions) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Filter clients by date range
    let filteredData = [...clients];
    if (options.startDate || options.endDate) {
      filteredData = clients.filter(client => {
        const clientDate = new Date(client.createdAt);
        const start = options.startDate ? new Date(options.startDate) : null;
        const end = options.endDate ? new Date(options.endDate) : null;
        
        if (start && end) {
          return clientDate >= start && clientDate <= end;
        } else if (start) {
          return clientDate >= start;
        } else if (end) {
          return clientDate <= end;
        }
        return true;
      });
    }

    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Gym Database Report', 14, yPos);
    yPos += 10;
    
    // Subtitle with date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, yPos);
    yPos += 6;
    
    if (options.startDate || options.endDate) {
      doc.text(`Date Range: ${options.startDate || 'Start'} to ${options.endDate || 'End'}`, 14, yPos);
      yPos += 6;
    }

    // Clients Section
    if (options.sections.clients || options.sections.all) {
      doc.text(`Total Members: ${filteredData.length} | Active: ${filteredData.filter(c => new Date(c.endDate) > new Date()).length}`, 14, yPos);
      yPos += 10;

      const clientTableData = filteredData.map((client) => [
        client.clientId,
        client.name,
        client.mobile,
        client.email,
        client.gender,
        getMembershipTypes(client.membershipType),
        client.slot,
        new Date(client.startDate).toLocaleDateString('en-IN'),
        new Date(client.endDate).toLocaleDateString('en-IN'),
        new Date(client.endDate) > new Date() ? 'Active' : 'Expired',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Client ID', 'Name', 'Mobile', 'Email', 'Gender', 
          'Membership', 'Slot', 'Start Date', 'End Date', 'Status'
        ]],
        body: clientTableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Payments Section
    if (options.sections.payments || options.sections.all) {
      const allPayments: any[] = [];
      filteredData.forEach(client => {
        (client.payments || []).forEach(payment => {
          allPayments.push({
            clientId: client.clientId,
            clientName: payment.clientName || client.name,
            membershipPeriod: payment.membershipPeriod || client.membershipPeriod,
            ...payment
          });
        });
      });

      if (allPayments.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text('Payment Records', 14, yPos);
        yPos += 8;

        const paymentTableData = allPayments.map(p => {
          const baseAmount = p.amount || 0;
          const finalAmount = p.finalAmount || baseAmount;
          const discountAmount = baseAmount - finalAmount;
          const paidDateTime = p.paidDate ? new Date(p.paidDate) : null;
          const dateStr = paidDateTime && !isNaN(paidDateTime.getTime()) 
            ? paidDateTime.toLocaleDateString('en-IN') 
            : 'N/A';
          const timeStr = paidDateTime && !isNaN(paidDateTime.getTime()) 
            ? paidDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
            : '';
          
          return [
            p.clientId,
            p.clientName,
            `${p.membershipPeriod || '-'} month${(p.membershipPeriod || 0) > 1 ? 's' : ''}`,
            `₹${baseAmount.toLocaleString()}`,
            `₹${discountAmount.toLocaleString()} (${p.offerDiscount || 0}%)`,
            `₹${finalAmount.toLocaleString()}`,
            `₹${(p.paidAmount || 0).toLocaleString()}`,
            `${dateStr} ${timeStr}`,
            p.discountType || p.notes || '-'
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Client ID', 'Name', 'Period', 'Base Amt', 'Discount', 'Final Amt', 'Paid', 'Date & Time', 'Offer/Note']],
          body: paymentTableData,
          styles: { fontSize: 7 },
          headStyles: { fillColor: [39, 174, 96] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 30 },
            2: { cellWidth: 22 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 },
            5: { cellWidth: 25 },
            6: { cellWidth: 22 },
            7: { cellWidth: 35 },
            8: { cellWidth: 'auto' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    doc.save(`gym-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: `Report exported successfully.`,
    });
  };

  const totalRevenue = clients.reduce((sum, client) => {
    const payments = client.payments || [];
    return sum + payments.reduce((pSum, p) => pSum + p.paidAmount, 0);
  }, 0);

  const activeMembers = clients.filter(c => new Date(c.endDate) > new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your gym members and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowExportModal(true)} className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={adminLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Alert Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 relative"
          onClick={() => setShowBirthdayModal(true)}
        >
          <Cake className="w-6 h-6 text-primary" />
          <span className="font-medium">Birthdays Today</span>
          {birthdayCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold">
              {birthdayCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 relative"
          onClick={() => setShowPendingPayments(true)}
        >
          <IndianRupee className="w-6 h-6 text-destructive" />
          <span className="font-medium">Pending Payments</span>
          {pendingPaymentsCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-bold">
              {pendingPaymentsCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowFestivalEmail(true)}
        >
          <PartyPopper className="w-6 h-6 text-gym-gold" />
          <span className="font-medium">Festival Email</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <Dumbbell className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold">{activeMembers}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gym-gold/20">
              <CreditCard className="w-6 h-6 text-gym-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {clients.filter(c => {
                  const created = new Date(c.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, mobile, or client ID..."
              className="pl-12 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {searchTerm ? `Search Results (${filteredClients.length})` : `All Members (${clients.length})`}
          </h2>
        </div>

        {filteredClients.length === 0 ? (
          <Card variant="glass">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Members Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'No members registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.clientId}
                client={client}
                onView={setSelectedClient}
                onEdit={setEditingClient}
                onDelete={handleDelete}
                onSendEmail={setEmailClient}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onAddPayment={() => {
            setPaymentClient(selectedClient);
            setSelectedClient(null);
          }}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
        />
      )}

      {emailClient && (
        <SendEmailModal
          client={emailClient}
          onClose={() => setEmailClient(null)}
        />
      )}

      {paymentClient && (
        <PaymentModal
          client={paymentClient}
          onClose={() => setPaymentClient(null)}
        />
      )}

      <ExportPdfModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onSubmit={handleExportPDF}
      />

      {showBirthdayModal && (
        <BirthdayAlertModal
          clients={clients}
          onClose={() => setShowBirthdayModal(false)}
          onEmailSent={handleEmailSent}
        />
      )}

      {showPendingPayments && (
        <PendingPaymentsModal
          clients={clients}
          onClose={() => setShowPendingPayments(false)}
          onAddPayment={(client) => setPaymentClient(client)}
          onEmailSent={handleEmailSent}
        />
      )}

      {showFestivalEmail && (
        <FestivalEmailModal
          clients={clients}
          onClose={() => setShowFestivalEmail(false)}
        />
      )}
    </div>
  );
}
