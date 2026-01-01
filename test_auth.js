import { VertexAI } from '@google-cloud/vertexai';

const run = async () => {
    const project = process.env.GCP_PROJECT_ID;
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    console.log(`Testing Auth...`);
    console.log(`Project: ${project}`);
    console.log(`KeyFile: ${keyFile}`);
    const fs = await import('fs');
    try {
        const content = fs.readFileSync(keyFile, 'utf8');
        JSON.parse(content);
        console.log("JSON Key File is VALID.");
    } catch (e) {
        console.error("JSON Key File is INVALID:", e.message);
        return;
    }

    try {
        const vertexAI = new VertexAI({
            project: project,
            location: 'us-central1',
            googleAuthOptions: { keyFile: keyFile }
        });

        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use flash for speed/availability check. Or 'gemini-pro'
        // config says 'gemini-2.5-pro' but that might not exist yet? 
        // Wait, step 314 said 'gemini-2.5-pro'. 
        // I should use a known valid model like 'gemini-1.5-pro-preview-0409' or just 'gemini-pro'.
        // 'gemini-2.5-pro' sounds fake/future.

        console.log("Attempting generation...");
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("Success! Response:", response.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("Auth/Gen Failed:", e);
    }
};

run();
