import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, User, ClipboardList, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/store/useAppStore";

const Navbar = () => {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="sticky top-0 z-30 w-full flex justify-between items-center px-4 py-3 border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-green-100 dark:border-green-900 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Sidebar Menu Trigger */}
        <MobileSidebar theme={theme} setTheme={setTheme} />

        {/* Logo */}
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Fresh Card
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop Theme Toggle */}
        <div className="hidden md:block">
          <ThemeToggleButton theme={theme} setTheme={setTheme} />
        </div>

        {/* Profile Icon */}
        <Link
          to="/profile"
          className="h-9 w-9 flex items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          Z
        </Link>
      </div>
    </div>
  );
};

// --------------------------
// Theme Toggle Button
// --------------------------
const ThemeToggleButton = ({ theme, setTheme }) => {
  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-full relative border-green-100 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-900/20"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Moon
        className={`h-5 w-5 transition-all duration-300 ${theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
          }`}
      />
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
      />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

// --------------------------
// Mobile Sidebar (Menu)
// --------------------------
const MobileSidebar = ({ theme, setTheme }) => {
  return (
    <Sheet>
      <SheetTrigger className="p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
        <Menu className="w-6 h-6 text-green-700" />
      </SheetTrigger>

      <SheetContent side="left" className="w-64 border-r border-green-100 dark:border-green-900">
        <SheetHeader>
          <SheetTitle>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Fresh Card
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col mt-6 space-y-4">
          {/* Main Links */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-900 dark:text-green-50 font-medium"
          >
            Home
          </Link>
          <Link
            to="/vendors"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-900 dark:text-green-50 font-medium"
          >
            Vendors
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-900 dark:text-green-50 font-medium"
          >
            Cart
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-900 dark:text-green-50 font-medium"
          >
            <ClipboardList className="w-5 h-5 text-green-700" />
            Orders
          </Link>
          <Link
            to="/vendor/items"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-900 dark:text-green-50 font-medium"
          >
            <Package className="w-5 h-5 text-green-700" />
            Manage Items
          </Link>

          <hr className="border-green-100 dark:border-green-900 my-2" />

          {/* Profile Link */}
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-600 text-white font-bold">
              Z
            </div>
            <span className="font-medium text-green-900 dark:text-green-50">Profile</span>
          </Link>

          {/* Theme Toggle (Mobile) */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors w-full text-left"
          >
            {theme === "light" ? <Moon className="w-5 h-5 text-green-700" /> : <Sun className="w-5 h-5 text-green-700" />}
            <span className="font-medium text-green-900 dark:text-green-50">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;
