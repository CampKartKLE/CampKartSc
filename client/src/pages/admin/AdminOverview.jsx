// client/src/pages/admin/AdminOverview.jsx
import React from 'react';
import { Users, ShoppingBag, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

const AdminOverview = ({ stats, loading }) => {
    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
        { label: 'Pending Sellers', value: stats.pendingSellers, icon: Clock, color: 'bg-amber-500' },
        { label: 'Pending Listings', value: stats.pendingListings, icon: Activity, color: 'bg-indigo-500' },
        { label: 'Active Listings', value: stats.activeListings, icon: ShoppingBag, color: 'bg-emerald-500' },
    ];

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading system metrics...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="border-none shadow-sm hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default AdminOverview;
