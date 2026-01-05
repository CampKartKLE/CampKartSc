// client/src/pages/dashboards/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Clock, Star, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/marketplace/ProductCard';
import { getListings, getWishlist, toggleWishlist } from '../../api/listings';
import { useAuth } from '../../context/AuthContext';

const BuyerDashboard = ({ user }) => {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [recentViewsCount, setRecentViewsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);
    const { refreshUser } = useAuth();

    // Sync local wishlist IDs with user data - Only on mount or user change, NOT on every refresh
    useEffect(() => {
        if (user?.wishlist) {
            const ids = user.wishlist.map(w => (typeof w === 'string' ? w : w._id));
            setWishlistIds(ids);
        }
    }, [user?._id]); // Depend on ID only to prevent overwriting local state during optimistic updates

    const handleToggleWishlist = async (productId) => {
        // Optimistic Update
        const isCurrentlySaved = wishlistIds.includes(productId);
        const newWishlistIds = isCurrentlySaved
            ? wishlistIds.filter(id => id !== productId)
            : [...wishlistIds, productId];

        setWishlistIds(newWishlistIds);

        try {
            await toggleWishlist(productId);
            // We still refresh to ensure server consistency and get full objects for the bottom list
            await refreshUser();

<<<<<<< HEAD
            // Refresh local wishlist stats
            const wishlistRes = await getWishlist();
            if (wishlistRes.success) {
                setSavedItems(wishlistRes.data.slice(0, 3));
                setWishlistCount(wishlistRes.data.length);
            }
=======
            // Refresh local wishlist stats (bottom list)
            const wishlistData = await getWishlist();
            setSavedItems(wishlistData.slice(0, 3));
            setWishlistCount(wishlistData.length);
>>>>>>> 49fe6f3222bf57fc4237bc7a5839841a671f4e44
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            // Revert on failure
            setWishlistIds(wishlistIds);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all listings for recommendations
                const listingsRes = await getListings();
                const allProducts = listingsRes.success ? listingsRes.data : [];
                setRecommendedItems(allProducts.slice(0, 4));

                // Set recent views count
                setRecentViewsCount(Math.min(allProducts.length, 12));

                // Fetch actual wishlist
                try {
                    const wishlistRes = await getWishlist();
                    if (wishlistRes.success) {
                        setSavedItems(wishlistRes.data.slice(0, 3));
                        setWishlistCount(wishlistRes.data.length);
                    }
                } catch (wishlistError) {
                    console.error('Failed to fetch wishlist:', wishlistError);
                    setWishlistCount(0);
                    setSavedItems([]);
                }
            } catch (error) {
                console.error('Failed to fetch buyer dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchData();
        }
    }, [user?.email]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-blue-100 text-lg">Find your next adventure gear in the marketplace</p>
                </div>
                {/* Decorative element */}
                <ShoppingBag className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 -rotate-12" />
            </div>

            {/* Buyer Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Heart size={16} className="text-red-500" /> Saved Gear
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{wishlistCount} Items</div>
                        <Link to="/profile?tab=saved" className="text-xs text-blue-600 hover:underline font-medium mt-1 inline-block">View wishlist</Link>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Clock size={16} className="text-orange-500" /> Recent Views
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{recentViewsCount} Items</div>
                        <p className="text-xs text-gray-400 mt-1">Based on your activity</p>
                    </CardContent>
                </Card>

                {!user?.isApprovedSeller && user?.role !== 'seller' && (
                    <Card className="bg-gradient-to-br from-campus-blue to-blue-700 text-white border-none shadow-md hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                        <Link to="/profile/apply-seller" className="absolute inset-0 z-30"></Link>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <CardHeader className="pb-2 relative z-20">
                            <CardTitle className="text-sm font-bold text-blue-100 uppercase flex items-center gap-2">
                                <Star size={16} className="text-yellow-400" /> Sell on CampKart
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-20">
                            <div className="text-2xl font-bold">Become a Seller</div>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs text-blue-100 font-medium">Start listing your items today</p>
                                <div className="bg-white/20 p-1 rounded-full">
                                    <TrendingUp size={12} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(user?.isApprovedSeller || user?.role === 'seller') && (
                    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                                <TrendingUp size={16} className="text-green-500" /> Price Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">0 Notifications</div>
                            <p className="text-xs text-gray-400 mt-1">No price drops yet</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recommendations */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Recommended for You</h3>
                    <Link to="/marketplace">
                        <Button variant="ghost" className="text-blue-600 font-semibold flex items-center gap-1">
                            Browse All <Filter size={16} />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedItems.map(item => (
                        <ProductCard
                            key={item.id}
                            product={item}
                            isFavorite={wishlistIds.includes(item._id)}
                            onToggleFavorite={handleToggleWishlist}
                        />
                    ))}
                </div>
            </div>

            {/* Saved Items Sneak Peek */}
            {savedItems.length > 0 && (
                <div className="bg-gray-50 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Your Watchlist</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {savedItems.map(item => (
                            <Link key={item._id} to={`/item/${item._id}`} className="group">
                                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-transparent group-hover:border-blue-100 transition-all">
                                    <img src={item.images[0]} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                                        <p className="text-blue-600 font-bold">₹{item.price}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:text-blue-600">
                                        <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for ArrowRight used in sneak peek
const ArrowRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
);

export default BuyerDashboard;
