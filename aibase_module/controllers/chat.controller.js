const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const Conversation = require('../models/Conversation.model');

// @desc    Chat with AI
// @route   POST /api/chat
// @access  Public (for now)
// @desc    Chat with AI
// @route   POST /api/chat
// @access  Public (for now)
exports.chat = async (req, res, next) => {
    try {
        const { message, conversationId, activeDocContent } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. Get AI Response (Pass activeDocContent if available)
        const responseText = await aiService.chat(message, activeDocContent);

        // 2. Persist to DB
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!conversation) {
            conversation = new Conversation({
                userId: 'admin', // Hardcoded for now
                title: message.substring(0, 30) + (message.length > 30 ? '...' : ''), // Auto-title
                messages: []
            });
        }

        conversation.messages.push({ role: 'user', text: message });
        conversation.messages.push({ role: 'assistant', text: responseText });
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        res.status(200).json({
            success: true,
            data: responseText,
            conversationId: conversation._id
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload attachment for Chat (Temporary Context)
// @route   POST /api/chat/upload
// @access  Public
exports.uploadAttachment = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        let parsedText = null;

        // Extract Text for Immediate Context
        if (mimeType === 'application/pdf') {
            try {
                const pdf = require('pdf-parse');
                const data = await pdf(fileBuffer);
                parsedText = data.text;
                logger.info(`[Chat Upload] Parsed PDF: ${data.numpages} pages.`);
            } catch (e) {
                logger.error(`[Chat Upload] PDF parse error: ${e.message}`);
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                parsedText = result.value;
                logger.info(`[Chat Upload] Parsed DOCX: ${parsedText.length} chars.`);
            } catch (e) {
                logger.error(`[Chat Upload] DOCX parse error: ${e.message}`);
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            try {
                const xlsx = require('xlsx');
                const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
                parsedText = workbook.SheetNames.map(name => {
                    return xlsx.utils.sheet_to_text(workbook.Sheets[name]);
                }).join('\n\n');
                logger.info(`[Chat Upload] Parsed Excel.`);
            } catch (e) {
                logger.error(`[Chat Upload] Excel parse error: ${e.message}`);
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            try {
                const officeParser = require('officeparser');
                parsedText = await officeParser.parse(fileBuffer);
                logger.info(`[Chat Upload] Parsed PPTX.`);
            } catch (e) {
                logger.error(`[Chat Upload] PPTX parse error: ${e.message}`);
            }
        } else if (mimeType.startsWith('image/')) {
            try {
                const Tesseract = require('tesseract.js');
                logger.info(`[Chat Upload] Starting OCR...`);
                const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
                parsedText = text;
                logger.info(`[Chat Upload] OCR Complete: ${parsedText.length} chars.`);
            } catch (e) {
                logger.error(`[Chat Upload] OCR error: ${e.message}`);
            }
        } else if (mimeType === 'text/plain') {
            parsedText = fileBuffer.toString('utf8');
        }

        // Helper to upload to cloudinary for visual reference (image/pdf link)
        const { uploadToCloudinary } = require('../services/cloudinary.service');
        const cloudResult = await uploadToCloudinary(fileBuffer, {
            resource_type: 'auto',
            public_id: 'chat_upload_' + Date.now()
        });

        // Return text so frontend can send it back as context
        logger.info(`[Chat Upload] Success. Extracted Text Length: ${parsedText ? parsedText.length : 0} chars.`);
        res.status(200).json({
            success: true,
            data: {
                url: cloudResult.secure_url,
                mimetype: mimeType,
                filename: req.file.originalname,
                size: req.file.size,
                parsedText: parsedText // Frontend stores this in state
            }
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get all conversations
// @route   GET /api/chat/history
// @access  Public
exports.getHistory = async (req, res, next) => {
    try {
        const query = { userId: 'admin' };

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { 'messages.text': searchRegex }
            ];
        }

        const conversations = await Conversation.find(query)
            .sort({ lastMessageAt: -1 })
            .select('title lastMessageAt createdAt');

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get specific conversation
// @route   GET /api/chat/:id
// @access  Public
exports.getConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/:id
// @access  Public
exports.deleteConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        await Conversation.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Conversation deleted'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear all history
// @route   DELETE /api/chat/history
// @access  Public
exports.clearHistory = async (req, res, next) => {
    try {
        await Conversation.deleteMany({ userId: 'admin' }); // Clear for current user

        res.status(200).json({
            success: true,
            message: 'History cleared'
        });
    } catch (error) {
        next(error);
    }
};

