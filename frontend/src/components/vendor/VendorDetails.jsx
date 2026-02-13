import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft, Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        selectedVendor,
        selectedVendorDishes,
        getVendorById,
        getDishesByVendor,
        loading
    } = useAppStore();

    // State to manage local UI quantities for the cart
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        getVendorById(id);
        getDishesByVendor(id);
    }, [id, getVendorById, getDishesByVendor]);

    useEffect(() => {
        // Load existing cart from local storage to sync quantities
        const savedCart = JSON.parse(localStorage.getItem('cart') || '{}');
        const savedVendorId = localStorage.getItem('currentVendor');

        if (savedVendorId === id) {
            const qtyMap = {};
            Object.values(savedCart).forEach(item => {
                qtyMap[item._id] = item.quantity;
            });
            setQuantities(qtyMap);
        } else {
            setQuantities({});
        }
    }, [id, selectedVendorDishes]);

    const updateQuantity = (dish, delta) => {
        const dishId = dish._id;
        setQuantities(prev => {
            const current = prev[dishId] || 0;
            const updated = Math.max(0, current + delta);

            const newQuantities = { ...prev, [dishId]: updated };

            // Update Local Storage
            const currentCart = JSON.parse(localStorage.getItem('cart') || '{}');
            const currentVendorId = localStorage.getItem('currentVendor');

            let cartToSave = { ...currentCart };

            // Check if switching vendors
            if (currentVendorId && currentVendorId !== id && Object.keys(currentCart).length > 0) {
                if (!window.confirm("Start a new cart? Adding items from this vendor will clear your previous cart.")) {
                    return prev;
                }
                cartToSave = {};
                // Reset local quantities if we clear the cart
                Object.keys(newQuantities).forEach(k => { if (k !== dishId) newQuantities[k] = 0; });
            }

            if (updated > 0) {
                cartToSave[dishId] = {
                    ...dish,
                    id: dishId, // For consistency with any existing logic expecting 'id'
                    quantity: updated,
                    vendorId: id
                };
            } else {
                delete cartToSave[dishId];
            }

            localStorage.setItem('cart', JSON.stringify(cartToSave));
            localStorage.setItem('currentVendor', id);

            return newQuantities;
        });
    };

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    if (loading.selectedVendor && !selectedVendor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                <p className="text-green-800 font-medium">Loading menu...</p>
            </div>
        );
    }

    if (!selectedVendor) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
            <p className="text-xl text-green-800">Vendor not found.</p>
            <Button className="mt-4 bg-green-600" onClick={() => navigate('/vendors')}>Return to Marketplace</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 pb-24 pt-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation & Vendor Header */}
                <div className="space-y-4">
                    <Button variant="ghost" className="text-green-700 hover:text-green-900 hover:bg-green-100 pl-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
                    </Button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                            <img
                                src={selectedVendor.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60"}
                                alt={selectedVendor.user?.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-green-900">{selectedVendor.user?.fullName}</h1>
                                    <div className="flex items-center gap-2 text-green-700 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{selectedVendor.user?.location?.address || "Location not specified"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {selectedVendor.foodType}
                                    </Badge>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-sm text-yellow-700">{selectedVendor.avgRating?.toFixed(1) || "5.0"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product List */}
                <div>
                    <h2 className="text-xl font-bold text-green-900 mb-4 font-outfit">Fresh Products from this Stall</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVendorDishes.map((dish) => (
                            <Card key={dish._id} className="overflow-hidden border-green-100 hover:shadow-md transition-shadow bg-white/90">
                                <CardContent className="p-0 flex h-28">
                                    <div className="w-28 h-28 shrink-0">
                                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-green-900 line-clamp-1">{dish.name}</h3>
                                            <p className="text-green-600 text-sm">₹{dish.price} / {dish.category}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            {(quantities[dish._id] || 0) === 0 ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="ml-auto border-green-600 text-green-600 hover:bg-green-50"
                                                    onClick={() => updateQuantity(dish, 1)}
                                                >
                                                    Add +
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-1 ml-auto border border-green-200">
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-white text-green-700 shadow-sm hover:bg-green-100"
                                                        onClick={() => updateQuantity(dish, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-sm font-bold text-green-900 w-4 text-center">{quantities[dish._id]}</span>
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-green-600 text-white shadow-sm hover:bg-green-700"
                                                        onClick={() => updateQuantity(dish, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedVendorDishes.length === 0 && (loading.selectedVendor === false) && (
                        <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-green-200">
                            <p className="text-xl text-green-800 font-medium">This vendor has no items listed at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Cart Button (Visible if items added) */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                    <Button
                        className="w-full bg-green-900 hover:bg-green-800 text-white shadow-xl py-6 rounded-xl flex justify-between items-center text-lg animate-in fade-in slide-in-from-bottom-5"
                        onClick={() => navigate('/cart')}
                    >
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                                {totalItems} items
                            </div>
                        </div>
                        <span className="font-semibold">View Cart</span>
                        <ShoppingCart className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VendorDetails;
