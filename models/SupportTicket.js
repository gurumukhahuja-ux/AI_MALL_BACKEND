import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderId: {
        type: String, // Can be UserId or "Admin" or "System"
        required: true
    },
    senderEmail: {
        type: String,
        required: true
    },
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    appName: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Responded', 'Closed'],
        default: 'Open'
    },
    type: {
        type: String,
        enum: ['UserSupport', 'AdminSupport'],
        default: 'UserSupport'
    },
    reply: {
        type: String // Last reply content
    }
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);
