// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const Payment = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // You need to pass cart/order data from preview-checkout via location.state
//   // In your preview-checkout page, navigate like:
//   // navigate("/payment", { state: { cartData } })
//   const { cartData } = location.state || {};

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const startPayment = async () => {
//     try {
//       // 1. Load Razorpay script
//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         setError("Failed to load Razorpay. Check your internet connection.");
//         setLoading(false);
//         return;
//       }

//       // 2. Call your backend to create order
//       const { data } = await axios.post(
//         "http://localhost:8000/api/user/checkout/pay",
//         couponCode: data
//         cartData,                          // send whatever your backend expects
//         { withCredentials: true }
//       );

//       // 3. Open Razorpay popup
//       const options = {
//         key: import.meta.env.RAZORPAY_KEY_ID,  // add this to your .env file
//         amount: data.amount,
//         currency: data.currency,
//         order_id: data.order_id,
//         name: "Linkly Media",
//         description: "Billboard Booking",
//         image: "/images/logo.png",         // optional: your logo
//         handler: async function (paymentResponse) {
//           // 4. Verify payment on backend
//           try {
//             await axios.post(
//               "http://localhost:8000/api/user/checkout/verify",
//               {
//                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
//                 razorpay_order_id: paymentResponse.razorpay_order_id,
//                 razorpay_signature: paymentResponse.razorpay_signature,
//               },
//               { withCredentials: true }
//             );

//             // 5. On success, go to success page
//             navigate("/order-success");
//           } catch (err) {
//             setError("Payment verification failed. Contact support.");
//           }
//         },
//         prefill: {
//           name: data.customerName || "",
//           email: data.customerEmail || "",
//         },
//         theme: {
//           color: "#507c88",
//         },
//         modal: {
//           ondismiss: () => {
//             // User closed the popup without paying
//             navigate("/preview-checkout");
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//       setLoading(false);

//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!cartData) {
//       // If someone navigates directly to /payment without data, send them back
//       navigate("/preview-checkout");
//       return;
//     }
//     startPayment();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="w-10 h-10 border-4 border-[#507c88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-gray-500 text-sm">Opening payment gateway...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <p className="text-red-500 text-sm mb-4">{error}</p>
//           <button
//             onClick={() => navigate("/preview-checkout")}
//             className="bg-[#507c88] text-white px-6 py-2 rounded-lg text-sm"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return null; // Razorpay popup handles the UI
// };

// export default Payment;

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // From preview-checkout: navigate("/payment", { state: { couponCode } })
  const { couponCode = "" } = location.state || {};

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startPayment = async () => {
    try {
      // 1. Load Razorpay script
      //   const token = localStorage.getItem("authToken");
      const token = localStorage.getItem("token");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load Razorpay. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 2. Call backend — payload is just { couponCode }
      //    Backend reads cart from session/cookie itself
      const { data } = await axios.post(
        "http://localhost:8000/api/user/checkout/pay",
        { couponCode }, // ← this is all your backend needs
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // data shape from your Go backend:
      // { orderID, razorpay_order_id, amount, currency, key }

      // 3. Open Razorpay popup
      const options = {
        key: data.key, // ← backend sends the key, no need for .env
        amount: data.amount, // already in paise
        currency: data.currency,
        order_id: data.razorpay_order_id, // ← note: razorpay_order_id not order_id
        name: "Linkly Media",
        description: "Billboard Booking",
        handler: async function (paymentResponse) {
          try {
            // 4. Verify — backend needs orderID + razorpay fields
            await axios.post(
              "http://localhost:8000/api/user/checkout/verify-payment",
              {
                orderID: data.orderID, // from checkout response
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${token}`, // ← ADD THIS to verify call too
                },
              },
            );

            navigate("/order-success", {
              state: { orderID: data.orderID }, // pass orderID to success page
            });
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        theme: { color: "#507c88" },
        modal: {
          ondismiss: () => {
            navigate("/preview-checkout");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    startPayment();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#507c88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Opening payment gateway...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate("/preview-checkout")}
            className="bg-[#507c88] text-white px-6 py-2 rounded-lg text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Payment;
