import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const mockOrders = [
    {
        id: "ORD-1234",
        date: "2026-02-13",
        status: "Active",
        items: [
            { name: "Kashmir Apple", quantity: 2, price: 240 },
            { name: "Organic Spinach", quantity: 1, price: 20 }
        ],
        total: 260,
        vendor: "Ram's Fresh Fruits"
    },
    {
        id: "ORD-5678",
        date: "2026-02-10",
        status: "Completed",
        items: [
            { name: "Nagpur Orange", quantity: 3, price: 180 }
        ],
        total: 180,
        vendor: "Sita's Green Vegetables"
    }
];

const Orders = () => {
    const activeOrders = mockOrders.filter(o => o.status === "Active");
    const pastOrders = mockOrders.filter(o => o.status === "Completed");

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-green-900">My Orders</h1>
                    <p className="text-green-700">Track your fresh produce deliveries</p>
                </div>

                {/* Active Orders Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                        <Clock className="h-5 w-5" />
                        <h2>Active Orders</h2>
                    </div>
                    {activeOrders.length > 0 ? (
                        activeOrders.map(order => <OrderCard key={order.id} order={order} />)
                    ) : (
                        <p className="text-gray-500 italic">No active orders</p>
                    )}
                </section>

                {/* Past Orders Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <h2>Past Orders</h2>
                    </div>
                    {pastOrders.length > 0 ? (
                        pastOrders.map(order => <OrderCard key={order.id} order={order} />)
                    ) : (
                        <p className="text-gray-500 italic">No past orders</p>
                    )}
                </section>
            </div>
        </div>
    );
};

const OrderCard = ({ order }) => (
    <Card className="border-green-100 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Order #{order.id}
                    </CardTitle>
                    <CardDescription className="text-green-700">
                        Ordered from {order.vendor} on {order.date}
                    </CardDescription>
                </div>
                <Badge className={order.status === 'Active' ? 'bg-green-600' : 'bg-gray-500'}>
                    {order.status}
                </Badge>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                <div className="divide-y divide-green-50">
                    {order.items.map((item, i) => (
                        <div key={i} className="py-2 flex justify-between text-sm">
                            <span className="text-gray-700">{item.name} x {item.quantity}</span>
                            <span className="font-medium text-green-900">₹{item.price}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-2 border-t border-green-100 flex justify-between items-center">
                    <span className="font-bold text-green-900 text-lg">Total</span>
                    <span className="font-bold text-green-900 text-lg">₹{order.total}</span>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default Orders;
