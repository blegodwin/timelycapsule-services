import mongoose, { model, Document } from "mongoose";

// Define the interface for AI Content
export interface IAIContent extends Document {
    user: mongoose.Types.ObjectId;
    capsule: mongoose.Types.ObjectId;
    contentType: "text" | "image" | "video" | "audio";
    content: string;
    createdAt: Date;
}

// Define the schema
const aiContentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    capsule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Capsule",
        required: true
    },
    contentType: {
        type: String,
        enum: ["text", "image", "video", "audio"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const AIContent = model<IAIContent>("AIContent", aiContentSchema);

export default AIContent; 