const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const User = require('../models/User');

// Start or Get Chat for an Item
exports.startConversation = async (req, res) => {
    try {
        const { listingId, message } = req.body;
        const buyerId = req.user.id;

        if (!listingId) {
            return res.status(400).json({ success: false, message: "Listing ID is required" });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const sellerId = listing.seller.id;

        // Prevent self-chat
        if (buyerId.toString() === sellerId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot message yourself" });
        }

        // Check for existing conversation
        let conversation = await Conversation.findOne({
            listing: listingId,
            buyer: buyerId,
            seller: sellerId
        }).populate('listing').populate('buyer', 'name').populate('seller', 'name');

        if (!conversation) {
            conversation = await Conversation.create({
                listing: listingId,
                buyer: buyerId,
                seller: sellerId,
                participants: [buyerId, sellerId]
            });
            // Re-fetch to populate
            conversation = await Conversation.findById(conversation._id)
                .populate('listing')
                .populate('buyer', 'name')
                .populate('seller', 'name');
        }

        // If specific initial message provided
        if (message) {
            const newMessage = await Message.create({
                conversationId: conversation._id,
                sender: buyerId,
                content: message
            });

            conversation.lastMessage = newMessage._id;
            conversation.lastMessageAt = Date.now();
            await conversation.save();
        }

        res.json({ success: true, data: conversation });
    } catch (error) {
        console.error("StartConversation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Conversations (Role Based)
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role; // Assumes updated via setRole

        let query = {};

        // ADMIN: Sees ALL chats
        if (userRole === 'admin') {
            query = {};
        }
        // SELLER: Sees chats where they are the seller OR buyer (incase they buy stuff too)
        // But prompt says "Seller sees ALL chats for THEIR items"
        else {
            query = { participants: userId };
        }

        const conversations = await Conversation.find(query)
            .populate('listing', 'title images price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error("GetConversations Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch conversations" });
    }
};

// Get Messages for a specific conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        // Security: Ensure participant OR admin
        const isParticipant = conversation.participants.map(p => p.toString()).includes(userId);
        if (!isParticipant && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("GetMessages Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

// Send Message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ success: false, message: "Message content empty" });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

        // Verify participant
        const isParticipant = conversation.participants.map(p => p.toString()).includes(userId);
        if (!isParticipant) return res.status(403).json({ success: false, message: "Access Denied" });

        const newMessage = await Message.create({
            conversationId,
            sender: userId,
            content
        });

        conversation.lastMessage = newMessage._id;
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        res.json({ success: true, data: newMessage });
    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};
