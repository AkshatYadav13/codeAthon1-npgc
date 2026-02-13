import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingBag, Store, CheckCircle2, Star, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-32 bg-stone-50/50">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl px-4 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-green-100/50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-sm animate-in fade-in slide-in-from-bottom-2">
                <Badge variant="outline" className="bg-emerald-600 text-white border-none text-[10px] uppercase font-bold px-1.5 h-4">New</Badge>
                <span>Fresh Produce & Trusted Vendors</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-stone-900 leading-[1.1] tracking-tight">
                Fresh Produce, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  Trusted Vendors
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-stone-600 leading-relaxed max-w-xl">
                Empowering Indian street vendors with modern digital tools. Get farm-fresh vegetables and fruits delivered from your neighborhood stall.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-7 rounded-2xl text-lg font-bold shadow-xl shadow-emerald-200/50 transition-all hover:scale-105 active:scale-95 group"
                  onClick={() => navigate('/vendors')}
                >
                  Explore Vendors
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-7 rounded-2xl text-lg font-bold transition-all"
                  onClick={() => navigate('/register')}
                >
                  <Store className="mr-2 h-5 w-5" />
                  Join as Vendor
                </Button>
              </div>

              {/* Stats Preview */}
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                    50k+
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-stone-500 font-medium">Trusted by thousands of families</p>
                </div>
              </div>
            </div>

            {/* Right Image Container */}
            <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                  alt="Healthy Produce"
                  className="w-full h-full object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Decorative Card 1 */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Quality</p>
                    <p className="text-sm font-extrabold text-stone-900">100% Freshness Guarantee</p>
                  </div>
                </div>
              </div>

              {/* Decorative Card 2 */}
              <div className="absolute top-10 -right-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-800 font-bold">Fast Checkout</p>
                    <p className="text-[10px] text-emerald-600 font-medium leading-none">From your local stall</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 transition-colors shadow-sm">
              <Users className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-4xl font-black text-emerald-900 mb-2">5000+</h3>
              <p className="text-emerald-700 font-bold">Active Vendors</p>
              <p className="text-sm text-emerald-600/70 mt-2">Dignifying street vendors with tech</p>
            </div>
            <div className="p-8 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200">
              <ShoppingBag className="h-10 w-10 text-emerald-100 mx-auto mb-4" />
              <h3 className="text-4xl font-black mb-2">50k+</h3>
              <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">Happy Customers</p>
              <p className="text-emerald-100/70 text-sm mt-2 font-medium leading-relaxed">Daily fresh deliveries across the city</p>
            </div>
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 transition-colors shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-4xl font-black text-emerald-900 mb-2">100%</h3>
              <p className="text-emerald-700 font-bold">Hygiene Standards</p>
              <p className="text-sm text-emerald-600/70 mt-2">Connecting farm to your kitchen</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-emerald-600/10 blur-[120px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 max-w-3xl mx-auto leading-tight">
            Ready to change the way you shop for groceries?
          </h2>
          <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
            Experience the digital stall revolution today. Fresh, reliable, and just a click away.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-7 rounded-2xl text-xl font-black"
              onClick={() => navigate('/vendors')}
            >
              Start Exploring
            </Button>
            <p className="text-stone-500 font-medium">Or <span className="text-white cursor-pointer hover:underline underline-offset-4 font-bold" onClick={() => navigate('/register')}>Register your business</span></p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
