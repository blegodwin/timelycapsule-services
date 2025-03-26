import express from "express";
import AIContentController from "../controllers/aiContent.controller";
import auth from "../middleware/auth";

const aiContentRouter = (router: express.Router) => {
    // Create new AI Content
    router.post("/ai-content", auth, AIContentController.createAIContent);

    // Get AI Content by ID
    router.get("/ai-content/:id", auth, AIContentController.getAIContentById);

    // Get all AI Content for a specific user
    router.get("/ai-content/user/:userId", auth, AIContentController.getUserAIContent);

    // Update AI Content
    router.put("/ai-content/:id", auth, AIContentController.updateAIContent);

    // Delete AI Content
    router.delete("/ai-content/:id", auth, AIContentController.deleteAIContent);
};

export default aiContentRouter; 