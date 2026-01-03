import express from 'express'
import mongoose from 'mongoose'
import agentModel from '../models/Agents.js'
import userModel from "../models/User.js"
import notificationModel from "../models/Notification.js"
import transactionModel from "../models/Transaction.js"
import { verifyToken } from '../middleware/authorization.js'
const route = express.Router()

//get all agents
route.get("/", async (req, res) => {
  const agents = await agentModel.find()
  res.status(200).json(agents)
})

// own agents
route.post('/buy/:id', async (req, res) => {
  try {
    const agentId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    // Avoid duplicate agent entries
    const isOwned = user.agents.some(id => id.toString() === agentId);
    if (!isOwned) {
      user.agents.push(agentId);
    } else {
      return res.status(400).json({ error: "Agent already owned" });
    }

    await user.save();

    // Record Transaction for Revenue Tracking
    const agent = await agentModel.findById(agentId);
    if (agent && agent.owner) {
      let amount = 0;
      if (agent.pricing && typeof agent.pricing === 'object') {
        if (agent.pricing.type && agent.pricing.type.toLowerCase() === 'free') {
          amount = 0;
        } else {
          amount = 0;
        }
      } else if (typeof agent.pricing === 'string') {
        amount = parseFloat(agent.pricing.replace(/[^0-9.]/g, '')) || 0;
      }

      const platformFee = amount * 0.5;
      const netAmount = amount - platformFee;

      await transactionModel.create({
        agentId: agent._id,
        vendorId: agent.owner,
        buyerId: userId,
        amount,
        platformFee,
        netAmount,
        status: 'Success'
      });
    }

    res.status(200).json({
      message: "Agent added successfully",
      user
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// get My agents
route.post("/get_my_agents", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required to fetch agents" });
    }
    const user = await userModel.findById(userId).populate("agents");
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in get_my_agents:", err);
    res.status(500).json({ error: "Server error fetching agents" });
  }
});

// Get My Agents (Authenticated)
route.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).populate("agents");
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    res.status(200).json(user.agents);
  } catch (err) {
    console.error("Error fetching my agents:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get agents created by me (Vendor)
route.get('/created-by-me', verifyToken, async (req, res) => {
  try {
    const agents = await agentModel.find({ owner: req.user.id });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create agents
route.post('/', verifyToken, async (req, res) => {
  try {
    console.log('[AGENT CREATE PAYLOAD]', req.body);
    const { agentName, description, category, avatar, url, pricing } = req.body;

    // Check if owner is a valid ObjectId, otherwise set to null or a default
    let ownerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      console.warn(`[AGENT CREATE] Invalid owner ID format: ${ownerId}. Setting to null.`);
      ownerId = null;
    }

    const newAgent = await agentModel.create({
      agentName,
      description,
      category,
      avatar,
      url,
      pricing,
      status: 'inactive',
      reviewStatus: 'Draft',
      owner: ownerId
    });

    res.status(201).json(newAgent);
  } catch (err) {
    console.error('[AGENT CREATE ERROR FULL]', err);
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: `Validation Error: ${messages.join(', ')}` });
    }
    const errorMsg = err.code === 11000
      ? `An agent with name "${req.body.agentName}" already exists.`
      : err.message || 'Failed to create agent';
    res.status(400).json({ error: errorMsg });
  }
});

// Submit for review
route.post('/submit-review/:id', verifyToken, async (req, res) => {
  try {
    const agent = await agentModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { reviewStatus: 'Pending Review' },
      { new: true }
    );
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // Notify Admin
    // Find an admin user (assuming role 'admin' exists)
    // In a real app, you might notify all admins or a specific group.
    const admin = await userModel.findOne({ role: 'admin' });
    if (admin) {
      await notificationModel.create({
        userId: admin._id,
        message: `New App Submission: "${agent.agentName}" by Vendor. Please review.`,
        type: 'info',
        targetId: agent._id
      });
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve (Admin)
route.post('/approve/:id', verifyToken, async (req, res) => {
  try {
    const agent = await agentModel.findByIdAndUpdate(
      req.params.id,
      { reviewStatus: 'Approved', status: 'active', rejectionReason: '' },
      { new: true }
    );

    if (agent && agent.owner) {
      const message = req.body.message || `Your app "${agent.agentName}" has been approved and is now Live!`;
      await notificationModel.create({
        userId: agent.owner,
        message,
        type: 'success',
        targetId: agent._id
      });
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject (Admin)
route.post('/reject/:id', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const agent = await agentModel.findByIdAndUpdate(
      req.params.id,
      { reviewStatus: 'Rejected', status: 'inactive', rejectionReason: reason },
      { new: true }
    );

    if (agent && agent.owner) {
      await notificationModel.create({
        userId: agent.owner,
        message: `Your app "${agent.agentName}" was rejected. Reason: ${reason}`,
        type: 'error',
        targetId: agent._id
      });
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- General CRUD ---

route.get('/:id', async (req, res) => {
  try {
    const agent = await agentModel.findById(req.params.id);
    res.json(agent);
  } catch (err) {
    res.status(404).json({ error: "Agent not found" });
  }
});

route.put('/:id', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const agent = await agentModel.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ error: "Agent not found or unauthorized" });
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

route.delete('/:id', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const agent = await agentModel.findOneAndDelete(filter);

    if (!agent) {
      return res.status(404).json({ error: "Agent not found or unauthorized to delete" });
    }

    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default route