import React from "react";

export const Loader = () => {
  return (
    <div className="loader">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`square sq${i + 1}`} />
      ))}
    </div>
  );
};
