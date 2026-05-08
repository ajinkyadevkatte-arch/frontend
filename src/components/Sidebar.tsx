"use client";

import React from "react";
import { Home, Users, Settings, LogOut, BarChart2, Bell, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (val: boolean) => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Investors", href: "/investors", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMobileOpen?.(false)} />
      )}
      <div className={`fixed lg:sticky top-0 left-0 z-50 w-64 bg-[#111] border-r border-[#222] flex flex-col h-screen p-4 transition-transform transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center justify-between mb-10 mt-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
              I
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-600">
              Investor CRM
            </h1>
          </div>
          {setMobileOpen && (
            <button className="lg:hidden text-gray-400" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#2a220a] to-[#1a1505] text-yellow-500 border border-yellow-900/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-yellow-500" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}
