import React, { useState, useRef, useEffect } from "react";
import { UserCircle } from "phosphor-react";
import { MagnifyingGlass } from "phosphor-react";
import { ShoppingBag } from "phosphor-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SignInIcon } from "@phosphor-icons/react";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // ── Auth check ──
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    const interval = setInterval(checkLoginStatus, 500);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  // ── Search with debounce ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/search?query=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json();
        console.log("Search status:", res.status, "data:", data);

        if (res.ok && Array.isArray(data)) {
          setResults(data);
          setShowDropdown(true);
        } else {
          setResults([]);
          setShowDropdown(true); // show "no results"
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ── Close search dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedDesktopSearch =
        searchRef.current && searchRef.current.contains(e.target);
      const clickedMobileSearch =
        mobileSearchRef.current && mobileSearchRef.current.contains(e.target);

      if (!clickedDesktopSearch && !clickedMobileSearch) {
        setShowDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Scroll effect ──
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/signin");
  };

  const handleResultClick = (item) => {
    setShowDropdown(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
    navigate(`/billboards/${item.billboardid}`);
  };

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300 ${
        isScrolled ? "bg-[#507c88]/50 text-black" : "bg-[#507c88]"
      }`}
    >
      <div className="sticky top-0 z-50 backdrop-blur-md text-white">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#6b9ba8] rounded-xl flex items-center justify-center">
              <img
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                src="/images/logo.jpeg"
                alt="Linkly Media Logo"
              />
            </div>
            <span
              className={`text-lg sm:text-xl font-semibold tracking-wide uppercase transition-colors duration-300 ${isScrolled ? "text-black" : "text-white"}`}
            >
              <Link
                to="/"
                className="hover:text-white transition-colors duration-200"
              >
                <span className="hidden sm:inline">Linkly Media</span>
                <span className="sm:hidden">Linkly Media</span>
              </Link>
            </span>
          </div>

          {/* ── Search bar ── */}
          <div className="hidden md:flex items-center flex-1 max-w-xl">
            {/* Wrap in a relative div with ref so we can detect outside clicks */}
            <div className="relative w-full" ref={searchRef}>
              <div className="flex items-center bg-[#6b9ba8]/40 backdrop-blur-sm rounded-full border border-[#8bb4c1]/30 overflow-hidden">
                <div className="pl-5 pr-3">
                  <MagnifyingGlass size={25} className="text-white" />
                </div>
                <input
                  type="text"
                  placeholder="Search locations, agencies, influencers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (results.length > 0) setShowDropdown(true);
                  }}
                  className="flex-1 bg-transparent placeholder-gray-300 py-3 pr-4 outline-none text-sm text-white"
                />
                <button className="bg-[#6b9ba8] hover:bg-[#7aa8b5] text-white px-6 py-3 font-medium transition-colors duration-200">
                  Search
                </button>
              </div>

              {/* ── Dropdown — NOW outside the overflow-hidden container ── */}
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-72 overflow-y-auto">
                  {loading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                      <svg
                        className="w-4 h-4 animate-spin text-[#507c88]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Searching…
                    </div>
                  )}

                  {!loading && results.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No results found for "
                      <span className="font-medium text-gray-600">
                        {searchQuery}
                      </span>
                      "
                    </div>
                  )}

                  {!loading &&
                    results.map((item) => (
                      <button
                        key={item.billboardid || item._id}
                        onClick={() => handleResultClick(item)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#507c88]/10 flex items-center justify-center flex-shrink-0">
                          <MagnifyingGlass
                            size={14}
                            className="text-[#507c88]"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-mediume text-gray-800">
                            {item.billboardtitle}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile quick actions */}
          <div className="flex lg:hidden items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => navigate("/cart")}
                className={`p-2 rounded-lg transition-colors ${isScrolled ? "text-black hover:bg-black/10" : "text-white hover:bg-white/20"}`}
                aria-label="Cart"
              >
                <ShoppingBag size={20} weight="fill" className="text-current" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${isScrolled ? "text-black hover:bg-black/10" : "text-white hover:bg-white/20"}`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/cart")}
                className={`flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-xl transition-all duration-200 hover:rounded-2xl ${isScrolled ? "text-black" : "text-white"}`}
              >
                <ShoppingBag size={20} weight="fill" className="text-current" />
                <span
                  className={`font-sm ${isScrolled ? "text-black" : "text-white"}`}
                >
                  Cart
                </span>
              </button>
            ) : (
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 hover:bg-white/20 text-white px-3 py-2 rounded-xl font-medium transition-all duration-200 hover:rounded-2xl cursor-pointer ${isScrolled ? "text-black" : "text-white"}`}
              >
                <SignInIcon size={20} weight="fill" className="text-current" />
                <span
                  className={`text-sm ${isScrolled ? "text-black" : "text-white"}`}
                >
                  Sign Up
                </span>
              </Link>
            )}

            {/* Account dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 hover:bg-white/20 text-white px-3 py-2 rounded-xl font-medium transition-all duration-200 hover:rounded-2xl cursor-pointer"
              >
                <UserCircle size={20} weight="fill" className="text-current" />
                <span
                  className={`text-sm ${isScrolled ? "text-black" : "text-white"}`}
                >
                  My Account
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <UserCircle size={18} className="text-[#507c88]" />
                    <span>Profile</span>
                  </Link>

                  {isLoggedIn && (
                    <Link
                      to="/myorders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ShoppingBag size={18} className="text-[#507c88]" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1" />

                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-500 transition-colors duration-200"
                    >
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link
                      to="/signin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 text-blue-500 transition-colors duration-200"
                    >
                      <span>Login</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-3 space-y-3">
            <div className="relative w-full" ref={mobileSearchRef}>
              <div className="flex items-center bg-[#6b9ba8]/35 rounded-xl border border-[#8bb4c1]/30 overflow-hidden">
                <div className="pl-3 pr-2">
                  <MagnifyingGlass size={18} className="text-white" />
                </div>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowDropdown(true);
                  }}
                  className="flex-1 bg-transparent placeholder-gray-300 py-2.5 pr-3 outline-none text-sm text-white"
                />
              </div>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
                  {loading && (
                    <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                  )}
                  {!loading && results.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No results found for <span className="font-medium text-gray-600">{searchQuery}</span>
                    </div>
                  )}
                  {!loading &&
                    results.map((item) => (
                      <button
                        key={item.billboardid || item._id}
                        onClick={() => handleResultClick(item)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        {item.billboardtitle}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {!isLoggedIn && (
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  <SignInIcon size={18} weight="fill" />
                  Sign Up
                </Link>
              )}
              <Link
                to={isLoggedIn ? "/profile" : "/signin"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                <UserCircle size={18} weight="fill" />
                {isLoggedIn ? "Profile" : "Login"}
              </Link>
              {isLoggedIn && (
                <Link
                  to="/myorders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  <ShoppingBag size={18} weight="fill" />
                  Orders
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
