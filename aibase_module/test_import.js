try {
    const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/huggingface_transformers");
    console.log("Import Successful:", !!HuggingFaceTransformersEmbeddings);
} catch (e) {
    console.error("Import Failed:", e.message);
}
