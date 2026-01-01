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

        // Hybrid System Prompt
        const systemPrompt = `You are a smart Knowledge Assistant.

INSTRUCTIONS:
1. Analyze the provided CONTEXT.
2. If the Context starts with "SOURCE: COMPANY KNOWLEDGE BASE":
   - Answer the question using this context.
   - Start response with: "🏢 *From Company Documents*\n\n"
3. If the Context contains text but NO special header (meaning it's a User Upload):
   - Answer the question using this context.
   - Start response with: "📄 *From Chat-Uploaded Document*\n\n"
4. If NO Context is provided (or it's empty):
   - Answer using general knowledge.
   - Start response with: "🌐 *From General Knowledge*\n\n"

Constraints:
- Do not mix sources.
- If the answer is not in the company/user document, say so explicitly.`;




        messages.push({
            role: "system",
            content: systemPrompt
        });

        // Add Context if available
        if (context) {
            messages.push({
                role: "system",
                content: `CONTEXT:\n${context}`
            });
        }

        messages.push({
            role: "user",
            content: prompt
        });

        try {
            logger.info(`Sending request to Groq API (Hybrid Mode)...`);
            const response = await axios.post(this.baseUrl, {
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.3, // Balanced for factual + creative
                max_tokens: 1024
            }, {
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
