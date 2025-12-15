import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  type: { 
    type: String, 
    enum: ['support', 'writer', 'coder', 'general'],
    default: 'general'
  },
  instructions: { 
    type: String, 
    default: 'You are a helpful AI assistant.' // Default system prompt
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Agent', agentSchema);