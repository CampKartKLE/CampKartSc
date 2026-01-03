// client/src/pages/dashboards/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PlusCircle, Package, DollarSign, MessageCircle, BarChart3, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getListings, getMyListings } from '../../api/listings';
import { getConversations } from '../../api/messages'; // Import messages API

const SellerDashboard = ({ user }) => {
    const [stats, setStats] = useState({
        activeListings: 0,
        pendingSales: 0,
        totalEarnings: 0,
        profileViews: 0
    });
    const [myListings, setMyListings] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                // 1. Fetch Listings
                const userListings = await getMyListings();
                setMyListings(userListings);

                // 2. Fetch Conversations
                const userConversations = await getConversations();
                setConversations(userConversations.slice(0, 3)); // Top 3 for sneak peek

                // 3. Calculate Stats
                const activeCount = userListings.filter(l => l.status === 'active' && !l.isSold).length;
                const earnings = userListings.filter(l => l.isSold).reduce((sum, l) => sum + Number(l.price), 0);
                const totalViews = userListings.reduce((sum, l) => sum + (l.views || 0), 0);
                const activeChats = userConversations.length;

                setStats({
                    activeListings: activeCount,
                    pendingSales: activeChats, // Using active chats as proxy for "Pending Sales/Leads"
                    totalEarnings: earnings,
                    profileViews: totalViews
                });

            } catch (error) {
                console.error('Failed to fetch seller dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSellerData();
    }, [user]);

    const getStatusBadge = (item) => {
        if (item.isSold) return <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Sold</span>;
        if (item.status === 'pending') return <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>;
        if (item.status === 'rejected') return <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Rejected</span>;
        return <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>;
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== user._id) || conversation.participants[0];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Listings"
                    value={stats.activeListings}
                    icon={Package}
                    color="blue"
                    trend="+1 this week"
                />
                <StatCard
                    title="Total Earnings"
                    value={`₹${stats.totalEarnings}`}
                    icon={DollarSign}
                    color="emerald"
                    trend="Check payouts"
                    trendLink="/payouts"
                />
                <StatCard
                    title="Interest"
                    value={stats.profileViews}
                    icon={TrendingUp}
                    color="amber"
                    trend="Total views across items" // Updated label
                />
                <StatCard
                    title="Active Inquiries" // Updated label
                    value={stats.pendingSales}
                    icon={BarChart3}
                    color="purple"
                    trend={`${stats.pendingSales} active chats`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main: Listings Management */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 px-6 py-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Your Listings</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Manage and track your items for sale</p>
                            </div>
                            <Link to="/sell">
                                <Button className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700">
                                    <PlusCircle size={18} /> Sell Gear
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {myListings.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {myListings.map(item => (
                                        <div key={item._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                            <img src={item.images[0]} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                                                    {getStatusBadge(item)}
                                                </div>
                                                <p className="text-emerald-600 font-bold text-lg">₹{item.price}</p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                                                    <span>{item.views || 0} Views</span>
                                                    <span>•</span>
                                                    <span>{item.category}</span>
                                                </div>
                                                {item.status === 'rejected' && item.adminComments && (
                                                    <p className="text-xs text-red-500 mt-1">Reason: {item.adminComments}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link to={`/item/${item._id}`}>
                                                    <Button variant="outline" size="sm" className="rounded-lg">Manage</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Tag size={24} className="text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">No items listed yet</h4>
                                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Start selling your camping gear and reach buyers in your campus today!</p>
                                    <Link to="/sell" className="mt-6 inline-block">
                                        <Button variant="outline">Create your first listing</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Activity & Growth */}
                <div className="space-y-6">
                    {/* Recent Inquiries */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MessageCircle size={20} className="text-blue-500" /> Inquiries
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {conversations.length > 0 ? conversations.map(conv => {
                                    const otherUser = getOtherParticipant(conv);
                                    return (
                                        <div key={conv._id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {otherUser.avatar ? <img src={otherUser.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-gray-500">{otherUser.name?.[0]}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{otherUser.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">{conv.lastMessage?.content || "Started a chat"}</p>
                                            </div>
                                            <Link to={`/chat?id=${conv._id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                    <ArrowUpRight size={14} />
                                                </Button>
                                            </Link>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No recent inquiries.</p>
                                )}
                            </div>
                            <Link to="/chat">
                                <Button variant="ghost" className="w-full mt-4 text-blue-600 text-sm font-bold">Go to Messages</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Pro Tip */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white">
                        <TrendingUp size={24} className="mb-4 text-emerald-300" />
                        <h4 className="font-bold text-lg mb-2">Selling Tip</h4>
                        <p className="text-emerald-100 text-sm leading-relaxed">
                            Items with more than 3 high-quality photos sell 2x faster. Update your listings for better visibility!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendLink }) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        amber: 'text-amber-600 bg-amber-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${colors[color]}`}>
                        <Icon size={20} />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
                    {trendLink ? (
                        <Link to={trendLink} className="text-[10px] font-bold text-blue-600 hover:underline mt-2 block uppercase tracking-tight">
                            {trend} →
                        </Link>
                    ) : (
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight">{trend}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SellerDashboard;
