import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderID } = location.state || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} weight="fill" color="#507c88" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment was successful and your billboard booking is confirmed.
        </p>

        {/* Order ID */}
        {orderID && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="text-sm font-semibold text-gray-700 break-all">
              {orderID}
            </p>
          </div>
        )}

        {/* What happens next */}
        <div className="text-left bg-[#507c88]/5 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-[#507c88] mb-2">What happens next?</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Partner will start printing within 48 hours</li>
            <li>✓ Billboard will go live on your start date</li>
            <li>✓ You can track status in My Orders</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-[#507c88] text-white py-3 rounded-lg font-semibold hover:bg-[#3d6472] transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;