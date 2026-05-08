"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, differenceInDays } from "date-fns";
import { Send, Trash2, CloudUpload, Bell, Edit, MessageCircle, X, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, expiredMembers: 0, expiringSoon: 0, totalRevenue: 0 });
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Collection Filter State
  const [collectionMonth, setCollectionMonth] = useState(new Date().getMonth().toString());
  const [collectionYear, setCollectionYear] = useState(new Date().getFullYear().toString());
  
  const monthlyCollection = investors.filter(inv => {
    if (!inv.startDate) return false;
    const d = new Date(inv.startDate);
    return d.getMonth().toString() === collectionMonth && d.getFullYear().toString() === collectionYear;
  }).reduce((sum, inv) => sum + (Number(inv.feesPaid) || 0), 0);
  
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
  const [filterGroup, setFilterGroup] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Message Modal State
  const [messageModal, setMessageModal] = useState<{isOpen: boolean, investor: any}>({ isOpen: false, investor: null });
  const [festivalData, setFestivalData] = useState({ name: "Diwali", originalPrice: "", offerPrice: "" });
  const [showFestivalInputs, setShowFestivalInputs] = useState(false);

  // Renew Modal State
  const [renewModal, setRenewModal] = useState<{isOpen: boolean, investor: any}>({ isOpen: false, investor: null });
  const [renewData, setRenewData] = useState({ duration: "1 Month", additionalFees: "" });

  const fetchData = async () => {
    try {
      const [statsRes, invRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors/stats`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors`)
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
    const auth = localStorage.getItem("crm_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
    setIsAuthChecking(false);
  }, []);

  // Calculate Expiry automatically based on duration and start date ONLY when adding new member
  useEffect(() => {
    if (!editingId && formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      let months = 1;
      if (formData.duration === "3 Months") months = 3;
      if (formData.duration === "6 Months") months = 6;
      if (formData.duration === "1 Year") months = 12;
      if (formData.duration === "3 Years") months = 36;
      
      const expiry = new Date(start.setMonth(start.getMonth() + months));
      setFormData(prev => ({ ...prev, expiryDate: format(expiry, "yyyy-MM-dd") }));
    }
  }, [formData.startDate, formData.duration, editingId]);

  const resetForm = () => {
    setFormData({
      name: "",
      feesPaid: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      duration: "1 Month",
      telegramUsername: "",
      groupName: "Equity",
      membershipPlan: "Premium",
      expiryDate: ""
    });
    setEditingId(null);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors/${editingId}`, {
          ...formData,
          feesPaid: Number(formData.feesPaid)
        });
        alert("Member updated successfully!");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors`, {
          ...formData,
          feesPaid: Number(formData.feesPaid)
        });
        alert("Member saved successfully!");
      }
      fetchData();
      resetForm();
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
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredInvestors = investors.filter(inv => {
    if (filterGroup === "All") return true;
    return inv.groupName === filterGroup;
  });

  const sortedInvestors = [...filteredInvestors].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
  });

  const generateAndSendMessage = (type: string) => {
    const inv = messageModal.investor;
    if (!inv) return;
    
    let text = "";
    if (type === "7day") {
      text = `💎 *Premium Membership Update*\n\nDear ${inv.name},\nGreetings from Alpha Analyst!\n\nWe hope you are enjoying the exclusive market insights and premium trading signals in the *${inv.groupName}* group.\n\nThis is a gentle reminder that your premium access is scheduled for renewal in 7 days (${format(new Date(inv.expiryDate), 'dd/MM/yyyy')}). To ensure uninterrupted access to our high-accuracy trades, please process your renewal at your earliest convenience.\n\nBest Regards,\nTeam Alpha Analyst`;
    } else if (type === "3day") {
      text = `⚠️ *Important: Premium Access Expiring Soon*\n\nDear ${inv.name},\n\nYour premium membership for the *${inv.groupName}* group will expire in exactly 3 days.\n\nThe markets are highly volatile right now, and our upcoming premium setups are crucial. Don't risk losing your spot in the VIP circle.\n\nPlease renew today to secure your uninterrupted access to our elite trading signals.\n\nBest Regards,\nTeam Alpha Analyst`;
    } else if (type === "1day") {
      text = `🚨 *URGENT: Final Day of Premium Access*\n\nDear ${inv.name},\n\nThis is your final notice. Your premium access to the *${inv.groupName}* group expires TOMORROW.\n\nOur analysts have some highly profitable setups ready for the upcoming sessions, and we'd hate for you to miss out. Renew immediately to maintain your VIP status and keep receiving our premium signals.\n\nContact us now to complete your renewal process.\n\nBest Regards,\nTeam Alpha Analyst`;
    } else if (type === "expired") {
      text = `🚫 *Premium Membership Expired*\n\nDear ${inv.name},\n\nYour premium access to the *${inv.groupName}* group has officially EXPIRED, and your privileges have been restricted.\n\nWe highly value you as a premium member and would love to welcome you back. The market is full of opportunities right now that you are missing out on!\n\nTo regain instant access to our exclusive trading signals, please process your renewal immediately.\n\nBest Regards,\nTeam Alpha Analyst`;
    } else if (type === "festival") {
      if (!festivalData.originalPrice || !festivalData.offerPrice) {
        alert("Please enter original and offer prices.");
        return;
      }
      text = `🎉 *Exclusive ${festivalData.name} VIP Offer* 🎉\n\nDear ${inv.name},\n\nIn celebration of ${festivalData.name}, we are thrilled to offer you a special discount on your *${inv.groupName}* membership!\n\n🌟 Original Price: ~₹${festivalData.originalPrice}~\n🎁 Festival Offer: *₹${festivalData.offerPrice}*\n\nThis is a limited-time opportunity to upgrade or renew your premium access at a highly discounted rate. Secure your VIP spot now before the offer expires!\n\nReply to this message to claim your discount.\n\nBest Regards,\nTeam Alpha Analyst`;
    }
    
    let username = inv.telegramUsername ? inv.telegramUsername.replace('@', '').trim() : '';
    
    // Copy text to clipboard and open Telegram App if username exists
    navigator.clipboard.writeText(text).then(() => {
      if (!username) {
        alert("✅ Message copied!\n\nNo Telegram Username found, so Telegram couldn't open automatically.\nYou can manually open WhatsApp or Telegram and Paste (Ctrl+V) it.");
      } else {
        alert("✅ Message copied!\n\nTelegram App will now open. Just 'Paste' (Ctrl+V) the message there to send it.");
        const url = `tg://resolve?domain=${username}`;
        window.open(url, '_self');
      }
    }).catch(err => {
      console.error("Clipboard error:", err);
      if (username) {
        const url = `tg://resolve?domain=${username}`;
        window.open(url, '_self');
      } else {
        alert("Failed to copy message. Please add a valid Telegram Username first.");
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail === "alphxrk@gmail.com" && authPassword === "7756817683") {
      localStorage.setItem("crm_auth", "true");
      setIsAuthenticated(true);
      setAuthError(false);
      fetchData();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("crm_auth");
    setIsAuthenticated(false);
    setAuthEmail("");
    setAuthPassword("");
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModal.investor) return;
    try {
      const inv = renewModal.investor;
      
      // Calculate new expiry date
      let baseDate = new Date(inv.expiryDate);
      const today = new Date();
      if (baseDate < today) {
        baseDate = today; // If already expired, start from today
      }
      
      let months = 1;
      if (renewData.duration === "3 Months") months = 3;
      if (renewData.duration === "6 Months") months = 6;
      if (renewData.duration === "1 Year") months = 12;
      if (renewData.duration === "3 Years") months = 36;
      
      const newExpiry = new Date(baseDate.setMonth(baseDate.getMonth() + months));
      const oldFees = Number(inv.feesPaid) || 0;
      const additionalFees = Number(renewData.additionalFees) || 0;
      const totalFees = oldFees + additionalFees;

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/investors/${inv._id}`, {
        ...inv,
        expiryDate: newExpiry.toISOString(),
        feesPaid: totalFees,
        duration: renewData.duration
      });

      setRenewModal({ isOpen: false, investor: null });
      setRenewData({ duration: "1 Month", additionalFees: "" });
      alert("✅ Membership successfully extended!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to renew membership");
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center"><p className="text-gray-500 font-bold">Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0f172a] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">AA</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1e293b]">Alpha Analyst CRM</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Please login to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input required type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors" placeholder="••••••••" />
            </div>
            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-lg text-center">
                Invalid email or password. Please try again.
              </div>
            )}
            <button type="submit" className="w-full bg-[#0f172a] text-white font-bold rounded-lg py-3 hover:bg-[#1e293b] transition-all shadow-md hover:shadow-lg mt-2">
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-[#1e293b] text-xl font-extrabold tracking-tight">Alpha Analyst CRM</h1>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
        <button onClick={handleLogout} className="text-red-500 border border-red-100 bg-red-50 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm">
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
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtered Collection</p>
              <div className="flex gap-1">
                <select value={collectionMonth} onChange={e => setCollectionMonth(e.target.value)} className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none font-bold text-gray-600">
                  {Array.from({length: 12}).map((_, i) => (
                    <option key={i} value={i.toString()}>{format(new Date(2020, i, 1), "MMM")}</option>
                  ))}
                </select>
                <select value={collectionYear} onChange={e => setCollectionYear(e.target.value)} className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none font-bold text-gray-600">
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#10b981]">₹ {loading ? "..." : monthlyCollection}</p>
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
                <button type="button" onClick={resetForm} className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-500 underline">
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
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input required type="date" value={formData.expiryDate || ""} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
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
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#f8fafc]">
            <h2 className="text-lg font-bold text-[#1e293b]">Members List</h2>
            <div className="flex items-center gap-3">
              <select 
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
              >
                <option value="All">All Groups</option>
                <option value="Equity">Equity</option>
                <option value="Gold">Gold</option>
                <option value="Option">Option</option>
              </select>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="expiry">Expiry Date</option>
              </select>
            </div>
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
                          </p>
                          <div className="mt-1">
                            {isExpired ? (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Expired {Math.abs(daysLeft)} days ago</span>
                            ) : isExpiringSoon ? (
                              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">{daysLeft} Days Left</span>
                            ) : (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">{daysLeft} Days Left</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => { setMessageModal({ isOpen: true, investor: inv }); setShowFestivalInputs(false); }} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors">
                            <MessageCircle className="w-3 h-3" fill="currentColor" />
                            Message
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setRenewModal({ isOpen: true, investor: inv })} className="p-2 text-gray-400 hover:text-green-500 transition-colors" title="Renew / Extend">
                              <RefreshCw className="w-4 h-4" />
                            </button>
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

      {/* Messaging Modal */}
      {messageModal.isOpen && messageModal.investor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#f8fafc] p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#1e293b]">Send Message to {messageModal.investor.name}</h3>
                <p className="text-xs text-gray-500 font-medium">Valid until: {format(new Date(messageModal.investor.expiryDate), 'dd/MM/yyyy')}</p>
              </div>
              <button onClick={() => setMessageModal({ isOpen: false, investor: null })} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <button onClick={() => generateAndSendMessage('7day')} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-xl text-sm flex justify-between items-center transition-colors border border-blue-100">
                <span>1. Send 7-Day Reminder</span>
                <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase">Standard</span>
              </button>
              
              <button onClick={() => generateAndSendMessage('3day')} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 px-4 rounded-xl text-sm flex justify-between items-center transition-colors border border-orange-100">
                <span>2. Send 3-Day Reminder</span>
                <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded uppercase">Warning</span>
              </button>

              <button onClick={() => generateAndSendMessage('1day')} className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl text-sm flex justify-between items-center transition-colors border border-red-100">
                <span>3. Send 1-Day Reminder</span>
                <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded uppercase">Urgent</span>
              </button>

              <button onClick={() => generateAndSendMessage('expired')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl text-sm flex justify-between items-center transition-colors border border-gray-200">
                <span>4. Send Expired Alert</span>
                <span className="text-[10px] bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">Expired</span>
              </button>

              <hr className="my-4 border-gray-100" />

              {!showFestivalInputs ? (
                <button onClick={() => setShowFestivalInputs(true)} className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 px-4 rounded-xl text-sm flex justify-between items-center transition-colors border border-green-100">
                  <span>5. Send Festival Offer</span>
                  <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded uppercase">Discount</span>
                </button>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-green-800 text-sm">Create Offer</span>
                    <button onClick={() => setShowFestivalInputs(false)} className="text-xs text-green-600 underline">Cancel</button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">Festival Name</label>
                    <input type="text" value={festivalData.name} onChange={e => setFestivalData({...festivalData, name: e.target.value})} className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="e.g. Diwali, Holi" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">Original Price (₹)</label>
                      <input type="number" value={festivalData.originalPrice} onChange={e => setFestivalData({...festivalData, originalPrice: e.target.value})} className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">Offer Price (₹)</label>
                      <input type="number" value={festivalData.offerPrice} onChange={e => setFestivalData({...festivalData, offerPrice: e.target.value})} className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="e.g. 2999" />
                    </div>
                  </div>
                  <button onClick={() => generateAndSendMessage('festival')} className="w-full bg-green-600 text-white font-bold rounded-lg py-2.5 mt-2 hover:bg-green-700 transition-colors shadow-sm">
                    Generate & Send Offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewModal.isOpen && renewModal.investor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#f8fafc] p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#1e293b]">Renew {renewModal.investor.name}</h3>
                <p className="text-xs text-gray-500 font-medium">Current Expiry: {format(new Date(renewModal.investor.expiryDate), 'dd/MM/yyyy')}</p>
              </div>
              <button onClick={() => setRenewModal({ isOpen: false, investor: null })} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRenew} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Extend By</label>
                <select required value={renewData.duration} onChange={e => setRenewData({...renewData, duration: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Additional Fees Paid (₹)</label>
                <input required type="number" value={renewData.additionalFees} onChange={e => setRenewData({...renewData, additionalFees: e.target.value})} className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. 2999" />
              </div>
              
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                <p>New expiry will be added <b>on top of</b> their current active days.</p>
              </div>

              <button type="submit" className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition-colors mt-2 flex justify-center items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4" />
                Confirm Renewal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
