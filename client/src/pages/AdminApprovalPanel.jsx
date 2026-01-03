// client/src/pages/AdminApprovalPanel.jsx
import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { useToast } from '../components/ui/ToastProvider';

const AdminApprovalPanel = () => {
    const [pendingListings, setPendingListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchPendingListings();
    }, []);

    const fetchPendingListings = async () => {
        try {
            const response = await fetch('/api/listings/admin/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('campkart_token')}`
                }
            });
            const data = await response.json();
            setPendingListings(data);
        } catch (error) {
            console.error('Failed to fetch pending listings:', error);
            addToast({ title: 'Error', description: 'Failed to load listings', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (listingId, status) => {
        try {
            const response = await fetch(`/api/listings/admin/${listingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('campkart_token')}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (data.success) {
                addToast({
                    title: status === 'active' ? 'Listing Approved' : 'Listing Rejected',
                    description: `Item has been ${status === 'active' ? 'published' : 'rejected'}.`
                });
                setPendingListings(pendingListings.filter(l => l._id !== listingId));
            } else {
                addToast({ title: 'Error', description: data.message, variant: 'destructive' });
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Control Panel</h1>
                    <p className="text-gray-500 font-medium">Verify new marketplace listings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none">
                        <CardContent className="pt-6">
                            <p className="text-purple-100 font-bold text-xs uppercase tracking-wider">Pending Listings</p>
                            <h3 className="text-4xl font-black mt-1">{pendingListings.length}</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading listings...</div>
                            ) : pendingListings.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {pendingListings.map((item) => (
                                        <div key={item._id} className="p-6 flex items-start gap-6 hover:bg-gray-50/50 transition-colors">
                                            {/* Item Image */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.images && item.images[0] ? (
                                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                                                    <span className="font-bold text-emerald-600">₹{item.price}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>

                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Search size={14} />
                                                        Seller: <span className="font-semibold text-gray-700">{item.seller.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                                                    <Badge variant="outline" className="text-[10px]">{item.condition}</Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    onClick={() => handleAction(item._id, 'active')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold w-full"
                                                >
                                                    <UserCheck size={16} /> Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction(item._id, 'rejected')}
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 rounded-xl gap-2 w-full"
                                                >
                                                    <UserX size={16} /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={24} className="text-gray-400" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">All Clear!</h4>
                                    <p className="text-gray-500 text-sm">No new listings waiting for approval.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminApprovalPanel;
