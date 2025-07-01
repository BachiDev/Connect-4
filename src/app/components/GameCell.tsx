
import React from 'react';

const GameCell = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-[12vw] h-[12vw] max-w-[80px] max-h-[80px] bg-white rounded-full flex items-center justify-center">{children}</div>;
};

export default GameCell;
