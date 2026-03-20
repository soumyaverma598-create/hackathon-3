'use client';

export default function VideoBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 1,
        }}
      >
        <source src="/Video_Enhancement_for_Website_Homepage.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text contrast */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.45))',
        }}
      />

      {/* Additional radial overlay for depth and side emphasis */}
      <div
        className="absolute inset-0 z-[1] opacity-40"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
        }}
      />
    </div>
  );
}

