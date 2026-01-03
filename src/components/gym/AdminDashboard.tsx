import { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientCard } from './ClientCard';
import { ClientDetailModal } from './ClientDetailModal';
import { EditClientModal } from './EditClientModal';
import { SendEmailModal } from './SendEmailModal';
import { PaymentModal } from './PaymentModal';
import { Client } from '@/types/gym';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Users, LogOut, CreditCard, TrendingUp, 
  UserPlus, Dumbbell, Download 
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Title
    doc.setFontSize(20);
    doc.text('Gym Members Report', 14, 20);
    
    // Subtitle with date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    doc.text(`Total Members: ${clients.length} | Active: ${activeMembers}`, 14, 34);

    // Table data
    const tableData = clients.map((client) => [
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
      `₹${(client.payments || []).reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[
        'Client ID', 'Name', 'Mobile', 'Email', 'Gender', 
        'Membership', 'Slot', 'Start Date', 'End Date', 'Status', 'Paid'
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`gym-members-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: `${clients.length} client records exported successfully.`,
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
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={adminLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
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
    </div>
  );
}
