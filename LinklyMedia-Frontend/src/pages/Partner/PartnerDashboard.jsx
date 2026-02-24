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
      <header className="w-full h-[52px] bg-[#507c88] flex items-center justify-between px-5 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
            <img
              src="/images/logo.jpeg"
              alt="Linkly Media"
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>
          <span className="text-white font-semibold text-base tracking-wide uppercase">
            Linkly Media
          </span>
          <span className="px-2.5 py-0.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-medium">
            Partner
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg text-white text-sm transition-colors duration-150"
        >
          <SignOut size={15} />
          Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 p-3 gap-3 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <Link
              to="/partner"
              className="text-xs font-semibold text-gray-600 uppercase tracking-widest hover:text-[#507c88] transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <nav className="flex-1 py-2">
            {NAV_ITEMS.map(({ label, icon: Icon, path, badge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-md font-large transition-colors duration-100 ` +
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
