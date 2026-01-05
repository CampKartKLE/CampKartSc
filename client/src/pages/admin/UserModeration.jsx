// client/src/pages/admin/UserModeration.jsx
import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { ShieldAlert, Ban, Clock, Flag, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/ToastProvider';

const UserModeration = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/admin/users/search/${searchQuery}`);
            if (data.success) {
                setUser(data.data.user);
            } else {
                addToast({ title: 'Not Found', description: 'No user found with this email', variant: 'destructive' });
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Search failed', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (action, duration = null) => {
        if (!user) return;
        try {
            const { data } = await axiosClient.patch(`/admin/users/${user._id}/moderate`, { action, duration, reason: 'Admin Action' });
            if (data.success) {
                addToast({ title: 'User Moderated', description: `User has been ${action}ed.` });
            }
        } catch (error) {
            addToast({ title: 'Error', description: 'Moderation failed', variant: 'destructive' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Search Section */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Find User to Moderate</h2>
                    <p className="text-gray-500 mb-6">Enter user email to view moderation options</p>

                    <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="user@university.edu"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8 rounded-2xl font-bold" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Moderation Controls */}
            {user && (
                <Card className="border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
                        <div className="flex items-center gap-6">
                            <Avatar src={user.avatarUrl} fallback={user.name?.charAt(0)} className="h-20 w-20 border-4 border-white/20" />
                            <div>
                                <h3 className="text-2xl font-black">{user.name}</h3>
                                <p className="text-gray-400 font-medium">{user.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <Badge className="bg-white/10 text-white border-white/20 capitalize">{user.role}</Badge>
                                    <Badge variant="outline" className="border-emerald-500 text-emerald-500">Active</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Actions */}
                            <div className="space-y-6">
                                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <ShieldAlert size={20} className="text-danger-red" />
                                    Restrictive Actions
                                </h4>

                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Mute for:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => handleModerate('mute', '24h')} variant="outline" className="rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">24 Hours</Button>
                                        <Button onClick={() => handleModerate('mute', '7d')} variant="outline" className="rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">7 Days</Button>
                                        <Button onClick={() => handleModerate('mute', '30d')} variant="outline" className="rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">30 Days</Button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={() => handleModerate('ban')}
                                        className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-2xl gap-3 font-black text-lg shadow-lg shadow-red-200"
                                    >
                                        <Ban size={22} /> Permanently Ban User
                                    </Button>
                                    <p className="text-[10px] text-center text-gray-400 mt-2 font-medium uppercase tracking-widest">Action cannot be easily undone</p>
                                </div>
                            </div>

                            {/* Warning Section */}
                            <div className="space-y-6">
                                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <Flag size={20} className="text-amber-500" />
                                    Communication
                                </h4>

                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Type a system warning message..."
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
                                    ></textarea>
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl font-bold py-3">
                                        Send Official Warning
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!user && !loading && (
                <div className="text-center py-12 opacity-30 select-none">
                    <ShieldAlert size={80} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-xl font-black text-gray-400 uppercase tracking-[0.2em]">Restricted Access</p>
                </div>
            )}
        </div>
    );
};

export default UserModeration;
