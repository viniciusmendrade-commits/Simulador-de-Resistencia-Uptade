import React from 'react';

interface OptionsScreenProps {
  sfxVolume: number;
  musicVolume: number;
  onSfxVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onBack: () => void;
}

const OptionsScreen: React.FC<OptionsScreenProps> = ({
  sfxVolume,
  musicVolume,
  onSfxVolumeChange,
  onMusicVolumeChange,
  onBack,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-4"
      style={{
        backgroundImage: "radial-gradient(ellipse at top, #1e293b 0%, #020617 70%)"
      }}
    >
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8 text-white animate-[fade-in_0.5s_ease-out]">
        <h1 className="text-4xl font-bold font-orbitron text-amber-400 tracking-wider text-center mb-8">
          Opções
        </h1>
        
        <div className="space-y-6">
          {/* SFX Volume */}
          <div>
            <label htmlFor="sfx-volume" className="block mb-2 text-lg font-semibold text-slate-300">
              Volume dos Efeitos
            </label>
            <div className="flex items-center gap-4">
              <input
                id="sfx-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-orbitron w-16 text-center">{Math.round(sfxVolume * 100)}%</span>
            </div>
          </div>

          {/* Music Volume */}
          <div>
            <label htmlFor="music-volume" className="block mb-2 text-lg font-semibold text-slate-300">
              Volume da Música
            </label>
            <div className="flex items-center gap-4">
              <input
                id="music-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-orbitron w-16 text-center">{Math.round(musicVolume * 100)}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-10 w-full p-3 text-lg font-semibold text-slate-900 bg-amber-500 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Voltar
        </button>
      </div>
      <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
          }
      `}</style>
    </div>
  );
};

export default OptionsScreen;
