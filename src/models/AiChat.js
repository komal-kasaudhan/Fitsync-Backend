// 📄 Path: src/models/AiChat.js
const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['user', 'model', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const AiChatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true
        },
        conversationId: {
            type: String,
            required: true,
            index: true
        },
        messages: [ChatMessageSchema]
    },
    { timestamps: true }
);

AiChatSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

module.exports = mongoose.model('AiChat', AiChatSchema);
