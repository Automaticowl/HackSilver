export default function HackSilverLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Silver shield background */}
        <path
          d="M24 4L42 12V22C42 32 36 40 24 44C12 40 6 32 6 22V12L24 4Z"
          fill="url(#silverGradient)"
          stroke="#4B5563"
          strokeWidth="1.5"
        />

        {/* Terminal/code brackets */}
        <path
          d="M16 18L12 24L16 30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 18L36 24L32 30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dollar sign */}
        <path
          d="M24 16V32M21 19H26C27.1046 19 28 19.8954 28 21C28 22.1046 27.1046 23 26 23H22C20.8954 23 20 23.8954 20 25C20 26.1046 20.8954 27 22 27H27"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient id="silverGradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5E7EB" />
            <stop offset="0.5" stopColor="#9CA3AF" />
            <stop offset="1" stopColor="#6B7280" />
          </linearGradient>
        </defs>
      </svg>

      <div>
        <h1 className="text-3xl font-bold text-white">HackSilver</h1>
        <p className="text-sm text-gray-400">Portfolio Tracker</p>
      </div>
    </div>
  );
}
