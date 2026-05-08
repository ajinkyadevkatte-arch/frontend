"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export function AddInvestorModal({ isOpen, onClose, onAdded }: { isOpen: boolean, onClose: () => void, onAdded: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    telegramUsername: "",
    telegramUserId: "",
    membershipPlan: "Premium",
    groupName: "VIP Forex",
    startDate: "",
    expiryDate: "",
    duration: "1 Month",
    feesPaid: "",
    paymentMethod: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/investors", {
        ...formData,
        feesPaid: Number(formData.feesPaid)
      });
      onAdded();
      onClose();
    } catch (error) {
      console.error("Error adding investor:", error);
      alert("Failed to add investor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[#222]">
          <h2 className="text-xl font-bold text-yellow-500">Add New Investor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Mobile Number</label>
              <input type="text" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telegram Username</label>
              <input type="text" value={formData.telegramUsername} onChange={e => setFormData({...formData, telegramUsername: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telegram User ID</label>
              <input type="text" value={formData.telegramUserId} onChange={e => setFormData({...formData, telegramUserId: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Group Name *</label>
              <input required type="text" value={formData.groupName} onChange={e => setFormData({...formData, groupName: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Membership Plan *</label>
              <input required type="text" value={formData.membershipPlan} onChange={e => setFormData({...formData, membershipPlan: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Duration *</label>
              <select required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none">
                <option value="1 Month">1 Month</option>
                <option value="3 Month">3 Month</option>
                <option value="6 Month">6 Month</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fees Paid ($) *</label>
              <input required type="number" value={formData.feesPaid} onChange={e => setFormData({...formData, feesPaid: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date *</label>
              <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date *</label>
              <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
              <input type="text" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-[#333] text-gray-300 rounded-lg hover:bg-[#222]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
              {loading ? "Adding..." : "Add Investor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
