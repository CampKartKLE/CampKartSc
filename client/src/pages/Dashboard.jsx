// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import BuyerDashboard from './dashboards/BuyerDashboard';
import SellerDashboard from './dashboards/SellerDashboard';
import Button from '../components/ui/Button';
import axiosClient from '../api/axiosClient';

const Dashboard = () => {
    const { user } = useAuth();
    const { uiMode, currentRole, ROLES } = useRole();

    // Admin Dashboard with real-time data
    const AdminView = () => {
        const [stats, setStats] = useState({
            pendingSellers: 0,
            activeListings: 0,
            totalUsers: 0
        });
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchAdminStats();
        }, []);

        const fetchAdminStats = async () => {
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

        return (
            <div className="p-8 text-center bg-white rounded-3xl shadow-sm border">
                <h2 className="text-3xl font-black text-purple-900 mb-4">Admin Control Center</h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-8">
                    Welcome to the CampKart Admin panel. Manage users, applications, and listings from here.
                </p>
                {loading ? (
                    <div className="py-12 text-gray-400">Loading statistics...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                            <h4 className="font-bold text-purple-700">Pending Sellers</h4>
                            <p className="text-3xl font-black mt-2">{stats.pendingSellers}</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-700">Active Listings</h4>
                            <p className="text-3xl font-black mt-2">{stats.activeListings}</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-700">Verified Users</h4>
                            <p className="text-3xl font-black mt-2">{stats.totalUsers}</p>
                        </div>
                    </div>
                )}

                <div className="mt-12">
                    <Link to="/admin">
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-12 py-6 rounded-2xl text-lg font-bold shadow-xl shadow-purple-500/20">
                            Go to Approval Panel
                        </Button>
                    </Link>
                </div>
            </div>
        );
    };

    const renderDashboard = () => {
        // Strict prioritization
        if (currentRole === ROLES.ADMIN) {
            return <AdminView />;
        }

        // For approved sellers, show based on UI mode
        if (uiMode === 'seller') {
            return <SellerDashboard user={user} />;
        }

        // Default or buyer mode
        return <BuyerDashboard user={user} />;
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <div className="container mx-auto px-4 py-8">
                {renderDashboard()}
            </div>
        </div>
    );
};

export default Dashboard;
