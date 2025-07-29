import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  BookOpen,
  Home,
  Users,
  FileText,
  BarChart3,
  Award,
  Shield,
  X,
  Menu,
  LogOut,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: string[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["student", "admin", "compliance"],
  },
  {
    name: "Training Catalog",
    href: "/catalog",
    icon: BookOpen,
    roles: ["student", "admin", "compliance"],
  },
  {
    name: "My Certificates",
    href: "/certificates",
    icon: Award,
    roles: ["student"],
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Content Management",
    href: "/admin/content",
    icon: FileText,
    roles: ["admin"],
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin", "compliance"],
  },
  {
    name: "Audit Logs",
    href: "/admin/audit",
    icon: Shield,
    roles: ["admin", "compliance"],
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out Successfully",
        description: "You have been logged out. Redirecting to login page.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredNavigation = navigation.filter(
    (item) => user && user.roles.some(role => item.roles.includes(role))
  );

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname.startsWith("/dashboard");
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-foreground">GxP LMS</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={
                  item.href.includes("/dashboard")
                    ? item.href.replace(
                        "/dashboard",
                        `/dashboard/${user?.roles[0]}`
                      )
                    : item.href
                }
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActivePath(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.roles[0]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="gxp-sidebar">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-semibold text-foreground">GxP LMS</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={
                  item.href.includes("/dashboard")
                    ? item.href.replace(
                        "/dashboard",
                        `/dashboard/${user?.roles[0]}`
                      )
                    : item.href
                }
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActivePath(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.roles[0]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="gxp-header flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.first_name} {user?.last_name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        {/* Page content */}
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
