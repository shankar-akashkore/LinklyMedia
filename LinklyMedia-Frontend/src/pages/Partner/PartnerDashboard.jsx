import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { SignOut } from "@phosphor-icons/react";
import {
  UserCircleIcon,
  SquaresFourIcon,
  ShoppingCartIcon,
  TrendUpIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";

// Statuses that mean the partner still needs to take action
const NEEDS_ACTION = ["PENDING", "CONFIRMED"];

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch("http://localhost:8000/api/partner/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const data = await r.json();

        // Count orders that have at least one item still needing action
        const count = (data.bookings || []).filter((order) =>
          order.partnerItems?.some((item) =>
            NEEDS_ACTION.includes(item.status),
          ),
        ).length;

        setNewOrderCount(count);
      } catch (_) {}
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const NAV_ITEMS = [
    {
      label: "Profile",
      icon: UserCircleIcon,
      path: "/partner/profile",
      badge: 0,
    },
    {
      label: "Billboards",
      icon: SquaresFourIcon,
      path: "/partner/billboards",
      badge: 0,
    },
    {
      label: "Orders",
      icon: ShoppingCartIcon,
      path: "/partner/orders",
      badge: newOrderCount,
    },
    {
      label: "Tracking",
      icon: TrendUpIcon,
      path: "/partner/tracking",
      badge: 0,
    },
    {
      label: "History",
      icon: ClockCounterClockwiseIcon,
      path: "/partner/history",
      badge: 0,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="h-[100px] w-full bg-[#507c88] flex items-center justify-between px-3 sm:px-5 py-2 sm:h-[52px] shadow-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 shrink-0">
            <img
              src="/images/logo.jpeg"
              alt="Linkly Media"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-cover"
            />
          </div>
          <span className="text-white font-semibold text-sm sm:text-base tracking-wide uppercase truncate">
            Linkly Media
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-medium">
            Partner
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/25 border border-white/30 rounded-full text-white text-xs sm:text-sm transition-colors duration-150 shrink-0"
        >
          <SignOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="hidden lg:block px-4 py-3 border-b border-gray-100">
            <Link
              to="/partner"
              className="text-xs font-semibold text-gray-600 uppercase tracking-widest hover:text-[#507c88] transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <nav className="flex-1 py-2 lg:py-2 overflow-x-auto lg:overflow-visible">
            <div className="flex lg:block px-2 lg:px-0 gap-2 lg:gap-0 min-w-max lg:min-w-0">
            {NAV_ITEMS.map(({ label, icon: Icon, path, badge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 lg:gap-3 mx-0 lg:mx-2 px-3 py-2 lg:py-2.5 rounded-lg text-sm lg:text-md font-medium transition-colors duration-100 whitespace-nowrap ` +
                  (isActive
                    ? "bg-[#507c88]/20 text-[#507c88]"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-1000")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} weight={isActive ? "fill" : "regular"} />
                    <span className="flex-1">{label}</span>

                    {badge > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
