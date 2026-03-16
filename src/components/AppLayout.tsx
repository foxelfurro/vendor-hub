import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Search, ShoppingCart, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const vendorNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Explore', url: '/explore', icon: Search },
  { title: 'Sales', url: '/sales', icon: ShoppingCart },
];

const adminNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Catalog', url: '/admin/catalog', icon: BookOpen },
];

function AppSidebarContent() {
  const { user, logout, isAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const nav = isAdmin ? adminNav : vendorNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
            <Package className="h-5 w-5 text-primary shrink-0" />
            {!collapsed && <span className="font-semibold text-sm tracking-tight">Inventory Manager</span>}
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>{isAdmin ? 'Admin' : 'Management'}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <p className="text-xs text-muted-foreground truncate mb-2 px-2">{user?.email}</p>
          )}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b px-4 bg-card shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
