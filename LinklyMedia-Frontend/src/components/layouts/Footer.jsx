import React from "react";
import {
  DeviceMobile,
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  LinkedinLogo,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#3d5a66] via-[#2d4854] to-[#1e3640] text-white relative overflow-hidden animate-slide-up animation-delay-1000">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6b9ba8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#507c88] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6b9ba8] to-[#507c88] rounded-xl flex items-center justify-center shadow-lg shadow-[#507c88]/30">
                <DeviceMobile
                  size={28}
                  weight="regular"
                  className="text-white"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Linkly Media
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Connecting brands with influencers and audiences. Building the
              future of digital marketing and media partnerships.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#6b9ba8] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6b9ba8]/30"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#6b9ba8] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6b9ba8]/30"
              >
                <TwitterLogo size={20} weight="fill" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-[#6b9ba8] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6b9ba8]/30"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a
                href="https://www.linkedin.com/company/linklymedia/"
                className="w-10 h-10 bg-white/10 hover:bg-[#6b9ba8] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6b9ba8]/30"
              >
                <LinkedinLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/offers"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Offers
                </a>
              </li>
              <li>
                <a
                  href="/partner"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Partner With Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/blog"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/case-studies"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-[#6b9ba8] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#6b9ba8] transition-all duration-200"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Stay Updated</h3>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6b9ba8] focus:ring-2 focus:ring-[#6b9ba8]/30 transition-all duration-200"
              />
              <button className="w-full bg-gradient-to-r from-[#6b9ba8] to-[#507c88] hover:from-[#7aa8b5] hover:to-[#6b9ba8] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#6b9ba8]/30 hover:scale-[1.02] flex items-center justify-center gap-2">
                <span>Subscribe</span>
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} Linkly Media. All rights reserved.
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-400 hover:text-[#6b9ba8] transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-400 hover:text-[#6b9ba8] transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="/cookies"
              className="text-gray-400 hover:text-[#6b9ba8] transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#6b9ba8] to-transparent"></div>
    </footer>
  );
};

export default Footer;
