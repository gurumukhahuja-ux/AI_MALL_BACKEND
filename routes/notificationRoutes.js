import express from 'express';
import notificationModel from '../models/Notification.js';
import { verifyToken } from '../middleware/authorization.js';

const router = express.Router();

// Get user notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const query = { userId: req.user.id };
        if (req.query.role) {
            query.role = req.query.role;
        }

        const notifications = await notificationModel.find(query)
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        await notificationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await notificationModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
