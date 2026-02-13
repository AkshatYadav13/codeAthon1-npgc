import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Phone, User, Lock, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"

const SignUp = () => {
  const navigate = useNavigate();
  const signUp = useAppStore((state) => state.signUp);
  const loading = useAppStore((state) => state.loading.signUp);

  const [input, setInput] = useState({
    fullname: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "Customer"
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.fullname || !input.phoneNumber || !input.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^\d{10}$/.test(input.phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (input.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (input.password !== input.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await signUp({
      fullName: input.fullname,
      contact: input.phoneNumber,
      password: input.password,
      role: input.role
    });

    if (useAppStore.getState().user) {
      navigate("/");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md border-green-200 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-600" />
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-green-100 rounded-full">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-900">Create Account</CardTitle>
          <CardDescription className="text-green-700 font-medium">
            Order fresh vegetables and fruits from local vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2 mb-4">
              <Label className="text-green-800">I want to register as a:</Label>
              <div className="grid grid-cols-2 gap-4 p-1 bg-green-50 rounded-xl border border-green-100">
                <button
                  type="button"
                  onClick={() => setInput({ ...input, role: "Customer" })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${input.role === "Customer"
                    ? "bg-white text-green-700 shadow-sm font-bold"
                    : "text-green-600 hover:bg-green-100/50"
                    }`}
                >
                  <User className="w-4 h-4" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setInput({ ...input, role: "Vender" })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${input.role === "Vender"
                    ? "bg-white text-green-700 shadow-sm font-bold"
                    : "text-green-600 hover:bg-green-100/50"
                    }`}
                >
                  <Leaf className="w-4 h-4" />
                  Vendor
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-green-800">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                <Input
                  id="fullname"
                  name="fullname"
                  placeholder="Enter your full name"
                  value={input.fullname}
                  onChange={changeEventHandler}
                  className="pl-10 border-green-200 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-green-800">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter 10 digit phone number"
                  value={input.phoneNumber}
                  onChange={changeEventHandler}
                  className="pl-10 border-green-200 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-800">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={input.password}
                    onChange={changeEventHandler}
                    className="pl-10 border-green-200 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-800">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={input.confirmPassword}
                    onChange={changeEventHandler}
                    className="pl-10 border-green-200 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 mt-4 group" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-green-50 bg-green-50/50 py-4">
          <p className="text-sm text-green-700">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-green-800 hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
