const axios = require('axios');
const logger = require('../utils/logger');

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }

    async askGroq(prompt, context = null) {
        if (!this.apiKey) {
            throw new Error("Groq API Key is missing");
        }

        const messages = [];

        // Build Combined System Prompt
        let combinedSystemPrompt = `You are a smart Knowledge Assistant.

INSTRUCTIONS:
1. Analyze the provided CONTEXT carefully.
2. If the Context starts with "SOURCE: COMPANY KNOWLEDGE BASE":
   - Use that information to answer.
   - You MUST start your response with exactly: "🏢 *From Company Documents*" followed by two newlines.
3. If the Context starts with "SOURCE: CHAT UPLOADED DOCUMENT":
   - Use that information to answer.
   - You MUST start your response with exactly: "📄 *From Chat-Uploaded Document*" followed by two newlines.
4. If NO Context is provided:
   - Use your general knowledge.
   - You MUST start your response with exactly: "🌐 *From General Knowledge*" followed by two newlines.

Constraints:
- Strictly follow the labeling rules above.
- If a source is provided, do NOT say it is from General Knowledge.`;

        if (context) {
            combinedSystemPrompt += `\n\nCONTEXT:\n${context}`;
        }

        messages.push({
            role: "system",
            content: combinedSystemPrompt
        });

        messages.push({
            role: "user",
            content: prompt
        });

        try {
            const payload = {
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.3,
                max_tokens: 1024
            };

            logger.info(`Sending request to Groq API. Context Length: ${context ? context.length : 0} chars.`);
            // logger.debug(`Full Groq Payload: ${JSON.stringify(payload)}`); // Enable if needed

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                // The model itself will add the label based on our instructions
                return response.data.choices[0].message.content;
            } else {
                throw new Error("Invalid response format from Groq");
            }

        } catch (error) {
            logger.error(`Groq API Error: ${error.message}`);
            let errorMsg = error.message;
            if (error.response) {
                logger.error(`Groq Response Data: ${JSON.stringify(error.response.data)}`);
                errorMsg = JSON.stringify(error.response.data.error || error.response.data);
            }
            throw new Error(`Groq API Error: ${errorMsg}`);
        }
    }
}

module.exports = new GroqService();
