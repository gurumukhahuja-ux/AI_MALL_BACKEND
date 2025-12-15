import mongoose from "mongoose";
const agentSchema = mongoose.Schema({
    agentName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Business', 'Sales & Marketing', 'general'],
        default: 'general'
    },
    avatar: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model("Agent", agentSchema)