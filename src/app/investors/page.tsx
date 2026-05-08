"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AddInvestorModal } from "@/components/AddInvestorModal";
import { 
  Users, Search, Filter, MoreVertical, Edit, Trash2, 
  Send, Plus, Download, Menu
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

export default function InvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/investors");
      setInvestors(res.data);
    } catch (error) {
      console.error("Failed to fetch investors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/investors/${id}`);
        fetchInvestors();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const filteredInvestors = investors.filter(inv => 
    inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.telegramUsername && inv.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase())) ||
    inv.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investor Management</h1>
              <p className="text-sm md:text-base text-gray-400 mt-1">Manage your telegram members and subscriptions.</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] text-white font-medium rounded-lg hover:bg-[#1a1a1a] transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Plus className="w-4 h-4" />
              Add Investor
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#111] p-4 rounded-xl border border-[#222]">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name, username, or group..." 
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            <select className="bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-yellow-500/50">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Expired</option>
            </select>

            <select className="bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-yellow-500/50">
              <option>All Groups</option>
              <option>VIP Forex</option>
              <option>Crypto Signals</option>
              <option>Options Mastery</option>
            </select>
          </div>
        </div>

        {/* Investors Table */}
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#222]">
                  <th className="p-4 text-sm font-semibold text-gray-400">Investor</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Telegram Info</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Group / Plan</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Timeline</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading investors...</td></tr>
                ) : filteredInvestors.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">No investors found.</td></tr>
                ) : (
                  filteredInvestors.map((inv) => (
                    <tr key={inv._id} className="hover:bg-[#161616] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a220a] to-[#1a1505] border border-yellow-900/50 flex items-center justify-center text-yellow-500 font-bold shrink-0">
                            {inv.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white truncate max-w-[150px]">{inv.name}</p>
                            <p className="text-xs text-gray-500">Fees: ${inv.feesPaid}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-blue-400 hover:underline cursor-pointer truncate max-w-[120px]">{inv.telegramUsername || "N/A"}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white font-medium truncate max-w-[150px]">{inv.groupName}</p>
                        <p className="text-xs text-yellow-600 font-semibold">{inv.membershipPlan} ({inv.duration})</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-300">Started: {format(new Date(inv.startDate), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-500">Expires: {format(new Date(inv.expiryDate), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                          inv.status === 'Active' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Message via Telegram">
                            <Send className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-[#222] rounded-lg transition-colors" title="Edit Investor">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(inv._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AddInvestorModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={fetchInvestors} 
      />
    </div>
  );
}
