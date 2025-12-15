import express from "express";
const router = express.Router();

import agentModel from "../models/Agents.js";
import userModel from "../models/User.js"


// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await agentModel.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const { agentName, description, category, avatar, url } = req.body;
    const newAgent = new agentModel({
      agentName,
      description,
      category,
      avatar,
      url
    });
    const savedAgent = await newAgent.save();
    res.status(201).json(savedAgent);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create agent' });
  }
});


router.get('/:id', (req, res) => {

  const  id  = req.params.id;
  // const  userId  = req.body.userId

  console.log("BODY:", id,userId);

  res.send(id)

  // if (!userId) {
  //   return res.status(400).json({ error: "userId is required" });
  // }

  // // Find user
  // const user = await userModel.findById(userId);
  // console.log("FOUND USER:", user);

  // if (!user) {
  //   return res.status(404).json({ error: 'User Not Found' });
  // }
  // // Push agent id
  // user.agents.push(agentId);
  // // Save
  // await user.save();
  // res.status(200).json(user);

});

// Delete an agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await agentModel.findByIdAndDelete(id);
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
