
import React from 'react';

const GamePiece = ({ color, isWinningPiece, isPreview }: { color: string; isWinningPiece?: boolean; isPreview?: boolean }) => {
  return <div className={`w-[10vw] h-[10vw] max-w-[70px] max-h-[70px] rounded-full ${color} ${isPreview ? 'opacity-50' : 'animate-fall'} ${isWinningPiece ? 'animate-radiate' : ''}`} />;
};

export default GamePiece;
