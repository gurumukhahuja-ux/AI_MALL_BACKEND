import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Sale', 'Payout', 'Fee'],
        required: true
    },
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed'],
        default: 'Completed'
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
