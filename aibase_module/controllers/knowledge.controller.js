const fs = require('fs');
const logger = require('../utils/logger');
const path = require('path');
const os = require('os');
const stream = require('stream');
const util = require('util');
const pdf = require('pdf-parse');
const Knowledge = require('../models/Knowledge.model');
const aiService = require('../services/ai.service');
const axios = require('axios');
const pipeline = util.promisify(stream.pipeline);
const { uploadToCloudinary, uploadFileToCloudinary } = require('../services/cloudinary.service');

// @desc    Upload a document
// @route   POST /api/knowledge/upload
// @access  Public
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const uploadedFile = req.file; // Multer (MemoryStorage) puts file in req.file with .buffer
        const originalName = uploadedFile.originalname;
        const mimeType = uploadedFile.mimetype;
        const fileSize = uploadedFile.size;

        logger.info(`Processing file from memory/buffer: ${originalName} (${fileSize} bytes)`);

        let textContent = '';
        let cloudinaryResult = null;

        // 1. Process Content (From Buffer)
        if (mimeType === 'application/pdf') {
            try {
                const data = await pdf(uploadedFile.buffer);
                textContent = data.text;
                logger.info(`Parsed PDF with ${data.numpages} pages`);
            } catch (pdfError) {
                logger.error(`PDF Parsing Failed: ${pdfError.message}`);
                textContent = "PDF parsing failed. Document stored without text context.";
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: uploadedFile.buffer });
                textContent = result.value;
                logger.info(`Parsed DOCX: ${textContent.length} chars.`);
            } catch (docxError) {
                logger.error(`DOCX Parsing Failed: ${docxError.message}`);
                textContent = "DOCX parsing failed.";
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            try {
                const xlsx = require('xlsx');
                const workbook = xlsx.read(uploadedFile.buffer, { type: 'buffer' });
                textContent = workbook.SheetNames.map(name => {
                    return xlsx.utils.sheet_to_text(workbook.Sheets[name]);
                }).join('\n\n');
                logger.info(`Parsed Excel.`);
            } catch (xlsxError) {
                logger.error(`Excel Parsing Failed: ${xlsxError.message}`);
                textContent = "Excel parsing failed.";
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            try {
                const officeParser = require('officeparser');
                textContent = await officeParser.parse(uploadedFile.buffer);
                logger.info(`Parsed PPTX.`);
            } catch (pptError) {
                logger.error(`PPTX Parsing Failed: ${pptError.message}`);
                textContent = "PPTX parsing failed.";
            }
        } else if (mimeType.startsWith('image/')) {
            try {
                const Tesseract = require('tesseract.js');
                logger.info(`Starting OCR for Image...`);
                const { data: { text } } = await Tesseract.recognize(uploadedFile.buffer, 'eng');
                textContent = text;
                logger.info(`OCR Complete. Extracted ${textContent.length} chars.`);
            } catch (ocrError) {
                logger.error(`OCR Failed: ${ocrError.message}`);
                textContent = "Image text extraction failed.";
            }
        } else if (mimeType === 'text/plain') {
            textContent = uploadedFile.buffer.toString('utf8');
        } else {
            logger.info('File type verification: Non-text file (Image/Video/Other). Skipping text extraction.');
        }

        // 2. Upload to Cloudinary (Buffer Stream)
        try {
            logger.info("Uploading to Cloudinary...");
            // Use uploadToCloudinary (services/cloudinary.service.js) which handles buffers
            cloudinaryResult = await uploadToCloudinary(uploadedFile.buffer, {
                resource_type: 'auto',
                public_id: originalName.split('.')[0] + '-' + Date.now()
            });
            logger.info(`Cloudinary Upload Success: ${cloudinaryResult.secure_url}`);
        } catch (cloudError) {
            logger.error(`Cloudinary Upload Failed: ${cloudError.message}`);
            return res.status(500).json({ success: false, message: 'Cloud storage failed' });
        }

        // 3. Store in Node.js AI Service (Only if text content available)
        if (textContent) {
            const success = await aiService.storeDocument(textContent);
            if (success) {
                logger.info("Document text stored in Atlas Vector Store");
            } else {
                logger.warn("Document text storage returned false (maybe empty content or error).");
            }
        }

        // 4. Always Store Metadata
        try {
            await Knowledge.create({
                filename: originalName,
                cloudinaryUrl: cloudinaryResult.secure_url,
                cloudinaryId: cloudinaryResult.public_id,
                mimetype: mimeType,
                size: fileSize
            });
            logger.info(`Document metadata saved to MongoDB. RAG Enabled: ${!!textContent}`);
        } catch (dbError) {
            logger.error(`MongoDB Save Error: ${dbError.message}`);
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded and processed successfully',
            data: {
                filename: originalName,
                url: cloudinaryResult.secure_url,
                mimetype: mimeType,
                size: fileSize,
                parsedTextLength: textContent ? textContent.length : 0,
                ragProcessed: !!textContent && textContent.length > 0
            }
        });

    } catch (error) {
        logger.error(`Upload Error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
};

// @desc    Get all uploaded documents
// @route   GET /api/knowledge/documents
// @access  Public
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Knowledge.find({}, 'filename uploadDate');
        res.status(200).json({
            success: true,
            data: documents
        });
    } catch (error) {
        logger.error(`Get Documents Error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error fetching documents' });
    }
};

// @desc    Delete a document
// @route   DELETE /api/knowledge/:id
// @access  Public
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Knowledge.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        await Knowledge.findByIdAndDelete(req.params.id);

        // Reload Vector Store to remove the document context
        await aiService.reloadVectorStore();

        res.status(200).json({
            success: true,
            message: 'Document deleted and knowledge base updated'
        });
    } catch (error) {
        logger.error(`Delete Document Error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error deleting document' });
    }
};
