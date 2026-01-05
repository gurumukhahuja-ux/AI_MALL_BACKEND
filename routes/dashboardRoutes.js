import express from "express";
import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js";
import Agent from "../models/Agents.js";
import Report from "../models/Report.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
const router = express.Router();

// Dashboard Stats
// Matched to frontend: /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const sessionCount = await ChatSession.countDocuments();
    const liveAgentsCount = await Agent.countDocuments({ status: 'active' });

    res.json({
      totalChats: sessionCount,
      activeAgents: liveAgentsCount,
      tokensUsed: 125000 + (sessionCount * 150), // Dynamic mock calculation
      savedTime: '12h 30m'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin Overview Stats
// Matched to frontend: /api/admin/stats
router.get('/admin/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      agents,
      activeAgentsCount,
      pendingApprovalsCount,
      openComplaintsCount,
      recentAgents,
      recentReports,
      financialsData,
      usageCountsData
    ] = await Promise.all([
      User.countDocuments(),
      Agent.find(),
      Agent.countDocuments({ status: 'active' }),
      Agent.countDocuments({ reviewStatus: 'Pending Review' }),
      Report.countDocuments({ status: 'open' }),
      Agent.find().sort({ createdAt: -1 }).limit(3),
      Report.find().sort({ timestamp: -1 }).limit(3),
      Transaction.aggregate([
        { $match: { status: 'Success' } },
        {
          $group: {
            _id: null,
            grossSales: { $sum: "$amount" },
            platformFee: { $sum: "$platformFee" },
            netEarnings: { $sum: "$netAmount" }
          }
        }
      ]),
      User.aggregate([
        { $match: { agents: { $exists: true, $not: { $size: 0 } } } },
        { $unwind: "$agents" },
        { $group: { _id: "$agents", count: { $sum: 1 } } }
      ])
    ]);

    const usageMap = (usageCountsData || []).reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const financials = financialsData[0] || { grossSales: 0, platformFee: 0, netEarnings: 0 };

    // Format recent activity
    const recentActivity = [
      ...recentAgents.map(a => ({
        type: 'agent',
        user: 'System',
        detail: `New agent ${a.agentName} deployed`,
        time: a.createdAt
      })),
      ...recentReports.map(r => ({
        type: 'report',
        user: r.userId || 'Anonymous',
        detail: `New ${r.type} issue: ${r.description.substring(0, 30)}...`,
        time: r.timestamp
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    res.json({
      totalUsers: totalUsers,
      activeAgents: activeAgentsCount,
      pendingApprovals: pendingApprovalsCount,
      totalRevenue: financials.grossSales,
      openComplaints: openComplaintsCount,
      recentActivity,
      financials: {
        grossSales: financials.grossSales,
        platformFee: financials.platformFee,
        netEarnings: financials.netEarnings,
        status: financials.grossSales > 0 ? 'Active' : 'N/A',
        nextPayout: financials.grossSales > 0 ? 'Processing' : 'Pending Sales'
      },
      inventory: agents.map(a => ({
        id: a._id,
        name: a.agentName,
        description: a.description || '',
        url: a.url || '',
        category: a.category || '',
        pricing: a.pricing || 'Free',
        status: a.status || 'inactive',
        reviewStatus: a.reviewStatus || 'Draft',
        avatar: a.avatar || '/AGENTS_IMG/default.png',
        usageCount: usageMap[a._id.toString()] || 0
      }))
    });
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});


// Automations (Mock Data stored in memory for demo)
let automations = [
  { id: '1', name: 'Daily Diary', description: 'Summarize unread emails at 9 AM', active: true, type: 'Email' },
  { id: '2', name: 'Lead Qualifier', description: 'Score incoming leads from CRM', active: false, type: 'CRM' },
  { id: '3', name: 'Code Reviewer', description: 'Auto-review PRs on GitHub', active: true, type: 'Dev' },
];

router.get('/automations', (req, res) => {
  res.json(automations);
});

router.post('/automations/:id/toggle', (req, res) => {
  const { id } = req.params;
  const auto = automations.find(a => a.id === id);
  if (auto) {
    auto.active = !auto.active;
    res.json(auto);
  } else {
    res.status(404).json({ error: 'Automation not found' });
  }
});

// Admin Settings (Mock Data)
let adminSettings = {
  allowPublicSignup: true,
  defaultModel: 'gemini-2.5-flash',
  maxTokensPerUser: 1000000,
  organizationName: 'My Tech Corp'
};

router.get('/admin/settings', (req, res) => {
  res.json(adminSettings);
});

// ... existing imports ...

// Add POST /admin/settings/maintenance
router.post('/admin/settings/maintenance', async (req, res) => {
  try {
    const { enabled } = req.body;

    // Update setting
    adminSettings.maintenanceMode = enabled;

    // Broadcast notification if enabled
    if (enabled) {
      const users = await User.find({}, '_id');
      const notifications = users.map(user => ({
        userId: user._id,
        message: "The system is currently in maintenance mode. Some features may be unavailable.",
        type: 'system',
        read: false,
        timestamp: new Date()
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json({ success: true, maintenanceMode: enabled, message: enabled ? "Maintenance mode enabled and users notified." : "Maintenance mode disabled." });
  } catch (error) {
    console.error("Maintenance toggle error:", error);
    res.status(500).json({ error: "Failed to update maintenance mode" });
  }
});

router.post('/admin/settings', (req, res) => {
  adminSettings = { ...adminSettings, ...req.body };
  res.json(adminSettings);
});

export default router;
