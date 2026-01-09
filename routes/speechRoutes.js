import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Robust Credential Loading
// We explicitly look for the file in the root directory to avoid env var path resolution issues
const keyFilename = 'ai-mall-482411-45e5f44078c8.json';
let client;

try {
    // Try to load from root (relative to where node runs)
    // Or relative to this file? Better to rely on process.cwd() or absolute check.
    const keyPath = path.resolve(process.cwd(), keyFilename);

    if (fs.existsSync(keyPath)) {
        const keyFile = JSON.parse(fs.readFileSync(keyPath));
        client = new textToSpeech.TextToSpeechClient({
            credentials: {
                client_email: keyFile.client_email,
                private_key: keyFile.private_key,
            }
        });
        console.log("[SpeechRoutes] Initialized with explicit credentials from:", keyPath);
    } else {
        // Fallback to standard env var if file not found (though we know it failed before)
        console.warn("[SpeechRoutes] Key file not found at root, falling back to default ADC.");
        client = new textToSpeech.TextToSpeechClient();
    }
} catch (e) {
    console.error("[SpeechRoutes] Failed to load credentials:", e);
    client = new textToSpeech.TextToSpeechClient();
}

router.post('/speak', async (req, res) => {
    try {
        const { text, languageCode, gender } = req.body;

        if (!text) {
            return res.status(400).send('Text is required');
        }

        const request = {
            input: { text: text },
            voice: { languageCode: languageCode || 'en-US', ssmlGender: gender || 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent.toString('base64');

        res.json({ audioContent });

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Failed to synthesize speech', details: error.message });
    }
});

export default router;
