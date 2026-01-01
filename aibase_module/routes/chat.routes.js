const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);
router.get('/:id', chatController.getConversation);
router.delete('/:id', chatController.deleteConversation);
router.post('/upload', require('../middlewares/upload.middleware'), chatController.uploadAttachment); // New Route
router.post('/', chatController.chat);

module.exports = router;
