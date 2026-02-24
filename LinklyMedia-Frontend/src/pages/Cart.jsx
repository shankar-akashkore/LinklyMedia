// import React, { useEffect, useState } from "react";
// import { Trash } from "@phosphor-icons/react";
// import { useNavigate } from "react-router-dom";

// export default function Cart() {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [removeSuccess, setRemoveSuccess] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await fetch("http://localhost:8000/api/user/cart", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();
//         console.log("Cart data:", data);

//         if (res.ok) {
//           setCartItems(data.usercart || []);
//           setRemoveSuccess(true);
//           setTimeout(() => setRemoveSuccess(false), 3000);
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, []);

//   const handleRemove = async (cartItemId) => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `http://localhost:8000/api/user/cart/remove/${cartItemId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (res.ok) {
//         setCartItems((prev) =>
//           prev.filter((item) => item.cartItemId !== cartItemId),
//         );

//       setRemoveSuccess(true);
//       setTimeout(() => {
//         setRemoveSuccess(false);
//       }, 2000);
//       setRemoveSuccess(true);

//       } else {
//         console.error("Remove failed with status:", res.status);
//       }
//     } catch (err) {
//       console.error("Remove failed:", err);
//     }
//   };

//   const getItemTotal = (item) => item.totalprice || item.price || 0;

//   const getDurationDays = (item) => {
//     if (!item.fromdate || !item.todate) return null;
//     const days = Math.ceil(
//       (new Date(item.todate) - new Date(item.fromdate)) / (1000 * 60 * 60 * 24),
//     );
//     return days > 0 ? days : null;
//   };

//   const total = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);

//   return (
//     <div className="flex justify-center bg-gray-50 py-10">
//       <div className="flex gap-8 w-[1200px]">
//         <div className="flex-1 bg-white p-8 rounded-xl shadow-sm">
//           <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>

//           {loading ? (
//             <p>Loading cart...</p>
//           ) : cartItems.length === 0 ? (
//             <p className="text-gray-400">Your cart is empty</p>
//           ) : (
//             <div className="space-y-5">
//               {cartItems.map((item) => {
//                 const days = getDurationDays(item);
//                 const itemTotal = getItemTotal(item);
//                 const hasMaterialOrMounting =
//                   item.selectedmaterial || item.selectedmounting;

//                 return (
//                   <div
//                     key={item.billboardid}
//                     className="flex gap-5 bg-gray-50 p-4 rounded-xl"
//                   >
//                     <img
//                       src={item.coverImage}
//                       alt={item.title}
//                       className="w-[160px] h-[110px] object-cover rounded-lg flex-shrink-0"
//                     />

//                     <div className="flex-1">
//                       <h2 className="text-lg font-semibold">{item.title}</h2>

//                       {/* <p className="text-xs text-gray-400 mt-1">
//                         {new Date(item.fromdate).toLocaleDateString()} →{" "}
//                         {new Date(item.todate).toLocaleDateString()}
//                         {days && (
//                           <span className="ml-2 bg-[#507c88]/10 text-[#507c88] px-2 py-0.5 rounded-full text-[10px] font-medium">
//                             {days} days
//                           </span>
//                         )}
//                       </p> */}

//                       {hasMaterialOrMounting && (
//                         <div className="flex gap-2 mt-2 flex-wrap">
//                           {item.selectedmaterial && (
//                             <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
//                               📄 {item.selectedmaterial}
//                             </span>
//                           )}
//                           {item.selectedmounting && (
//                             <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
//                               🔩 {item.selectedmounting}
//                             </span>
//                           )}
//                         </div>
//                       )}

//                       <div className="mt-3 flex items-end justify-between">
//                         <div>
//                           {item.materialcost || item.mountingcost ? (
//                             <div className="text-xs text-gray-400 space-y-0.5 mb-1">
//                               <p>Base: ₹{item.price?.toLocaleString()}</p>
//                               {item.materialcost > 0 && (
//                                 <p>
//                                   Material: +₹
//                                   {item.materialcost?.toLocaleString()}
//                                 </p>
//                               )}
//                               {item.mountingcost > 0 && (
//                                 <p>
//                                   Mounting: +₹
//                                   {item.mountingcost?.toLocaleString()}
//                                 </p>
//                               )}
//                             </div>
//                           ) : null}

//                           {/* Total */}
//                           <span className="text-lg font-semibold text-[#507c88]">
//                             ₹{itemTotal.toLocaleString()}
//                           </span>
//                         </div>

//                         {/* {removeSuccess && (
//                           <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
//                             🗑 Item removed from cart!
//                           </div>
//                         )} */}

//                         <button
//                           onClick={() => handleRemove(item.cartItemId)}
//                           className="h-[30px] w-[120px] pl-3 flex items-center gap-1 text-red-400 hover:text-rose-700 hover:bg-red-100 rounded-xl transition-colors"
//                         >
//                           <Trash size={18} />
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* ── Summary ── */}
//         <div className="w-[450px] bg-white p-6 rounded-xl shadow-sm h-fit sticky top-15">
//           <h2 className="text-xl font-semibold mb-4">Summary</h2>

//           <div className="space-y-3 text-sm text-gray-600">
//             <div className="flex justify-between">
//               <span>Items</span>
//               <span>{cartItems.length}</span>
//             </div>

//             <div className="flex justify-between">
//               <span>Taxes</span>
//               <span>0</span>
//             </div>

//             <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-lg text-black">
//               <span>Price</span>
//               <span>₹{total.toLocaleString()}</span>
//             </div>
//           </div>

//           <button onClick={() => navigate("/preview-checkout")}
//             className="ml-13 mt-10 w-[300px] bg-[#507c88] text-[#507c88] py-2 rounded-3xl
//             relative inline-block
//             text-center text-[18px] tracking-[1px]
//             text-[#507c88] bg-transparent
//             cursor-pointer
//             border-2 border-[#507c88]
//             shadow-[inset_0_0_0_0_#507c88]
//             transition-all duration-500 ease-out
//             hover:text-white
//             hover:shadow-[inset_0_-100px_0_0_#507c88]
//             active:scale-90"
//           >
//             Proceed to Checkout
//           </button>
//         </div>

//       </div>

//     </div>

//   );
// }

import React, { useEffect, useState } from "react";
import { Trash, ShoppingCart, Tag } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/user/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCartItems(data.usercart || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/user/cart/remove/${cartItemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok)
        setCartItems((prev) =>
          prev.filter((item) => item.cartItemId !== cartItemId),
        );
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const getDurationDays = (item) => {
    if (!item.fromdate || !item.todate) return null;
    const days = Math.ceil(
      (new Date(item.todate) - new Date(item.fromdate)) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : null;
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const getItemTotal = (item) => item.totalprice || item.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm text-gray-400 mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── Cart Items ── */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100"
                  />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <ShoppingCart
                  size={48}
                  className="mx-auto text-gray-200 mb-4"
                />
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">
                  Browse billboards and add them to your cart
                </p>
                <button
                  onClick={() => navigate("/billboards")}
                  className="mt-6 px-6 py-2.5 bg-[#507c88] text-white text-sm font-semibold rounded-xl hover:bg-[#3d6472] transition"
                >
                  Browse Billboards
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const days = getDurationDays(item);
                  const itemTotal = getItemTotal(item);

                  return (
                    <div
                      key={item.cartItemId}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-36 h-24 object-cover rounded-xl shrink-0 border border-gray-100"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-bold text-gray-800 truncate">
                              {item.title}
                            </h2>
                            <button
                              onClick={() => handleRemove(item.cartItemId)}
                              className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          {/* Dates */}
                          {item.fromdate && item.todate && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-400">
                                {fmt(item.fromdate)} → {fmt(item.todate)}
                              </span>
                              {days && (
                                <span className="text-[10px] bg-[#507c88]/10 text-[#507c88] px-2 py-0.5 rounded-full font-semibold">
                                  {days} days
                                </span>
                              )}
                            </div>
                          )}

                          {/* Material / Mounting tags */}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.selectedmaterial && (
                              <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                                📄 {item.selectedmaterial}
                              </span>
                            )}
                            {item.selectedmounting && (
                              <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                                🔩 {item.selectedmounting}
                              </span>
                            )}
                          </div>

                          {/* Price breakdown */}
                          <div className="flex items-end justify-between mt-3">
                            <div className="text-xs text-gray-400 space-y-0.5">
                              {item.price > 0 && (
                                <p>
                                  Base: ₹{Number(item.price).toLocaleString()}
                                </p>
                              )}
                              {item.materialcost > 0 && (
                                <p>
                                  Material: +₹
                                  {Number(item.materialcost).toLocaleString()}
                                </p>
                              )}
                              {item.mountingcost > 0 && (
                                <p>
                                  Mounting: +₹
                                  {Number(item.mountingcost).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <p className="text-lg font-bold text-[#507c88]">
                              ₹{Number(itemTotal).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="w-80 shrink-0 sticky top-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-gray-700">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span>
                  <span className="font-medium text-gray-700">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-[#507c88]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                  <Tag size={14} className="text-gray-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="text-xs w-full outline-none text-gray-600 placeholder-gray-300"
                  />
                </div>
                <button className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">
                  Apply
                </button>
              </div>

              <button
                onClick={() => navigate("/preview-checkout")}
                disabled={cartItems.length === 0}
                className="w-full mt-4 py-3 bg-[#507c88] hover:bg-[#3d6472] text-white font-bold text-sm rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proceed to Checkout →
              </button>

              <p className="text-center text-xs text-gray-300 mt-3">
                Secure checkout · No hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
