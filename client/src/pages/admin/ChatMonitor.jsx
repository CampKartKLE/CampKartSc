// client/src/pages/admin/ChatMonitor.jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { MessageCircle, Trash2, User, Clock, Search, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/ToastProvider';

const ChatMonitor = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const { data } = await axiosClient.get('/admin/chats');
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Failed to load conversations', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (convId) => {
        setLoadingMessages(true);
        try {
            const { data } = await axiosClient.get(`/admin/chats/${convId}/messages`);
            if (data.success) {
                setMessages(data.data);
                setSelectedConv(convId);
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Are you sure you want to delete this message? This action is logged.')) return;

        try {
            const { data } = await axiosClient.delete(`/admin/messages/${msgId}`);
            if (data.success) {
                addToast({ title: 'Deleted', description: 'Message removed by admin' });
                setMessages(messages.filter(m => m._id !== msgId));
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Deletion failed', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading chat logs...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-300px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 border-none shadow-sm flex flex-col overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <MessageCircle size={20} className="text-purple-600" />
                        Active Conversations
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {conversations.map((conv) => (
                                <button
                                    key={conv._id}
                                    onClick={() => fetchMessages(conv._id)}
                                    className={`
                                        w-full p-4 text-left transition-colors flex items-start gap-3
                                        ${selectedConv === conv._id ? 'bg-purple-50 border-r-4 border-purple-600' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex -space-x-3 mb-2">
                                        {conv.participants.slice(0, 2).map((p, i) => (
                                            <Avatar key={p._id} fallback={p.name.charAt(0)} className="h-8 w-8 border-2 border-white" />
                                        ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 truncate">
                                            {conv.participants.map(p => p.name).join(' & ')}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-400 text-sm">No conversations found</div>
                    )}
                </CardContent>
            </Card>

            {/* Message View */}
            <Card className="lg:col-span-2 border-none shadow-sm flex flex-col overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-lg font-bold">
                        {selectedConv ? 'Conversation Logs' : 'Select a conversation to view logs'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    {loadingMessages ? (
                        <div className="p-12 text-center text-gray-500">Decrypting messages...</div>
                    ) : selectedConv ? (
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                            {messages.map((msg) => (
                                <div key={msg._id} className="flex items-start gap-4 group">
                                    <Avatar fallback={msg.sender?.name?.charAt(0)} className="h-8 w-8 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900">{msg.sender?.name}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-1 p-3 bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700 relative">
                                            {msg.content}
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="absolute -right-2 -top-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white shadow-sm"
                                                title="Delete message"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <Clock className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                            <h4 className="font-bold text-gray-900 italic opacity-50">Transcripts available on demand</h4>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatMonitor;
