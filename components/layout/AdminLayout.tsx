import { ReactNode, useState } from "react";
import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-blue-900 font-sans antialiased text-white">
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`fixed inset-y-16 left-0 z-40 w-64 transform bg-gray-900/80 backdrop-blur-md transition-all duration-300 ease-in-out md:relative md:inset-y-0 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
        >
          <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;