const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

// Get all conversations for current user
router.get('/conversations', protect, chatController.getConversations);

// Start conversation (linked to listing)
router.post('/conversations', protect, chatController.startConversation);

// Get messages for a specific conversation
router.get('/messages/:conversationId', protect, chatController.getMessages);

// Send a message
router.post('/messages', protect, chatController.sendMessage);

module.exports = router;
