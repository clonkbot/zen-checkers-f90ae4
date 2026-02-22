import { GameState } from '../types'

interface GameUIProps {
  gameState: GameState
  onReset: () => void
}

export default function GameUI({ gameState, onReset }: GameUIProps) {
  const redRemaining = gameState.pieces.filter(p => p.color === 'red').length
  const blackRemaining = gameState.pieces.filter(p => p.color === 'black').length

  const winner =
    redRemaining === 0 ? 'black' :
    blackRemaining === 0 ? 'red' : null

  return (
    <>
      {/* Title */}
      <div className="absolute top-4 md:top-6 left-0 right-0 text-center pointer-events-none">
        <h1
          className="text-2xl md:text-4xl tracking-[0.3em] md:tracking-[0.5em] text-[#3D2B1F] font-light uppercase"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Checkers
        </h1>
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-[#C9A227] to-transparent mx-auto mt-2" />
      </div>

      {/* Turn indicator & scores */}
      <div className="absolute top-20 md:top-28 left-4 md:left-8 pointer-events-none">
        <div
          className="bg-[#F5F1EB]/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg border border-[#C9A227]/20"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <div className="text-[10px] md:text-xs tracking-[0.2em] text-[#8B7355] uppercase mb-2 md:mb-3">
            Current Turn
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={`w-4 h-4 md:w-6 md:h-6 rounded-full shadow-md transition-all duration-300 ${
                gameState.currentTurn === 'red'
                  ? 'bg-[#B85C38] scale-110'
                  : 'bg-[#2D2D2D] scale-110'
              }`}
            />
            <span className="text-base md:text-xl text-[#3D2B1F] capitalize tracking-wide">
              {gameState.currentTurn}
            </span>
          </div>
        </div>
      </div>

      {/* Piece counts */}
      <div className="absolute top-20 md:top-28 right-4 md:right-8 pointer-events-none">
        <div
          className="bg-[#F5F1EB]/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg border border-[#C9A227]/20"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <div className="text-[10px] md:text-xs tracking-[0.2em] text-[#8B7355] uppercase mb-2 md:mb-3">
            Pieces Remaining
          </div>
          <div className="flex gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#B85C38] shadow" />
              <span className="text-lg md:text-2xl text-[#3D2B1F] font-light">{redRemaining}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#2D2D2D] shadow" />
              <span className="text-lg md:text-2xl text-[#3D2B1F] font-light">{blackRemaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="absolute bottom-12 md:bottom-16 left-0 right-0 flex justify-center">
        <button
          onClick={onReset}
          className="px-5 py-2.5 md:px-6 md:py-3 bg-[#3D2B1F] text-[#F5F1EB] rounded-lg
            tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-sm uppercase
            hover:bg-[#5C4033] transition-all duration-300
            shadow-lg hover:shadow-xl active:scale-95
            border border-[#C9A227]/30"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          New Game
        </button>
      </div>

      {/* Winner modal */}
      {winner && (
        <div className="absolute inset-0 bg-[#3D2B1F]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-[#F5F1EB] rounded-xl p-6 md:p-10 shadow-2xl text-center mx-4
              border-2 border-[#C9A227]/40 animate-[fadeIn_0.5s_ease-out]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <div className="text-[10px] md:text-xs tracking-[0.3em] text-[#8B7355] uppercase mb-3 md:mb-4">
              Game Over
            </div>
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div
                className={`w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg ${
                  winner === 'red' ? 'bg-[#B85C38]' : 'bg-[#2D2D2D]'
                }`}
              />
              <h2 className="text-2xl md:text-4xl text-[#3D2B1F] capitalize tracking-wide">
                {winner} Wins!
              </h2>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-2.5 md:px-8 md:py-3 bg-[#C9A227] text-[#3D2B1F] rounded-lg
                tracking-[0.2em] text-xs md:text-sm uppercase font-medium
                hover:bg-[#DAB82F] transition-all duration-300
                shadow-lg hover:shadow-xl active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions - hidden on mobile */}
      <div
        className="hidden md:block absolute bottom-16 left-8 text-[10px] tracking-[0.15em] text-[#8B7355]/60 uppercase pointer-events-none"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Click to select · Click valid square to move · Drag to rotate view
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
