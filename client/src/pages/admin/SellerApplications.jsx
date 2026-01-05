// client/src/pages/admin/SellerApplications.jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { UserCheck, UserX, User, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/ToastProvider';

const SellerApplications = ({ onAction }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await axiosClient.get('/admin/sellers/pending');
            if (data.success) {
                setApplications(data.data);
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Failed to load applications', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, status) => {
        try {
            const { data } = await axiosClient.patch(`/admin/sellers/${userId}/status`, { status });
            if (data.success) {
                addToast({
                    title: 'Action Successful',
                    description: `Application ${status === 'approved' ? 'approved' : 'rejected'}`
                });
                setApplications(applications.filter(app => app._id !== userId));
                if (onAction) onAction();
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading applications...</div>;

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-bold">Pending Seller Approvals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {applications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <div key={app._id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar src={app.avatarUrl} fallback={app.name.charAt(0)} className="h-16 w-16 border-2 border-purple-100" />
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{app.name}</h4>
                                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Mail size={14} /> {app.email}</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-3 flex gap-3">
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50 flex-1">
                                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Reason:</p>
                                                <p className="text-sm text-blue-900 italic">"{app.sellerApplication?.reason || 'No reason provided.'}"</p>
                                            </div>
                                            {app.sellerApplication?.category && (
                                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
                                                    <p className="text-xs font-bold text-purple-700 uppercase mb-1">Category:</p>
                                                    <p className="text-sm text-purple-900 font-bold">{app.sellerApplication.category}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handleAction(app._id, 'approved')}
                                        className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold"
                                    >
                                        <UserCheck size={18} /> Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(app._id, 'rejected')}
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-50 rounded-xl gap-2 hover:text-red-700"
                                    >
                                        <UserX size={18} /> Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="font-bold text-gray-900">No Pending Applications</h4>
                        <p className="text-gray-500 text-sm mt-1">Check back later for new seller requests.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SellerApplications;
