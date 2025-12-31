import express from 'express'
import agentModel from '../models/Agents.js'
import userModel from "../models/User.js"
import Transaction from "../models/Transaction.js"
import SupportTicket from "../models/SupportTicket.js"
import { verifyToken } from '../middleware/authorization.js'
const route = express.Router()

//get all agents (Public Marketplace - Only Live)
route.get("/", async (req, res) => {
  const agents = await agentModel.find({ status: 'Live' })
  res.status(200).json(agents)
})

//get vendor apps
route.get("/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const agents = await agentModel.find({ vendorId });
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendor apps' });
  }
})

//get users of vendor apps
route.get("/vendor-users/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    // 1. Get all agent IDs owned by this vendor
    const vendorAgents = await agentModel.find({ vendorId }).select('_id agentName');
    const agentIds = vendorAgents.map(a => a._id);

    // 2. Find users who have these agents
    const users = await userModel.find({ agents: { $in: agentIds } }).select('name email agents');

    // 3. Format response to include which app they use
    const userList = users.map(user => {
      // Find which of the user's agents belong to this vendor
      // For simplicity, just pick the first matching one or list them
      const userAgentIds = user.agents.map(id => id.toString());
      const ownedAgentNames = vendorAgents
        .filter(a => userAgentIds.includes(a._id.toString()))
        .map(a => a.agentName);

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        app: ownedAgentNames[0] || 'Unknown', // Primary app
        plan: 'Free' // Default to Free for now
      };
    });

    res.status(200).json(userList);
  } catch (err) {
    console.error("Error fetching vendor users:", err);
    res.status(500).json({ error: 'Failed to fetch vendor users' });
  }
})

//get app details (with usage breakdown)
route.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentModel.findById(id);

    if (!agent) return res.status(404).json({ error: 'App not found' });

    // Calculate usage: total users who own this agent
    const totalUsers = await userModel.countDocuments({ agents: id });

    // Mock plan breakdown (In a real app, this would query a Subscriptions model)
    // Real-time plan breakdown (Currently all users are counted as Free/Standard until Subscription model is added)
    const planBreakdown = [
      { name: 'Free', users: totalUsers },
      { name: 'Basic', users: 0 },
      { name: 'Pro', users: 0 },
    ];

    res.status(200).json({
      agent,
      usage: {
        totalUsers,
        planBreakdown
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
})

//deactivate app
route.patch("/:id/deactivate", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentModel.findByIdAndUpdate(id, { status: 'Inactive' }, { new: true });

    if (!agent) return res.status(404).json({ error: 'App not found' });

    res.status(200).json({ message: 'App deactivated successfully', agent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate app' });
  }
})


//reactivate app
route.patch("/:id/reactivate", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentModel.findByIdAndUpdate(id, { status: 'Live' }, { new: true });

    if (!agent) return res.status(404).json({ error: 'App not found' });

    res.status(200).json({ message: 'App reactivated successfully', agent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reactivate app' });
  }
})

//submit for review
route.patch("/:id/submit_review", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentModel.findByIdAndUpdate(id, { status: 'Under Review' }, { new: true });

    if (!agent) return res.status(404).json({ error: 'App not found' });

    res.status(200).json({ message: 'App submitted for review', agent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit app' });
  }
})

//update app (generic update, e.g. for URL)
route.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const agent = await agentModel.findByIdAndUpdate(id, updates, { new: true });

    if (!agent) return res.status(404).json({ error: 'App not found' });

    res.status(200).json({ message: 'App updated successfully', agent });
  } catch (err) {
    console.error("Update Agent Error:", err);
    res.status(500).json({ error: 'Failed to update app' });
  }
})

//delete app
route.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentModel.findByIdAndDelete(id);

    if (!agent) return res.status(404).json({ error: 'App not found' });

    // Also remove from users who own it (optional but good practice)
    await userModel.updateMany(
      { agents: id },
      { $pull: { agents: id } }
    );

    res.status(200).json({ message: 'App deleted successfully' });
  } catch (err) {
    console.error("Delete Agent Error:", err);
    res.status(500).json({ error: 'Failed to delete app' });
  }
})

//create agents
route.post('/', async (req, res) => {
  try {
    console.log("DEBUG: Received Agent Creation Request. Body:", req.body);
    const { agentName, description, category, avatar, url, vendorId, status, health, pricingModel } = req.body;

    // Generate simple slug from name + short timestamp to ensure uniqueness
    const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-6);

    const newAgent = new agentModel({
      agentName,
      slug,
      description,
      category: category || 'productivity',
      avatar: avatar || '/default-agent.png',
      url: url || '',
      vendorId: vendorId || null,
      status: status || 'Draft',
      health: health || 'All Good',
      pricingModel: pricingModel || 'free'
    });
    const savedAgent = await newAgent.save();
    res.status(201).json(savedAgent);
  } catch (err) {
    console.error('Agent creation error:', err);
    res.status(400).json({ error: 'Failed to create agent', details: err.message });
  }
});

//own agents
route.post('/buy/:id', async (req, res) => {
  try {
    const agentId = req.params.id;
    const { userId } = req.body;

    console.log("USER ID FROM BODY:", userId);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await userModel.findById(userId);

    // const index = user.agents.findIndex(agent => agent._id === agentId);

    // if (index !== -1) {
    //   // Remove the item
    //   user.agents.splice(index, 1);
    //   return res.status(200).json({
    //     message: "Agent added successfully",
    //     user
    //   });

    // }

    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    // Avoid duplicate agent entries
    if (!user.agents.includes(agentId)) {
      user.agents.push(agentId);
    } else {
      return res.status(400).json({ error: "Agent already owned" });
    }

    await user.save();

    res.status(200).json({
      message: "Agent added successfully",
      user
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//get My agents
route.post("/get_my_agents", async (req, res) => {
  const { userId } = req.body
  const user = await userModel.findById(userId).populate("agents")
  if (!user) {
    return res.status(404).send("User Not Found")
  }
  res.status(200).json(user)

})


// --- VENDOR DASHBOARD ENDPOINTS ---

// Get Vendor Transactions & Revenue Stats
route.get("/vendor/:vendorId/transactions", async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Fetch all transactions for this vendor
    const transactions = await Transaction.find({ vendorId }).sort({ date: -1 });

    // Calculate Totals using aggregation or simple reduce (simple for now)
    const grossRevenue = transactions
      .filter(t => t.type === 'Sale' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const payouts = transactions
      .filter(t => t.type === 'Payout' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const platformFees = transactions
      .filter(t => t.type === 'Fee')
      .reduce((sum, t) => sum + t.amount, 0);

    const netEarnings = grossRevenue - platformFees; // Simplified logic, usually Fees are deducted per transaction
    const pending = transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      summary: {
        grossRevenue,
        payouts,
        platformFees,
        netEarnings,
        pending
      },
      transactions
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get Vendor Support Tickets (User or Admin)
route.get("/vendor/:vendorId/support", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { type } = req.query; // 'UserSupport' or 'AdminSupport'

    const query = { vendorId };
    if (type) query.type = type;

    const tickets = await SupportTicket.find(query).sort({ updatedAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

export default route