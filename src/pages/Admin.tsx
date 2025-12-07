import { GymHeader } from '@/components/gym/GymHeader';
import { AdminLogin } from '@/components/gym/AdminLogin';
import { AdminDashboard } from '@/components/gym/AdminDashboard';
import { useGym } from '@/context/GymContext';

const Admin = () => {
  const { isAdminLoggedIn } = useGym();

  return (
    <div className="min-h-screen bg-background">
      <GymHeader />
      <main className="container mx-auto px-4 py-8">
        {isAdminLoggedIn ? <AdminDashboard /> : <AdminLogin />}
      </main>
    </div>
  );
};

export default Admin;
