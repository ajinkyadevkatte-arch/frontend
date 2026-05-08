const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String },
  telegramUsername: { type: String },
  telegramUserId: { type: String },
  membershipPlan: { type: String, required: true },
  groupName: { type: String, required: true },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  duration: { type: String, enum: ['1 Month', '3 Months', '6 Months', '1 Year', '3 Years'], required: true },
  feesPaid: { type: Number, required: true },
  paymentMethod: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Investor', investorSchema);
