import express from "express";
import AIContentController from "../controllers/ai-content";
import auth from "../middleware/auth";

const aiContentRouter = (router: express.Router) => {

    router.post("/ai-content", auth, AIContentController.createAIContent);

    router.get("/ai-content/:id", auth, AIContentController.getAIContentById);

    router.get("/ai-content/user/:userId", auth, AIContentController.getUserAIContent);

    router.put("/ai-content/:id", auth, AIContentController.updateAIContent);

    router.delete("/ai-content/:id", auth, AIContentController.deleteAIContent);
};

export default aiContentRouter; 
