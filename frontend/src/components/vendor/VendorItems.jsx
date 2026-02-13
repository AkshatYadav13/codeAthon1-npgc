import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Package, Trash2, Edit } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialItems = [
    { id: 101, name: "Apple (Kashmir)", price: 120, unit: "kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60" },
    { id: 102, name: "Banana (Robusta)", price: 40, unit: "dozen", image: "https://images.unsplash.com/photo-1571771896612-61871f0ee6bd?w=500&auto=format&fit=crop&q=60" },
    { id: 103, name: "Orange (Nagpur)", price: 60, unit: "kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60" },
];

const VendorItems = () => {
    const [items, setItems] = useState(initialItems);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', unit: '', image: '', description: '', imageFile: null });

    const handleAddItem = (e) => {
        e.preventDefault();

        let imageUrl = newItem.image;
        if (newItem.imageFile) {
            imageUrl = URL.createObjectURL(newItem.imageFile);
        }

        const itemToAdd = {
            id: Date.now(),
            name: newItem.name,
            price: parseFloat(newItem.price) || 0,
            unit: newItem.unit,
            description: newItem.description,
            image: imageUrl || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60"
        };
        setItems([itemToAdd, ...items]);
        setNewItem({ name: '', price: '', unit: '', image: '', description: '', imageFile: null });
        setIsAddOpen(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, imageFile: file });
        }
    };

    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-green-900">Manage Your Items</h1>
                        <p className="text-green-700">Add or edit products listed in your store</p>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                <span className="hidden sm:inline">Add New Item</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the fresh produce you want to list.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddItem} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        className="col-span-3"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        required
                                        placeholder="e.g. Fresh Mangoes"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="col-span-3"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        required
                                        placeholder="100"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="unit" className="text-right">Unit</Label>
                                    <Input
                                        id="unit"
                                        className="col-span-3"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        required
                                        placeholder="kg, dozen, bunch"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="description" className="text-right mt-2">Description</Label>
                                    <textarea
                                        id="description"
                                        className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        required
                                        placeholder="Describe your produce..."
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="image" className="text-right">Upload Image</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="image"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                                        List Item
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-green-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-0 flex h-28">
                                <div className="w-28 h-28 shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-green-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-green-600 text-xs font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded border border-green-100 mb-1">
                                                ₹{item.price} / {item.unit}
                                            </p>
                                            <p className="text-gray-500 text-[10px] line-clamp-2 leading-tight">
                                                {item.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => deleteItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-green-500 font-semibold">
                                        <Package className="h-3 w-3" />
                                        In Stock
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-3">
                            <Package className="h-12 w-12 text-green-200 mx-auto" />
                            <p className="text-green-700 font-medium">No items listed yet. Start adding your fresh produce!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorItems;
