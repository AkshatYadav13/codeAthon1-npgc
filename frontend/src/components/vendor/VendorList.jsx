import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, MapPin, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"

const vendors = [
    {
        id: 1,
        name: "Ram's Fresh Fruits",
        type: "Fruit",
        rating: 4.8,
        location: "Sector 15, Noida",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJ1aXQlMjBzdGFsbHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: 2,
        name: "Sita's Green Vegetables",
        type: "Vegetable",
        rating: 4.5,
        location: "Sector 18, Noida",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhYmxlJTIwbWFya2V0fGVufDB8fDB8fHww"
    },
    {
        id: 3,
        name: "Organic Farm Direct",
        type: "Both",
        rating: 4.9,
        location: "Sector 62, Noida",
        image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFybWVycyUyMG1hcmtldHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: 4,
        name: "Hari's Exotic Fruits",
        type: "Fruit",
        rating: 4.6,
        location: "Sector 12, Noida",
        image: "https://images.unsplash.com/photo-1595188846399-528574636952?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGZydWl0JTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: 5,
        name: "Fresh Veggie Corner",
        type: "Vegetable",
        rating: 4.3,
        location: "Sector 76, Noida",
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dmVnZXRhYmxlfGVufDB8fDB8fHww"
    },
    {
        id: 6,
        name: "City Market Stalls",
        type: "Both",
        rating: 4.7,
        location: "Sector 50, Noida",
        image: "https://images.unsplash.com/photo-1573489862908-16474b321ba6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcmtldHxlbnwwfHwwfHx8MA%3D%3D"
    }
];

const VendorList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "All" || vendor.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-green-900">Locate Your Vendors</h1>
                    <p className="text-green-700 text-lg">Find fresh fruits and vegetables near you</p>
                </div>

                {/* Search and Filter */}
                <Card className="border-green-200 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-green-600" />
                                <Input
                                    placeholder="Search vendors by name or location..."
                                    className="pl-10 border-green-200 focus:ring-green-500 h-12 text-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-[200px]">
                                <Select
                                    className="h-12 border-green-200 focus:ring-green-500 font-medium text-green-800"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Fruit">Fruits Only</option>
                                    <option value="Vegetable">Vegetables Only</option>
                                    <option value="Both">Fruits & Veggies</option>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <Card
                            key={vendor.id}
                            className="overflow-hidden border-green-200 hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                            onClick={() => navigate(`/vendors/${vendor.id}`)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={vendor.image}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-sm text-gray-800">{vendor.rating}</span>
                                </div>
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl font-bold text-green-900 group-hover:text-green-700 transition-colors">
                                        {vendor.name}
                                    </CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1 text-green-700">
                                    <MapPin className="h-4 w-4" />
                                    {vendor.location}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge variant={vendor.type === 'Both' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                        {vendor.type}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    View Products
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No vendors found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VendorList
