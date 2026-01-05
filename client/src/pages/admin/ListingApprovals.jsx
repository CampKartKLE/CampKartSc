// client/src/pages/admin/ListingApprovals.jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Package, CheckCircle, XCircle, User, Tag, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/ToastProvider';

const ListingApprovals = ({ onAction }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchPendingListings();
    }, []);

    const fetchPendingListings = async () => {
        try {
            const { data } = await axiosClient.get('/admin/listings/pending');
            if (data.success) {
                setListings(data.data);
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Failed to load listings', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (listingId, status) => {
        try {
            const { data } = await axiosClient.patch(`/admin/listings/${listingId}/status`, { status });

            if (data.success) {
                addToast({
                    title: status === 'approved' ? 'Listing Approved' : 'Listing Rejected',
                    description: `Item has been ${status === 'approved' ? 'published' : 'rejected'}.`
                });
                setListings(listings.filter(l => l._id !== listingId));
                if (onAction) onAction();
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading listings...</div>;

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-bold">Marketplace Listings Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {listings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {listings.map((item) => (
                            <div key={item._id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                                {/* Item Image */}
                                <div className="w-full md:w-40 h-40 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                                    {item.images && item.images[0] ? (
                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-xl text-gray-900">{item.title}</h4>
                                            <p className="text-2xl font-black text-emerald-600 mt-1">₹{item.price}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-white">{item.category}</Badge>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <div className="p-1.5 bg-gray-100 rounded-lg"><User size={14} /></div>
                                            <span>Seller: <span className="text-gray-900">{item.seller.name}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <div className="p-1.5 bg-gray-100 rounded-lg"><MapPin size={14} /></div>
                                            <span>{item.location || 'Campus'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center lg:min-w-[140px]">
                                    <Button
                                        onClick={() => handleAction(item._id, 'approved')}
                                        className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold w-full h-12"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(item._id, 'rejected')}
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-50 rounded-xl gap-2 w-full h-12"
                                    >
                                        <XCircle size={18} /> Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="font-bold text-gray-900">All Clear!</h4>
                        <p className="text-gray-500 text-sm mt-1">No pending listings waiting for verification.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ListingApprovals;
