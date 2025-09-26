"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  User,
  Users,
  Settings,
  Truck,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut as authSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
type Role = 'admin' | 'partner';
interface SidebarProps {
  onLinkClick?: () => void;
  role?: Role;
}
export function Sidebar({ onLinkClick, role = 'admin' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await authSignOut({ 
        redirect: false,
        callbackUrl: "/auth/login"
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: Package,
    },
    {
      name: "Partners",
      href: "/admin/partners",
      icon: Users,
    }
  ];
  const partnerNavItems = [
    {
      name: "Dashboard",
      href: "/partner/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Orders",
      href: "/partner/orders",
      icon: Package,
    }
  ];
  const navItems = role === 'admin' ? adminNavItems : partnerNavItems;
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 overflow-y-auto bg-card md:static md:block">
      <div className="flex flex-col w-64  bg-card">
        <div className="flex flex-col flex-1 h-0">
          <div className="flex flex-col flex-1 px-4 overflow-y-auto">
            <div className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
