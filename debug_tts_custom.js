import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

// Load the JSON directly to avoid file path issues
const keyFilename = './ai-mall-482411-45e5f44078c8.json';
const keyFile = JSON.parse(fs.readFileSync(keyFilename));

const client = new textToSpeech.TextToSpeechClient({
    credentials: {
        client_email: keyFile.client_email,
        private_key: keyFile.private_key,
    }
});

async function testTTS() {
    console.log("Testing with explicit credentials from JSON...");
    console.log("Client Email:", keyFile.client_email);

    const request = {
        input: { text: "System check." },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        console.log("SUCCESS: Audio generated!");
        console.log("Byte length:", response.audioContent.length);
    } catch (error) {
        console.error("FAILURE:");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        if (error.reason) console.error("Reason:", error.reason);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

testTTS();
