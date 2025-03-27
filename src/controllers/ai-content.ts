import { Request, Response } from "express";
import AIContent, { IAIContent } from "../model/aiContent.model";

export interface AIContentRequest extends Request {
    user?: any;
    data?: any;
}

const AIContentController = {
    createAIContent: async (req: Request, res: Response): Promise<void> => {
        try {
            const aiContent = new AIContent(req.body);
            await aiContent.save();
            res.status(201).json({
                success: true,
                data: aiContent
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Error creating AI content",
                error
            });
        }
    },

    getAIContentById: async (req: Request, res: Response): Promise<void> => {
        try {
            const aiContent = await AIContent.findById(req.params.id)
                .populate("user", "firstName lastName")
                .populate("capsule", "title");

            if (!aiContent) {
                res.status(404).json({
                    success: false,
                    message: "AI Content not found"
                });
                return;
            }

            res.json({
                success: true,
                data: aiContent
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching AI content",
                error
            });
        }
    },

    getUserAIContent: async (req: Request, res: Response): Promise<void> => {
        try {
            const aiContents = await AIContent.find({ user: req.params.userId })
                .populate("capsule", "title")
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: aiContents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching user AI content",
                error
            });
        }
    },

    updateAIContent: async (req: Request, res: Response): Promise<void> => {
        try {
            const aiContent = await AIContent.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!aiContent) {
                res.status(404).json({
                    success: false,
                    message: "AI Content not found"
                });
                return;
            }

            res.json({
                success: true,
                data: aiContent
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Error updating AI content",
                error
            });
        }
    },

    deleteAIContent: async (req: Request, res: Response): Promise<void> => {
        try {
            const aiContent = await AIContent.findByIdAndDelete(req.params.id);

            if (!aiContent) {
                res.status(404).json({
                    success: false,
                    message: "AI Content not found"
                });
                return;
            }

            res.json({
                success: true,
                message: "AI Content deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting AI content",
                error
            });
        }
    }
};

export default AIContentController; 