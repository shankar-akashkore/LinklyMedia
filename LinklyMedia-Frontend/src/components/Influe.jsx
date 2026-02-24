// import React from "react";

// function Influe() {
//     return (
//         <div>
//             <p>HarHari</p>
//         </div>
//     )
// }

// export default Influe;



import { useRef, useState } from "react";
import { Star } from "@phosphor-icons/react";

export default function Adv() {
  const scrollRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="mt-16">
      <hr />
      <h2 className="font-display text-3xl font-semibold mb-16 mt-15">
      TOP INFLUENCERS IN BANGALORE
      </h2>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-12 overflow-x-auto hide-scrollbar pb-6 cursor-grab active:cursor-grabbing"
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="min-w-[320px] bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-600 "
          >
            <div className="h-60 bg-gradient-to-b from-[#2F5962] to-[#1E3E45] rounded-t-2xl relative">
              <span className="flex absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm text-white">
                <Star size={12} weight="fill" color="gold" className="mt-1 mr-1" />
                4.8
              </span>
              <span className="absolute bottom-4 left-4 bg-green-600/20 border border-green-400 text-green-300 px-3 py-1 rounded-full text-sm">
                ● Live
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold">Premium Location {item}</h3>
              <p className="text-sm text-slate-500 mt-2">
                High traffic commercial area with maximum visibility
              </p>

              <div className="mt-4">
                <p className="text-lg font-bold text-teal-700 pb-6">
                  ₹{2500 + item * 500}/day
                </p>
                <button className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
    </div>
  );
}