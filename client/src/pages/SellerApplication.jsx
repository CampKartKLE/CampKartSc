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
    const { isApprovedSeller } = useRole();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false); // No pending state anymore
    const [reason, setReason] = useState('');
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
            const data = await applySellerApi(reason);

            if (data.success) {
                // Instant Success
                addToast({ title: 'Success!', description: 'Your seller account has been activated.' });
                await refreshUser();
                navigate('/dashboard');
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

    if (isApprovedSeller) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} className="text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">You are a Verified Seller!</h1>
                <p className="text-gray-500 mb-8">You can now list items and access the seller dashboard.</p>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-amber-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Application Pending</h1>
                <p className="text-gray-500 mb-8">We are currently reviewing your application. This usually takes 24-48 hours.</p>
                <Button variant="outline" onClick={() => navigate('/profile')}>Back to Profile</Button>
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Why do you want to sell on CampKart? *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-sm"
                                placeholder="Tell us about the gear you want to sell..."
                                required
                            />
                            <p className="text-[10px] text-gray-400 mt-2">Minimum 20 characters required.</p>
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
