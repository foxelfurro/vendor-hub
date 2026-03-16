import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Search, ShoppingCart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin, isVendor } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const vendorLinks = [
    { title: 'My Inventory', description: 'Manage stock and prices', icon: Package, href: '/inventory' },
    { title: 'Explore Products', description: 'Browse catalog to add products', icon: Search, href: '/explore' },
    { title: 'Register Sale', description: 'Record a new sale', icon: ShoppingCart, href: '/sales' },
  ];

  const adminLinks = [
    { title: 'Manage Catalog', description: 'Add and edit master products', icon: BookOpen, href: '/admin/catalog' },
  ];

  const links = [...(isVendor || !isAdmin ? vendorLinks : []), ...(isAdmin ? adminLinks : [])];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="group flex items-start gap-4 rounded-lg border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <link.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground">{link.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
