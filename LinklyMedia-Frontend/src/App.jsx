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
import PartnerDashboard from "./pages/Partner/PartnerDashboard.jsx";
import PartnerHome from "./pages/Partner/PartnerHome.jsx";
import PartnerProfile from "./pages/Partner/PartnerProfile.jsx";
import PartnerBillboards from "./pages/Partner/PartnerBillboards.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Tracking from "./pages/Partner/Tracking.jsx";
import { PartnerOrders, PartnerPending, PartnerHistory } from "./pages/Partner/PartnerBookingPages.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // 👈

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
    location.pathname.startsWith(route)
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
          <Route path="/verify-otp" element={<Otp />} />
          <Route path="/fav-city" element={<FavCities />} />
          <Route path="/billboards" element={<Billboards />} />
          <Route path="/billboards/:id" element={<BillboardsDetails />} />
          <Route path="/digital-screen" element={<Digitalscreen />} />
          <Route path="/influencer-marketing" element={<Influencermarket />} />
          <Route path="/btl-marketing" element={<Btlmarket />} />

          {/* ── Protected routes (any logged-in user) ── */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/preview-checkout" element={<ProtectedRoute><PreviewCheckout /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          {/* ── Partner-only routes ── */}
          <Route
            path="/partner"
            element={
              <ProtectedRoute requiredRole="partner">
                <PartnerDashboard />
              </ProtectedRoute>
            }
          >
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