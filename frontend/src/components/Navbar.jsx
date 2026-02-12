import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/store/useAppStore";

const Navbar = () => {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="sticky top-0 z-30 w-full flex justify-between items-center px-4 py-3 border-b bg-white dark:bg-gray-900 shadow-sm">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        LOGO
      </Link>

      <div className="flex items-center gap-3">
        {/* Desktop Theme Toggle */}
        <div className="hidden md:block">
          <ThemeToggleButton theme={theme} setTheme={setTheme} />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileSidebar theme={theme} setTheme={setTheme} />
        </div>
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
      className="rounded-full relative"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Moon
        className={`h-5 w-5 transition-all duration-300 ${
          theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

// --------------------------
// Mobile Sidebar
// --------------------------
const MobileSidebar = ({ theme, setTheme }) => {
  return (
    <Sheet>
      <SheetTrigger className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Menu className="w-6 h-6" />
      </SheetTrigger>

      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Bite Buddy
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col mt-6 space-y-4">
          {/* Profile Link */}
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;
