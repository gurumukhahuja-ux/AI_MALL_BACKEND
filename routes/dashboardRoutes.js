import express from "express"
import ChatSession  from "../models/ChatSession.js"
const router = express.Router();

// Dashboard Stats
// Matched to frontend: /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const sessionCount = await ChatSession.countDocuments();
    // In a real app, calculate actual token usage and active agents from DB
    res.json({
      totalChats: sessionCount,
      activeAgents: 4, 
      tokensUsed: 125000 + (sessionCount * 150), // Dynamic mock calculation
      savedTime: '12h 30m'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
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

router.post('/admin/settings', (req, res) => {
  adminSettings = { ...adminSettings, ...req.body };
  res.json(adminSettings);
});

export default router;
