const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledge.controller');
const uploadMiddleware = require('../middlewares/upload.middleware');

router.post('/upload', uploadMiddleware, knowledgeController.uploadDocument);
router.get('/documents', knowledgeController.getDocuments);
router.delete('/:id', knowledgeController.deleteDocument);

module.exports = router;
