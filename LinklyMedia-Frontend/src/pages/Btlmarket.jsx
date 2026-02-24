import { Monitor } from "phosphor-react";

export default function Btlmarket() {
  return (
    <div>
      <div className="flex justify-center">
        <div className="flex h-[28px] w-[280px] bg-[#6b9ba8]/20 border-solid rounded-full text-center backdrop-blur-sm justify-center ">
          Transit Media Advertising
        </div>
      </div>
      <div className="text-4xl font-semibold flex text-center justify-center mt-10">
        BTL
        <h1 className="pl-2 bg-radial-[at_50%_75%] from-[#507c88] via-[#457682] to-[#233c47] to-90% bg-clip-text text-transparent">
          Marketing
        </h1>
      </div>
      <p className="flex justify-center mt-6">
        Reach your audience on the move with transit advertising. From buses to
        metros, taxis to auto-rickshaws - capture attention where it matters
        most.
      </p>

      <div className="h-[600px] flex flex-col items-center justify-center text-center">
        <Monitor size={62} className="text-gray-500 mb-4" />
        <p className="text-gray-600 text-lg font-medium">No BTL Found</p>
      </div>
    </div>
  );
}
