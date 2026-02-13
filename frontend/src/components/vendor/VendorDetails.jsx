import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

// Mock Data for Vendors (Ideally this would come from an API/Store based on ID)
const vendorData = {
    1: {
        name: "Ram's Fresh Fruits",
        type: "Fruit",
        rating: 4.8,
        location: "Sector 15, Noida",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        products: [
            { id: 101, name: "Apple (Kashmir)", price: 120, unit: "kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60" },
            { id: 102, name: "Banana (Robusta)", price: 40, unit: "dozen", image: "https://images.unsplash.com/photo-1571771896612-61871f0ee6bd?w=500&auto=format&fit=crop&q=60" },
            { id: 103, name: "Orange (Nagpur)", price: 60, unit: "kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60" },
            { id: 104, name: "Pomegranate", price: 150, unit: "kg", image: "https://images.unsplash.com/photo-1615485925763-867862f809d3?w=500&auto=format&fit=crop&q=60" },
        ]
    },
    // Fallback data for any other ID for demo purposes
    "demo": {
        name: "Sita's Green Vegetables",
        type: "Vegetable",
        rating: 4.5,
        location: "Sector 18, Noida",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
        products: [
            { id: 201, name: "Potato (Pahadi)", price: 30, unit: "kg", image: "https://images.unsplash.com/photo-1518977676644-7186062f3bd0?w=500&auto=format&fit=crop&q=60" },
            { id: 202, name: "Onion (Nasik)", price: 45, unit: "kg", image: "https://images.unsplash.com/photo-1508747703725-7197b963ad71?w=500&auto=format&fit=crop&q=60" },
            { id: 203, name: "Tomato (Hybrid)", price: 25, unit: "kg", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60" },
            { id: 204, name: "Spinach (Fresh)", price: 20, unit: "bunch", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60" },
        ]
    }
};

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Use specific vendor data if exists, else fallback to demo data
    const vendor = vendorData[id] || vendorData["demo"];

    // State to manage cart/quantities
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        // Load existing cart from local storage
        const savedCart = localStorage.getItem('cart');
        const savedVendorId = localStorage.getItem('currentVendor');

        if (savedCart && savedVendorId) {
            // If switching vendors, might want to warn user. For now, we will just load if same vendor, else clear.
            if (savedVendorId === id) {
                const parsedCart = JSON.parse(savedCart);
                const qtyMap = {};
                Object.values(parsedCart).forEach(item => {
                    qtyMap[item.id] = item.quantity;
                });
                setQuantities(qtyMap);
            }
        }
    }, [id]);

    const updateQuantity = (productId, delta) => {
        setQuantities(prev => {
            const current = prev[productId] || 0;
            const updated = Math.max(0, current + delta);

            const newQuantities = { ...prev, [productId]: updated };

            // Update Local Storage
            const currentCart = JSON.parse(localStorage.getItem('cart') || '{}');
            const currentVendorId = localStorage.getItem('currentVendor');

            // Reset cart if switching vendors and adding items
            let cartToSave = { ...currentCart };
            if (currentVendorId && currentVendorId !== id && Object.keys(currentCart).length > 0) {
                if (!window.confirm("Start a new cart? Adding items from this vendor will clear your previous cart.")) {
                    return prev; // Cancel action
                }
                cartToSave = {}; // Clear cart
            }

            const product = vendor.products.find(p => p.id === productId);
            if (updated > 0) {
                cartToSave[productId] = { ...product, quantity: updated, vendorId: id };
            } else {
                delete cartToSave[productId];
            }

            localStorage.setItem('cart', JSON.stringify(cartToSave));
            localStorage.setItem('currentVendor', id);

            return newQuantities;
        });
    };

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation & Vendor Header */}
                <div className="space-y-4">
                    <Button variant="ghost" className="text-green-700 hover:text-green-900 hover:bg-green-100 pl-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
                    </Button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-green-900">{vendor.name}</h1>
                                    <div className="flex items-center gap-2 text-green-700 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{vendor.location}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {vendor.type}
                                    </Badge>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-sm text-yellow-700">{vendor.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product List */}
                <div>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Fresh Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendor.products.map((product) => (
                            <Card key={product.id} className="overflow-hidden border-green-100 hover:shadow-md transition-shadow">
                                <CardContent className="p-0 flex h-28">
                                    <div className="w-28 h-28 shrink-0">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-green-900 line-clamp-1">{product.name}</h3>
                                            <p className="text-green-600 text-sm">₹{product.price} / {product.unit}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            {(quantities[product.id] || 0) === 0 ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="ml-auto border-green-600 text-green-600 hover:bg-green-50"
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                >
                                                    Add +
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-1 ml-auto border border-green-200">
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-white text-green-700 shadow-sm hover:bg-green-100"
                                                        onClick={() => updateQuantity(product.id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-sm font-bold text-green-900 w-4 text-center">{quantities[product.id]}</span>
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-green-600 text-white shadow-sm hover:bg-green-700"
                                                        onClick={() => updateQuantity(product.id, 1)}
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
                </div>
            </div>

            {/* Floating Cart Button (Visible if items added) */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                    <Button
                        className="w-full bg-green-900 hover:bg-green-800 text-white shadow-xl py-6 rounded-xl flex justify-between items-center text-lg"
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
