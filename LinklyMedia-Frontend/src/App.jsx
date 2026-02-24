// import React from "react";
// import { Routes, Route, useLocation } from "react-router-dom";
// import Navbar from "./components/layouts/Navbar";
// import Footer from "./components/layouts/Footer";
// import Home from "./pages/home";
// import Signin from "./pages/SignIn";
// import Brand from "./components/brand";
// import Gridlayout from "./components/Gridlayout";
// import Adv from "./components/Adv";
// import Influe from "./components/Influe";
// import Billboards from "./pages/Billboards";
// import Digitalscreen from "./pages/Digitalscreen";
// import Influencermarket from "./pages/Influencermarket";
// import Btlmarket from "./pages/btlmarket";
// import BillboardsDetails from "./pages/BillboardsDetails.jsx";
// import SignUp from "./pages/SignUp.jsx";
// import PartnerForm from "./pages/PartnerForm.jsx";
// import Cart from "./pages/Cart.jsx";
// import Otp from "./pages/Otp.jsx";
// import Profile from "./pages/Profile.jsx";
// import FavCities from "./pages/FavCities.jsx";
// import PreviewCheckout from "./pages/PreviewCheckout.jsx";
// import PartnerDashboard from "./pages/PD.jsx";

// const HIDDEN_CHROME_ROUTES = [
//   "/partner",
//   "/signin",
//   "/signup",
//   "/partnerform",
//   "/verify-otp",
//   "/fav-city",
// ];

// function MainHome() {
//   return (
//     <>
//       <Home />
//       <Brand />
//       <Gridlayout />
//       <Adv />
//     </>
//   );
// }

// export default function App() {
//   const location = useLocation();

//   const hideChrome = HIDDEN_CHROME_ROUTES.some((route) =>
//     location.pathname.startsWith(route)
//   );
//   return (
//     <div className="flex flex-col min-h-screen">
//       {!hideChrome && <Navbar />}

//       <main className="flex-grow bg-gray-50">
//         <Routes>
//           <Route path="/" element={<MainHome />} />
//           <Route path="/signin" element={<Signin />} />
//           <Route path="/signup" element={<SignUp />} />
//           <Route path="/partnerform" element={<PartnerForm />} />
//           <Route path="/billboards" element={<Billboards />} />
//           <Route path="/digital-screen" element={<Digitalscreen />} />
//           <Route path="/influencer-marketing" element={<Influencermarket />} />
//           <Route path="/btl-marketing" element={<Btlmarket />} />
//           <Route path="/billboards/:id" element={<BillboardsDetails />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/verify-otp" element={<Otp />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/fav-city" element={<FavCities />} />
//           <Route path="/preview-checkout" element={<PreviewCheckout />} />
//           <Route path="/partner" element={<PartnerDashboard />} />
//         </Routes>
//       </main>

//       {!hideChrome && <Footer />}
//     </div>
//   );
// }

import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";
import Home from "./pages/Home";
import Signin from "./pages/SignIn";
import Brand from "./components/Brand";
import Gridlayout from "./components/Gridlayout";
import Adv from "./components/Adv";

import Billboards from "./pages/Billboards";
import Digitalscreen from "./pages/Digitalscreen";
import Influencermarket from "./pages/Influencermarket";
 import Btlmarket from "./pages/Btlmarket";
import BillboardsDetails from "./pages/BillboardsDetails.jsx";
import SignUp from "./pages/SignUp.jsx";
import PartnerForm from "./pages/PartnerForm.jsx";
import Cart from "./pages/Cart.jsx";
import Otp from "./pages/Otp.jsx";
import Profile from "./pages/Profile.jsx";
import FavCities from "./pages/FavCities.jsx";
import PreviewCheckout from "./pages/PreviewCheckout.jsx";
import AddBillboard from "./pages/Partner/AddBillboard.jsx";
import BillboardDetail from "./pages/Partner/BillboardDetails.jsx";
import OrderDetail from "./pages/Partner/OrderDetail.jsx";
import Payment from "./pages/Payment.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
// Partner Dashboard shell + all child pages
import PartnerDashboard from "./pages/Partner/PartnerDashboard.jsx";
import PartnerHome from "./pages/Partner/PartnerHome.jsx";
import PartnerProfile from "./pages/Partner/PartnerProfile.jsx";
import PartnerBillboards from "./pages/Partner/PartnerBillboards.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Tracking from "./pages/Partner/Tracking.jsx";

import {
  PartnerOrders,
  PartnerPending,
  PartnerHistory,
} from "./pages/Partner/PartnerBookingPages.jsx";

const HIDDEN_CHROME_ROUTES = [
  "/partner",
  "/signin",
  "/signup",
  "/partnerform",
  "/verify-otp",
  "/fav-city",
];

function MainHome() {
  return (
    <>
      <Home />
      <Brand />
      <Gridlayout />
      <Adv />
    </>
  );
}

export default function App() {
  const location = useLocation();

  const hideChrome = HIDDEN_CHROME_ROUTES.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <Navbar />}

      <main className="flex-grow bg-gray-50">
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<MainHome />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/partnerform" element={<PartnerForm />} />
          <Route path="/billboards" element={<Billboards />} />
          <Route path="/digital-screen" element={<Digitalscreen />} />
          <Route path="/influencer-marketing" element={<Influencermarket />} />
          <Route path="/btl-marketing" element={<Btlmarket />} />
          <Route path="/billboards/:id" element={<BillboardsDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/verify-otp" element={<Otp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fav-city" element={<FavCities />} />
          <Route path="/preview-checkout" element={<PreviewCheckout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/myorders" element={<MyOrders />} />
          {/* <Route path="/order-success" element={<OrderSuccess />} /> */}

          {/* <Route path="/billboards/new" element={<AddBillboard />} /> */}

          {/* ── Partner Dashboard (nested) ── */}
          <Route path="/partner" element={<PartnerDashboard />}>
            <Route index element={<PartnerHome />} />
            <Route path="profile" element={<PartnerProfile />} />
            <Route path="billboards" element={<PartnerBillboards />} />
            <Route path="billboards/new" element={<AddBillboard />} />
            <Route path="billboards/:id" element={<BillboardDetail />} />
            <Route path="orders" element={<PartnerOrders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="pending" element={<PartnerPending />} />
            <Route path="history" element={<PartnerHistory />} />
          </Route>
        </Routes>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}
