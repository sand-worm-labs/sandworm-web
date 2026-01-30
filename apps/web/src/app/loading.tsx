const loading = () => {
  return (
    <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
      <div className="loader">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`square sq${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default loading;
