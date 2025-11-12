const loading = () => {
  return (
    <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
      <svg
        className="worm"
        x="0px"
        y="0px"
        viewBox="0 0 316 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wormGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580b" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>

        <path
          d="M6.5,6.5c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9
c30,0,30,26.9,60,26.9"
          fill="none"
          stroke="url(#wormGradient)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeMiterlimit="10"
        />
      </svg>
    </div>
  );
};

export default loading;
