import React from 'react';

interface SplashScreenProps {
  onStart: () => void;
  onShowOptions: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onShowOptions }) => {
  const buttonStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '24px',
    letterSpacing: '1.5px',
    backgroundImage: 'linear-gradient(to bottom, #dec909 0%, #980abf 100%)',
    textShadow: '3px 2px 0 #f22405',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };
  
  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-4 animate-[fade-in_1s_ease-in-out]"
      style={{
        backgroundImage: `url('https://i.postimg.cc/7hNyv6Kp/Whats-App-Image-2025-11-07-at-15-04-21.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        filter: 'saturate(1.15)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
      
      <div className="relative z-10 text-center flex flex-col items-center gap-8">
        <button
          onClick={onStart}
          className="transition-all duration-300 hover:scale-110"
          style={buttonStyle}
        >
          Iniciar Jogo
        </button>

        <button
          onClick={onShowOptions}
          className="transition-all duration-300 hover:scale-110"
          style={buttonStyle}
        >
          Opções
        </button>

        <button
          onClick={() => alert('Página de créditos em construção!')}
          className="transition-all duration-300 hover:scale-110"
          style={buttonStyle}
        >
          Créditos
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;