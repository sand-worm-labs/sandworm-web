const loading = () => {
  return (
    <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
      <svg
        className="worm"
        x="0px"
        y="0px"
        viewBox="0 0 316 40"
        enableBackground="new 0 0 316 40"
        xmlSpace="preserve"
      >
        <path
          d="M6.5,6.5c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9
c30,0,30,26.9,60,26.9"
        />
      </svg>

      {/* some browsers be tweaking so fallback to text */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-mono animate-pulse">
        Loading Sandworm...
      </p>
    </div>
  );
};

export default loading;
