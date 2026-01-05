// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Users,
    ShoppingBag,
    MessageCircle,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SellerApplications from './SellerApplications';
import ListingApprovals from './ListingApprovals';
import ChatMonitor from './ChatMonitor';
import UserModeration from './UserModeration';
import AdminOverview from './AdminOverview';
import axiosClient from '../../api/axiosClient';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingSellers: 0,
        pendingListings: 0,
        activeListings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axiosClient.get('/admin/stats');
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sellers', label: 'Sellers', icon: Users, badge: stats.pendingSellers },
        { id: 'listings', label: 'Listings', icon: ShoppingBag, badge: stats.pendingListings },
        { id: 'chats', label: 'Chat Monitor', icon: MessageCircle },
        { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <AdminOverview stats={stats} loading={loading} />;
            case 'sellers': return <SellerApplications onAction={fetchStats} />;
            case 'listings': return <ListingApprovals onAction={fetchStats} />;
            case 'chats': return <ChatMonitor />;
            case 'moderation': return <UserModeration />;
            default: return <AdminOverview stats={stats} loading={loading} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Terminal</h1>
                            <p className="text-gray-500 font-medium">System governance and moderation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="rounded-xl border-gray-200"
                            onClick={fetchStats}
                        >
                            <Activity size={18} className="mr-2 text-purple-600" />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}
                                `}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className={`
                                        ml-1 px-2 py-0.5 rounded-full text-[10px] 
                                        ${isActive ? 'bg-white text-purple-600' : 'bg-red-500 text-white'}
                                    `}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
