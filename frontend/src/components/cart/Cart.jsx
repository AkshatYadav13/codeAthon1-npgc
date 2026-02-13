import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, CheckCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({});
    const [vendorId, setVendorId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState({
        address: '',
        latitude: 0,
        longitude: 0
    });
    const { createOrder, user, userLocation, setLocation } = useAppStore();
    const [isPlacing, setIsPlacing] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedVendorId = localStorage.getItem('currentVendor');
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedVendorId) setVendorId(savedVendorId);

        // Pre-fill with store location if available
        if (userLocation?.address) {
            setDeliveryLocation({
                address: userLocation.address || '',
                latitude: userLocation.lat || 0,
                longitude: userLocation.lng || 0
            });
        }
    }, [user, userLocation]);

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            const currentItem = prev[productId];
            if (!currentItem) return prev;

            const newQty = currentItem.quantity + delta;

            if (newQty <= 0) {
                const newCart = { ...prev };
                delete newCart[productId];

                // If cart becomes empty, clean up
                if (Object.keys(newCart).length === 0) {
                    localStorage.removeItem('cart');
                    localStorage.removeItem('currentVendor');
                } else {
                    localStorage.setItem('cart', JSON.stringify(newCart));
                }
                return newCart;
            }

            const newCart = {
                ...prev,
                [productId]: { ...currentItem, quantity: newQty }
            };
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const cartItems = Object.values(cart);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleConfirmOrder = async () => {
        if (!user) {
            toast.error("Please login to place an order");
            navigate('/login');
            return;
        }

        setIsPlacing(true);
        try {
            // Validate location
            if (!deliveryLocation.address.trim()) {
                toast.error("Please provide a delivery address");
                setIsPlacing(false);
                return;
            }

            if (deliveryLocation.latitude === 0 || deliveryLocation.longitude === 0) {
                if (!window.confirm("Coordinates are not set. This might affect delivery time estimates. Proceed anyway?")) {
                    setIsPlacing(false);
                    return;
                }
            }

            const formattedItems = cartItems.map(item => ({
                dishId: item._id, // Ensure we use _id for the backend
                name: item.name,
                imageUrl: item.image,
                price: item.price,
                quantity: item.quantity
            }));

            const success = await createOrder({
                venderId: vendorId,
                cartItems: formattedItems,
                dropLocation: deliveryLocation
            });

            if (success) {
                setOrderPlaced(true);
                // Clear local state cart
                setCart({});
                setVendorId(null);

                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (error) {
            console.error("Order placement failed:", error);
        } finally {
            setIsPlacing(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
                <CheckCircle className="h-24 w-24 text-green-600 animate-bounce" />
                <h1 className="text-3xl font-bold text-green-900">Order Placed Successfully!</h1>
                <p className="text-green-700">Thank you for ordering fresh interactions.</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-green-900">Your Cart is Empty</h1>
                    <p className="text-green-700">Add some fresh fruits and vegetables to get started.</p>
                </div>
                <Button onClick={() => navigate('/vendors')} className="bg-green-600 hover:bg-green-700 text-white">
                    Browse Vendors
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
                <Button variant="ghost" className="text-green-700 hover:text-green-900 pl-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Button>

                <h1 className="text-3xl font-bold text-green-900">Review Order</h1>

                {/* Location Selection */}
                <Card className="border-green-100 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="bg-green-50/50 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                            <MapPin className="h-5 w-5 text-green-600" />
                            Delivery Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Delivery Address</Label>
                            <Input
                                id="address"
                                placeholder="Enter your full address"
                                value={deliveryLocation.address}
                                onChange={(e) => {
                                    const newAddress = e.target.value;
                                    setDeliveryLocation({ ...deliveryLocation, address: newAddress });
                                    setLocation(newAddress, deliveryLocation.latitude, deliveryLocation.longitude);
                                }}
                                className="border-green-100 focus-visible:ring-green-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs text-gray-500">Coordinates</Label>
                                <div className="text-xs font-mono bg-stone-50 p-2 rounded border border-stone-100 text-gray-600">
                                    {deliveryLocation.latitude.toFixed(4)}, {deliveryLocation.longitude.toFixed(4)}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-6 border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() => {
                                    setIsLocating(true);
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            const { latitude, longitude } = pos.coords;
                                            setDeliveryLocation(prev => ({
                                                ...prev,
                                                latitude,
                                                longitude
                                            }));
                                            setLocation(deliveryLocation.address, latitude, longitude);
                                            setIsLocating(false);
                                            toast.success("Location captured!");
                                        },
                                        () => {
                                            toast.error("Failed to get location");
                                            setIsLocating(false);
                                        }
                                    );
                                }}
                                disabled={isLocating}
                            >
                                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 mr-1" />}
                                Detect Location
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item.id} className="border-green-100">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-green-50" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-900">{item.name}</h3>
                                    <p className="text-green-600 text-sm">₹{item.price} / {item.unit}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-green-200 text-green-700"
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        -
                                    </Button>
                                    <span className="font-bold w-4 text-center text-green-900">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-green-200 text-green-700"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    <p className="font-bold text-green-900">₹{item.price * item.quantity}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between text-lg font-semibold text-green-900">
                            <span>Total Amount</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                <Button
                    className="w-full bg-green-900 hover:bg-green-800 text-white shadow-xl py-6 text-lg font-semibold"
                    onClick={() => setIsConfirmOpen(true)}
                >
                    Place Order (₹{totalAmount})
                </Button>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to place this order for ₹{totalAmount}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="grid flex-1 gap-2">
                            <p className="text-sm text-muted-foreground">
                                Payment usage will be cash on delivery for this prototype.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="secondary" onClick={() => setIsConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                            onClick={handleConfirmOrder}
                            disabled={isPlacing}
                        >
                            {isPlacing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Order"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Cart;
