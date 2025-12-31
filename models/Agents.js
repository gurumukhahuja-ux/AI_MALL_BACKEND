import mongoose from "mongoose";
const agentSchema = mongoose.Schema({
    agentName: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'productivity', 'content', 'analysis', 'coding', 'other', 'Business', 'Sales & Marketing', 'general',
            'Business OS', 'Data & Intelligence', 'HR & Finance', 'Design & Creative', 'Medical & Health AI'
        ],
        default: 'productivity'
    },
    avatar: {
        type: String,
        default: '/default-agent.png'
    },
    url: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Live', 'Under Review', 'Draft', 'Inactive'],
        default: 'Draft'
    },
    health: {
        type: String,
        enum: ['All Good', 'Needs Attention', 'Issue Detected'],
        default: 'All Good'
    },
    pricingModel: {
        type: String,
        enum: ['free', 'freemium', 'paid', 'subscription'],
        default: 'free'
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default mongoose.model("Agent", agentSchema)