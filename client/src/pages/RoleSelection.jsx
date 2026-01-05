import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setRole as setRoleApi } from '../api/user';
import { ShoppingBag, Store } from 'lucide-react';

const RoleSelection = () => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role) => {
        if (role === 'seller') {
            navigate('/profile/apply-seller');
            return;
        }

        try {
            setLoading(true);
            await setRoleApi(role);
            await refreshUser();
            navigate('/');
        } catch (error) {
            console.error("Failed to set role", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CampKart</h1>
                    <p className="text-xl text-gray-600">How would you like to use the platform today?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Buyer Card */}
                    <button
                        onClick={() => handleRoleSelect('customer')}
                        disabled={loading}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group text-left"
                    >
                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                            <ShoppingBag className="w-8 h-8 text-blue-600 group-hover:text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue as Buyer</h2>
                        <p className="text-gray-600">Browse campus listings, chat with sellers, and find great deals.</p>
                    </button>

                    {/* Seller Card */}
                    <button
                        onClick={() => handleRoleSelect('seller')}
                        disabled={loading}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 group text-left"
                    >
                        <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                            <Store className="w-8 h-8 text-purple-600 group-hover:text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply as Seller</h2>
                        <p className="text-gray-600">List your items, manage your store, and earn money on campus.</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
