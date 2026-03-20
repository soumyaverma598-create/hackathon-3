'use client';

export default function GovernmentBranding() {
  return (
    <div className="w-full bg-gradient-to-r from-[#1e3a6f] via-[#2a4a8f] to-[#1e3a6f] text-white py-3 border-b-2 border-[#c4622d] shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-center">
        {/* Government Emblem Placeholder */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-10 h-10 rounded-full border-2 border-[#c4622d] flex items-center justify-center flex-shrink-0">
            <span className="text-[#c4622d] font-bold text-lg">🇮🇳</span>
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-xs font-semibold tracking-widest uppercase">Ministry of Environment,</span>
            <span className="text-xs font-semibold tracking-widest uppercase">Forest and Climate Change</span>
          </div>
          <div className="hidden sm:block w-10 h-10 rounded-full border-2 border-[#c4622d] flex items-center justify-center flex-shrink-0">
            <span className="text-[#c4622d] font-bold text-lg">⚜️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
