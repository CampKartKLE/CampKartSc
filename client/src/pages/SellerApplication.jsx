// client/src/pages/SellerApplication.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Tag, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useToast } from '../components/ui/ToastProvider';
import { applySellerApi } from '../api/auth';

const SellerApplication = () => {
    const { user, refreshUser } = useAuth();
    const { currentRole } = useRole();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localSubmitted, setLocalSubmitted] = useState(false);
    const [reason, setReason] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [agreed1, setAgreed1] = useState(false);
    const [agreed2, setAgreed2] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleApply = async () => {
        if (!reason || reason.length < 20) {
            addToast({ title: 'Invalid Reason', description: 'Please provide a reason (min 20 chars).', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await applySellerApi(reason, category);

            if (data.success) {
                addToast({ title: 'Application Submitted', description: 'Admin will review your request soon.' });
                await refreshUser();
                navigate('/marketplace');
            } else {
                addToast({ title: 'Error', description: data.message || 'Failed to activate account', variant: 'destructive' });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = user?.sellerApplication?.status === 'pending';
    const isApproved = user?.role === 'seller';

    if (isApproved) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
                    <ShieldCheck size={48} className="drop-shadow-sm" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Verified Seller Account</h1>
                <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">Congratulations! Your account is verified. You can now start listing your camping gear.</p>
                <div className="flex justify-center gap-4">
                    <Button size="lg" className="rounded-2xl px-8 shadow-lg shadow-blue-500/20" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                    <Button size="lg" variant="outline" className="rounded-2xl px-8" onClick={() => navigate('/profile')}>My Profile</Button>
                </div>
            </div>
        );
    }

    if (isPending || localSubmitted) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-in scale-in duration-500">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                    <div className="relative z-10 w-full h-full bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Application Received</h1>
                <p className="text-gray-500 text-lg mb-2">We are currently reviewing your seller profile.</p>
                <p className="text-gray-400 text-sm mb-10">This usually takes 24 hours. You will be notified once approved.</p>
                <Button size="lg" variant="outline" className="rounded-2xl px-8 border-gray-200" onClick={() => navigate('/profile')}>Back to Profile</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-4">Start Selling on CampKart</h1>
                <p className="text-gray-500 text-lg">Join our community of verified student sellers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Tag className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">List Items Instantly</h3>
                            <p className="text-sm text-gray-500">Post your gear once approved and reach students across campus.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Earn Real Value</h3>
                            <p className="text-sm text-gray-500">Turn your pre-loved gear into cash for your next adventure.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Verified Community</h3>
                            <p className="text-sm text-gray-500">Every seller is manually verified to ensure safety and quality.</p>
                        </div>
                    </div>
                </div>

                <Card className="border-none shadow-xl overflow-hidden">
                    <CardHeader className="bg-gray-900 text-white p-6">
                        <CardTitle>Seller Agreement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Primary Sales Category *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                            >
                                <option>Electronics</option>
                                <option>Books</option>
                                <option>Camping Gear</option>
                                <option>Vehicles (Cycles)</option>
                                <option>Accommodation / Renting</option>
                                <option>Fashion / Clothing</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Why do you want to sell on CampKart? *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-sm bg-gray-50"
                                placeholder="Tell us about the gear you want to sell..."
                                required
                            />
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Minimum 20 characters required.</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-campus-blue rounded border-gray-300 focus:ring-campus-blue"
                                    checked={agreed1}
                                    onChange={(e) => setAgreed1(e.target.checked)}
                                />
                                <span>I agree to list only authentic and functional camping gear.</span>
                            </label>
                            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-campus-blue rounded border-gray-300 focus:ring-campus-blue"
                                    checked={agreed2}
                                    onChange={(e) => setAgreed2(e.target.checked)}
                                />
                                <span>I will provide accurate descriptions and real photos.</span>
                            </label>
                        </div>

                        <Button
                            className="w-full rounded-xl py-6 text-lg"
                            onClick={handleApply}
                            disabled={isSubmitting || !agreed1 || !agreed2}
                        >
                            {isSubmitting ? 'Activating...' : 'Activate Seller Account'}
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            By clicking apply, you agree to our Seller Terms of Service.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SellerApplication;
