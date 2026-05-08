"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 shadow-xl max-w-2xl">
          <h2 className="text-xl font-bold mb-6 text-yellow-500">Telegram Bot Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bot Token</label>
              <input type="password" placeholder="Enter Telegram Bot Token" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Admin Chat ID</label>
              <input type="text" placeholder="Enter Admin Telegram ID for notifications" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none" />
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:opacity-90">
              Save Configuration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
