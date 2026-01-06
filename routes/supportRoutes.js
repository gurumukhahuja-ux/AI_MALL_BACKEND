import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import { sendContactAdminEmail } from '../utils/Email.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { email, issueType, message, userId, subject } = req.body;

        if (!email || !issueType || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newTicket = new SupportTicket({
            email,
            issueType,
            message,
            subject: subject || 'No Subject',
            userId: userId || null
        });

        await newTicket.save();

        // If it's an Admin Support Request, try to email the admin
        if (issueType === 'AdminSupport') {
            try {
                // Find Admin Email
                const admin = await User.findOne({ role: 'admin' }).select('email');
                const adminEmail = admin ? admin.email : process.env.EMAIL; // Fallback to system email if no admin found

                const vendor = await User.findById(userId).select('name');
                const vendorName = vendor ? vendor.name : 'Vendor';

                await sendContactAdminEmail(adminEmail, vendorName, email, subject || issueType, message);
            } catch (emailErr) {
                console.error("Failed to trigger admin email:", emailErr);
                // Don't fail the request, just log it. The ticket is saved.
            }
        }

        res.status(201).json({ message: 'Support ticket created successfully', ticket: newTicket });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get tickets for a user (Vendor Support History)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type } = req.query;

        const query = { userId };
        if (type) {
            query.issueType = type;
        }

        const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

export default router;
