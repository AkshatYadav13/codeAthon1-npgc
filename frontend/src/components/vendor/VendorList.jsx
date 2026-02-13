import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAppStore } from '@/store/useAppStore'
import { Loader2 } from 'lucide-react'

const VendorList = () => {
    const navigate = useNavigate();
    const { vendors, getAllVendors, loading } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    useEffect(() => {
        getAllVendors();
    }, [getAllVendors]);

    const filteredVendors = vendors.filter(vendor => {
        const vendorName = vendor.user?.fullName || "Unknown Vendor";
        const vendorLocation = vendor.user?.location?.address || "Location not specified";

        const matchesSearch = vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendorLocation.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "All" || vendor.foodType === filterType;
        return matchesSearch && matchesFilter;
    });

    if (loading && vendors.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                <p className="text-green-800 font-medium">Finding vendors near you...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-green-900">Locate Your Vendors</h1>
                    <p className="text-green-700 text-lg">Find fresh fruits and vegetables near you</p>
                </div>

                {/* Search and Filter */}
                <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                                <Input
                                    placeholder="Search vendors by name or location..."
                                    className="pl-10 border-green-200 focus:ring-green-500 h-12 text-lg bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-[240px]">
                                <select
                                    className="w-full h-12 px-4 rounded-md border border-green-200 focus:ring-2 focus:ring-green-500 bg-white font-medium text-green-800 outline-none appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23059669\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Fruits">Fruits Only</option>
                                    <option value="Vegetables">Vegetables Only</option>
                                    <option value="Both">Fruits & Veggies</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <Card
                            key={vendor._id}
                            className="overflow-hidden border-green-200 hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white/90 hover:-translate-y-1"
                            onClick={() => navigate(`/vendors/${vendor._id}`)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={vendor.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60"}
                                    alt={vendor.user?.fullName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-sm text-gray-800">{vendor.avgRating?.toFixed(1) || "5.0"}</span>
                                </div>
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                                        {vendor.user?.fullName}
                                    </CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1 text-green-700 min-h-[40px]">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span className="line-clamp-2">{vendor.user?.location?.address || "Location not specified"}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge className={`${vendor.foodType === 'Both' ? 'bg-emerald-500' : 'bg-green-500'} text-white border-none`}>
                                        {vendor.foodType}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all font-semibold">
                                    View Products
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-green-200">
                        <p className="text-xl text-green-800 font-medium">No vendors found matching your criteria.</p>
                        <p className="text-green-600">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VendorList
