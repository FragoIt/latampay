'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: '⚡ Quick Checkout', href: '/dashboard/checkout', icon: '⚡' },
    { name: '📋 Rentas Activas', href: '/dashboard/rentals', icon: '📋' },
    { name: '👥 Clientes', href: '/dashboard/clients', icon: '👥' },
    { name: '📦 Inventario', href: '/dashboard/inventory', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile header */}
      <div className="md:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-bold tracking-tight">
          <span className="text-amber-400">R</span>entazt
        </span>
        <Link
          href="/dashboard/checkout"
          className="bg-amber-500 text-neutral-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          + Renta
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-64 bg-neutral-900 h-full p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <span className="text-xl font-bold text-white tracking-tight">
                <span className="text-amber-400">R</span>entazt
              </span>
              <p className="text-xs text-neutral-400 mt-1">Quick Checkout System</p>
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`${isActive
                      ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-400'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-l-2 border-transparent'
                    } flex items-center px-3 py-2.5 text-sm font-medium rounded-r-md transition-all duration-150`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name.replace(/^[^\s]+ /, '')}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-56">
            <div className="flex flex-col h-full bg-neutral-900">
              <div className="pt-6 pb-4 px-5">
                <span className="text-xl font-bold text-white tracking-tight">
                  <span className="text-amber-400">R</span>entazt
                </span>
                <p className="text-xs text-neutral-500 mt-1">Quick Checkout System</p>
              </div>
              <nav className="flex-1 px-3 space-y-0.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${isActive
                          ? 'bg-amber-500/15 text-amber-400 border-l-2 border-amber-400'
                          : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border-l-2 border-transparent'
                        } flex items-center px-3 py-2.5 text-sm font-medium rounded-r-md transition-all duration-150`}
                    >
                      <span className="mr-3 text-base">{item.icon}</span>
                      {item.name.replace(/^[^\s]+ /, '')}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-3 pb-4">
                <div className="border-t border-neutral-800 pt-3">
                  <div className="px-3 py-2 rounded-lg bg-neutral-800/50">
                    <p className="text-xs text-neutral-500">Versión MVP</p>
                    <p className="text-xs text-amber-400/80 font-medium">v0.1.0 — Feb 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-4 md:py-6">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
