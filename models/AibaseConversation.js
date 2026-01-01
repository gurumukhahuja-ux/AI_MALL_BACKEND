import mongoose from 'mongoose';

const AibaseConversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: 'admin'
    },
    title: {
        type: String,
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('AibaseConversation', AibaseConversationSchema);
