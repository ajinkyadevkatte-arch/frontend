const express = require('express');
const router = express.Router();
const Investor = require('../models/Investor');

// Get all investors
router.get('/', async (req, res) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    res.json(investors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalMembers = await Investor.countDocuments();
    const activeMembers = await Investor.countDocuments({ status: 'Active' });
    const expiredMembers = await Investor.countDocuments({ status: 'Expired' });
    
    // Calculate expiring soon (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await Investor.countDocuments({
      status: 'Active',
      expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() }
    });

    const totalRevenueResult = await Investor.aggregate([
      { $group: { _id: null, total: { $sum: '$feesPaid' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      expiringSoon,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create investor
router.post('/', async (req, res) => {
  const investor = new Investor(req.body);
  try {
    const newInvestor = await investor.save();
    res.status(201).json(newInvestor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update investor
router.put('/:id', async (req, res) => {
  try {
    const updatedInvestor = await Investor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedInvestor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete investor
router.delete('/:id', async (req, res) => {
  try {
    await Investor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Investor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
