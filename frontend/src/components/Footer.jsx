import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-green-100 dark:border-green-900 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Fresh Card
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Delivering fresh, organic produce and daily essentials directly from local vendors to your doorstep. Experience quality and convenience with Fresh Card.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Facebook className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Linkedin className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/vendors" label="Browse Vendors" />
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/contact" label="Contact Support" />
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <FooterLink to="/vendor/register" label="Become a Partner" />
              <FooterLink to="/vendor/login" label="Vendor Login" />
              <FooterLink to="/terms" label="Terms & Conditions" />
              <FooterLink to="/privacy" label="Privacy Policy" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-green-600 shrink-0" />
                <span>123 Green Market Street, Fresh City, FC 45678</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-green-600 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-green-600 shrink-0" />
                <span>support@freshcard.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-100 dark:border-green-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Fresh Card. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-500">
            <Link to="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-green-600 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-green-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const SocialIcon = ({ icon, href }) => (
  <a
    href={href}
    className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors"
    >
      {label}
    </Link>
  </li>
);

export default Footer;