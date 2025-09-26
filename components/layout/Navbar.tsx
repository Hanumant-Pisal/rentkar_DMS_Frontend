"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  ChevronDown,
  User as UserIcon, 
  Package, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Truck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUser } from "@/utils/auth";
import {
  DropdownMenu,
  DropdownMenuContent,

  DropdownMenuItem,
  DropdownMenuLabel,
  
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}
interface NavbarProps {
  className?: string;
  onMenuClick?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    role?: 'admin' | 'partner';
  };
}
export default function Navbar({ className, onMenuClick, user: propUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(propUser);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  useEffect(() => {
    if (!user) {
      const storedUser = getUser();
      console.log('Stored user from localStorage:', storedUser);
      if (storedUser) {
        console.log('Setting user state:', storedUser);
        setUser(storedUser);
      } else {
        console.log('No user found in localStorage');
      }
    } else {
      console.log('User from props:', user);
    }
  }, []);
  const adminNavigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard'
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: Package,
      current: pathname?.startsWith('/admin/orders') ?? false
    },
    { 
      name: 'Partners', 
      href: '/admin/partners', 
      icon: UserIcon,
      current: pathname?.startsWith('/admin/partners') ?? false
    },
    { 
      name: 'Vehicles', 
      href: '/admin/vehicles', 
      icon: Truck,
      current: pathname?.startsWith('/admin/vehicles') ?? false
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      current: pathname?.startsWith('/admin/settings') ?? false
    },
  ];
  const partnerNavigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/partner/dashboard', 
      icon: LayoutDashboard,
      current: pathname === '/partner/dashboard'
    },
    { 
      name: 'My Orders', 
      href: '/partner/orders', 
      icon: Package,
      current: pathname?.startsWith('/partner/orders') ?? false
    },
    { 
      name: 'Profile', 
      href: '/partner/profile', 
      icon: UserIcon,
      current: pathname?.startsWith('/partner/profile') ?? false
    },
    { 
      name: 'Settings', 
      href: '/partner/settings', 
      icon: Settings,
      current: pathname?.startsWith('/partner/settings') ?? false
    },
  ];
  const navigation = isAdmin ? adminNavigation : partnerNavigation;
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    onMenuClick?.();
  };
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.setItem('preventLoginRedirect', 'true');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: false
      });
      window.localStorage.clear();
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
    } catch (error) {
      console.error('Error during sign out:', error);
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.href = '/auth/login';
    }
  };
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b border-white/10 bg-gradient-to-r from-gray-900 to-blue-900/80 backdrop-blur-lg", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:bg-white/10 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
          {}
          <Link href={isAdmin ? '/admin/dashboard' : '/partner/dashboard'} className="ml-2 flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Delivery Management 
            </span>
          </Link>
        </div>
        {}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-auto py-1.5 px-2 rounded-md hover:bg-white/10 flex items-center gap-2"
              >
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-cyan-300 text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white hidden sm:inline">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-300 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-gray-900 border-white/10 text-gray-100" 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email}
                  </p>
                  <p className="mt-4">
                  {
                    user?.role
                  }
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem 
                className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-md shadow-lg">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="flex h-16 items-center justify-between px-4">
                <span className="text-xl font-bold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-base font-medium rounded-md",
                        item.current
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-cyan-300 text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
