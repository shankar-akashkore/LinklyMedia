import React from "react";
import { SignOut } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon, KeyboardIcon, TrendUpIcon, ShoppingCartIcon, KanbanIcon, ClockCounterClockwiseIcon} from "@phosphor-icons/react";



export default function PartnerDashboard() {
    const navigate = useNavigate();
    const handelLogout = () => {
    navigate("/signin")
};
    return(
    <div className="">
        <div className="border w-full h-[50px] bg-[#507c88] 
                flex items-center justify-between px-5">
                <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6b9ba8] rounded-xl flex items-center justify-center">
                    <img
                    className="w-7 h-7"
                    src="/images/logo.jpeg"
                    alt="Linkly Media Logo"
                    />
                </div>
                <h1 className="text-lg font-semibold uppercase text-white">
                    Linkly Media
                </h1>
            <span className="inline-flex items-center px-3 py-1 bg-white/20 border border-white/30 rounded-xl text-white text-sm">
            Partner</span>
            </div>

  <button onClick={handelLogout}
  className="flex items-center gap-2 px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white text-sm transition">
    <SignOut size={16} />
    Logout
  </button>
  </div>

  <div className="flex mt-5 mr-2 ml-2">

  {/* Sidebar */}
  <div className="w-64 h-[600px] m-3 bg-gray-200/50 rounded-lg border">
    
    <div className="text-center mt-2 mb-2">
      <h1 className="text-lg font-medium">DashBoard</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <UserCircleIcon size={24} />
      <h1>Profile</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <KeyboardIcon size={24} />
      <h1>Billboards</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <ShoppingCartIcon size={24} />
      <h1>Orders</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <TrendUpIcon size={24} />
      <h1>Tracking</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <KanbanIcon size={24} />
      <h1>Pending</h1>
    </div>

    <hr />

    <div className="flex items-center m-3 gap-3">
      <ClockCounterClockwiseIcon size={24} />
      <h1>History</h1>
    </div>

  </div>

  {/* Main Content - TAKES REMAINING WIDTH */}
  <div className="flex-1 m-3 border rounded-lg ">
    <div className="h-[120px] w-full border bg-[#507c88]/80">
    <h1 className="text-lg text-white pl-3 pt-2">Hi,</h1>
    <h1 className="text-2xl text-white pl-3 font-semibold">User</h1>
    </div>
  </div>

</div>
</div>
    )
}