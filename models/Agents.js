import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
    {
        vendorId: { type: String, default: "" },
        vendorName: { type: String, default: "" },
        dashboardUrl: { type: String, default: "" },
        authType: { type: String, default: "" }
    },
    { _id: false }
);

const PricingSchema = new mongoose.Schema(
    {
        type: { type: String, default: "" },
        plans: { type: Array, default: [] }
    },
    { _id: false }
);

const AccessSchema = new mongoose.Schema(
    {
        redirectType: { type: String, default: "" },
        redirectUrl: { type: String, default: "" },
        tokenPayload: { type: Array, default: [] }
    },
    { _id: false }
);

const AgentSchema = new mongoose.Schema(
    {
        agentName: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            required: true
        },

        avatar: {
            type: String,
            required: true,
            default: "/AGENTS_IMG/default.png"
        },

        url: {
            type: String,
            default: ""
        },

        vendor: {
            type: VendorSchema,
            default: {}
        },

        pricing: {
            type: PricingSchema,
            default: {}
        },

        access: {
            type: AccessSchema,
            default: {}
        },

        status: {
            type: String,
            enum: ["active", "inactive", "coming_soon"],
            default: "active"
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },

        rating: {
            type: Number,
            default: null
        },

        usageCount: {
            type: Number,
            default: 0
        },

        // Fields required for the Admin Dashboard & Workflow
        reviewStatus: {
            type: String,
            enum: ['Draft', 'Pending Review', 'Approved', 'Rejected'],
            default: 'Draft'
        },

        rejectionReason: {
            type: String,
            default: ''
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Auto-generate slug from agentName before validation
AgentSchema.pre('validate', function () {
    if (this.isModified('agentName') && !this.slug && this.agentName) {
        this.slug = this.agentName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

export default mongoose.model("Agent", AgentSchema);