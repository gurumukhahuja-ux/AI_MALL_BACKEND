const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: 'admin', // For now, single user support
        index: true
    },
    title: {
        type: String,
        default: 'New Conversation'
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
}, {
    timestamps: true
});

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
