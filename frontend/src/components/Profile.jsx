import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Shield, Edit2, Check, X, Loader2 } from "lucide-react";

const Profile = () => {
    const { user, getProfile, updateProfile, loading } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        contact: "",
        location: "",
    });

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                contact: user.contact || "",
                location: user.location || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        await updateProfile(formData);
        setIsEditing(false);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {getInitials(user.fullName)}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.fullName}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-green-600 font-medium">
                        <Shield className="h-4 w-4" />
                        <span>{user.role}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-green-100 dark:border-green-900">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </div>
                        {!isEditing ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-green-200"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-red-200 text-red-600"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 border-green-100 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 border-green-100 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                        <Input
                                            id="contact"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 border-green-100 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                        <Input
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. New Delhi, India"
                                            className="pl-10 border-green-100 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                        disabled={loading.profileUpdate}
                                    >
                                        {loading.profileUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-green-100 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Role</span>
                                    <span className="font-semibold text-green-700">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Member Since</span>
                                    <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                {user.role === "Vender" && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Vendor ID</span>
                                        <span className="font-xs font-mono bg-white px-2 py-0.5 rounded border border-green-100 truncate max-w-[120px]">
                                            {user.venderId || "N/A"}
                                        </span>
                                    </div>
                                )}
                                {user.role === "Customer" && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Customer ID</span>
                                        <span className="font-xs font-mono bg-white px-2 py-0.5 rounded border border-green-100 truncate max-w-[120px]">
                                            {user.customerId || "N/A"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
