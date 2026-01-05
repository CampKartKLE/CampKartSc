// client/src/pages/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, User, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import axiosClient from '../api/axiosClient';

const Onboarding = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    const handleOnboard = async (role) => {
        setSelected(role);
        setLoading(true);
        try {
            if (role === 'buyer') {
                await axiosClient.patch('/users/onboard', { role: 'customer' });
                await refreshUser();
                addToast({ title: 'Welcome!', description: 'You are now ready to shop on CampKart.' });
                navigate('/marketplace');
            } else {
                // For seller, we redirect to the application page
                navigate('/profile/apply-seller');
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Failed to complete onboarding', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Welcome to <span className="text-campus-blue">CampKart</span></h1>
                    <p className="text-xl text-gray-500 font-medium">How would you like to use the platform today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Buyer Option */}
                    <div
                        onClick={() => !loading && handleOnboard('buyer')}
                        className={`
                            group cursor-pointer relative p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 overflow-hidden
                            ${selected === 'buyer' ? 'border-campus-blue shadow-2xl shadow-blue-100 ring-4 ring-blue-50' : 'border-gray-100 hover:border-campus-blue/30 hover:shadow-xl'}
                        `}
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-50 text-campus-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-campus-blue group-hover:text-white transition-all duration-300">
                                <ShoppingBag size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">I want to Buy</h2>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                Browse thousands of listings from fellow students. Books, gadgets, cycles, and more.
                            </p>
                            <div className="flex items-center text-campus-blue font-bold group-hover:gap-3 transition-all">
                                <span>Continue to Marketplace</span>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        {selected === 'buyer' && (
                            <div className="absolute top-6 right-6 bg-campus-blue text-white p-1 rounded-full">
                                <Check size={16} />
                            </div>
                        )}
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>

                    {/* Seller Option */}
                    <div
                        onClick={() => !loading && handleOnboard('seller')}
                        className={`
                            group cursor-pointer relative p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 overflow-hidden
                            ${selected === 'seller' ? 'border-emerald-500 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-50' : 'border-gray-100 hover:border-emerald-500/30 hover:shadow-xl'}
                        `}
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                <Store size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">I want to Sell</h2>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                Give your old belongings a second life. Clean out your room and earn some extra cash.
                            </p>
                            <div className="flex items-center text-emerald-600 font-bold group-hover:gap-3 transition-all">
                                <span>Apply for Seller Account</span>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        {selected === 'seller' && (
                            <div className="absolute top-6 right-6 bg-emerald-500 text-white p-1 rounded-full">
                                <Check size={16} />
                            </div>
                        )}
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-400 text-sm font-medium">
                    <p>Don't worry, you can change your mode or apply to sell later from your profile.</p>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
