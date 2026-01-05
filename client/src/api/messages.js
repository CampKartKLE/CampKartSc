import axiosClient from './axiosClient';

// Get all conversations for current user
export const getConversations = async () => {
    const { data } = await axiosClient.get('/messages/conversations');
    return data;
};

// Start a new conversation (linked to listing)
export const startConversation = async (listingId, message) => {
    const { data } = await axiosClient.post('/messages/conversations', { listingId, message });
    return data;
};

// Get messages for a conversation
export const getMessages = async (conversationId) => {
    const { data } = await axiosClient.get(`/messages/messages/${conversationId}`);
    return data;
};

// Send a message
export const sendMessage = async (conversationId, content) => {
    const { data } = await axiosClient.post('/messages/messages', { conversationId, content });
    return data;
};
