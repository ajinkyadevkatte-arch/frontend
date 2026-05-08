"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, differenceInDays } from "date-fns";
import { Send, Trash2, CloudUpload, Bell, Edit } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, expiredMembers: 0, expiringSoon: 0, totalRevenue: 0 });
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    feesPaid: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    duration: "1 Month",
    telegramUsername: "",
    groupName: "Equity",
    membershipPlan: "Standard",
    expiryDate: ""
  });

  const [sortOrder, setSortOrder] = useState<"newest" | "expiry">("newest");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, invRes] = await Promise.all([
        axios.get("http://localhost:5000/api/investors/stats"),
        axios.get("http://localhost:5000/api/investors")
      ]);
      setStats(statsRes.data);
      setInvestors(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate Expiry automatically based on duration and start date
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      let months = 1;
      if (formData.duration === "3 Months") months = 3;
      if (formData.duration === "6 Months") months = 6;
      if (formData.duration === "1 Year") months = 12;
      if (formData.duration === "3 Years") months = 36;
      
      const expiry = new Date(start.setMonth(start.getMonth() + months));
      setFormData(prev => ({ ...prev, expiryDate: format(expiry, "yyyy-MM-dd") }));
    }
  }, [formData.startDate, formData.duration]);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/investors/${editingId}`, {
          ...formData,
          feesPaid: Number(formData.feesPaid)
        });
        setEditingId(null);
        alert("Member updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/investors", {
          ...formData,
          feesPaid: Number(formData.feesPaid)
        });
        alert("Member saved successfully!");
      }
      fetchData();
      setFormData({
        ...formData,
        name: "",
        feesPaid: "",
        telegramUsername: ""
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save member");
    }
  };

  const handleEdit = (inv: any) => {
    setFormData({
      name: inv.name,
      feesPaid: inv.feesPaid.toString(),
      startDate: format(new Date(inv.startDate), "yyyy-MM-dd"),
      duration: inv.duration,
      telegramUsername: inv.telegramUsername,
      groupName: inv.groupName,
      membershipPlan: inv.membershipPlan,
      expiryDate: format(new Date(inv.expiryDate), "yyyy-MM-dd")
    });
    setEditingId(inv._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this member?")) {
      try {
        await axios.delete(`http://localhost:5000/api/investors/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const sortedInvestors = [...investors].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-[#1e293b] text-xl font-bold">Online Dashboard</h1>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            LIVE
          </span>
        </div>
        <button className="text-red-500 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded text-sm font-semibold transition-colors">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Collection</p>
            <p className="text-3xl font-extrabold text-[#1e293b]">₹ {stats.totalRevenue}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">This Month</p>
            <p className="text-3xl font-extrabold text-[#10b981]">₹ {loading ? "..." : stats.totalRevenue > 0 ? "4500" : "0" /* Mocking this month for now */}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Members</p>
            <p className="text-3xl font-extrabold text-[#3b82f6]">{stats.activeMembers}</p>
          </div>
        </div>

        {/* Add Member & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Add Member Form */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
            <h2 className="text-lg font-bold text-[#1e293b] flex items-center gap-2 mb-6">
              <CloudUpload className="w-5 h-5 text-blue-500" />
              {editingId ? "Edit Member" : "Add Member"}
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({...formData, name: "", feesPaid: "", telegramUsername: ""}); }} className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-500 underline">
                  Cancel Edit
                </button>
              )}
            </h2>
            <form onSubmit={handleSaveMember} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input required type="number" value={formData.feesPaid} onChange={e => setFormData({...formData, feesPaid: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan</label>
                  <select required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="3 Years">3 Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</label>
                  <select required value={formData.groupName} onChange={e => setFormData({...formData, groupName: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="Equity">Equity</option>
                    <option value="Gold">Gold</option>
                    <option value="Option">Option</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telegram No / Username</label>
                <input type="text" placeholder="Mobile Number" value={formData.telegramUsername} onChange={e => setFormData({...formData, telegramUsername: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className={`w-full text-white font-bold rounded-lg py-3 transition-colors mt-2 flex justify-center items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0f172a] hover:bg-[#1e293b]'}`}>
                {editingId ? "Update Member" : "Save Member"}
              </button>
            </form>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center min-h-[300px]">
            <div className="w-full max-w-sm bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded uppercase">{formData.groupName || "CAMPAIGN PASS"}</span>
                <Send className="w-6 h-6 opacity-80" />
              </div>
              
              <div className="mb-6">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Member Name</p>
                <h3 className="text-2xl font-bold truncate">{formData.name || "Name"}</h3>
              </div>

              <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Valid Until</p>
                  <p className="font-bold">{formData.expiryDate ? format(new Date(formData.expiryDate), "dd/MM/yyyy") : "07/06/2026"}</p>
                </div>
                <span className="bg-green-400 text-green-900 text-[10px] font-bold px-3 py-1 rounded">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
            <h2 className="text-lg font-bold text-[#1e293b]">Members List</h2>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Group</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fees</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valid Until</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Reminder</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : sortedInvestors.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">No members added yet.</td></tr>
                ) : (
                  sortedInvestors.map((inv) => {
                    const daysLeft = differenceInDays(new Date(inv.expiryDate), new Date());
                    const isExpired = daysLeft < 0;
                    const isExpiringSoon = daysLeft >= 0 && daysLeft <= 3;
                    
                    return (
                      <tr key={inv._id} className={`transition-colors ${isExpired ? 'bg-red-50 hover:bg-red-100' : isExpiringSoon ? 'bg-orange-50 hover:bg-orange-100' : 'bg-white hover:bg-gray-50'}`}>
                        <td className="p-4">
                          <p className="text-sm font-bold text-[#1e293b]">{inv.name}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${inv.groupName === 'Equity' ? 'bg-blue-100 text-blue-700' : inv.groupName === 'Gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'}`}>
                            {inv.groupName}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-[#10b981]">₹{inv.feesPaid}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                            {inv.duration.replace(" Month", " Mo").replace(" Months", " Mo").replace(" Year", " Yr").replace(" Years", " Yr")}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-[#ef4444]'}`}>
                            {format(new Date(inv.expiryDate), 'dd/MM/yyyy')}
                            {isExpired && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">Expired</span>}
                            {isExpiringSoon && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase">Expiring</span>}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors">
                            <Bell className="w-3 h-3" fill="currentColor" />
                            Send
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(inv)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Edit Member">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(inv._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete Member">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
