let audioContext: AudioContext | null = null;

let sfxVolume = 1.0;
let musicVolume = 0.5;
let isGloballyMuted = false;
let lastSfxVolume = 1.0;
let lastMusicVolume = 0.5;

let musicNodes: AudioNode[] = [];
let musicInterval: number | null = null;
let currentStep = 0;

// Lo-fi 8-bit melody and bassline in C minor
const musicSequence: { freq: number | null, dur: number }[] = [
    // note, duration (in steps)
    { freq: 130.81, dur: 1 }, { freq: null, dur: 1 }, { freq: 155.56, dur: 1 }, { freq: 174.61, dur: 2 }, { freq: 155.56, dur: 1 }, { freq: 130.81, dur: 2 },
    { freq: 196.00, dur: 1 }, { freq: null, dur: 1 }, { freq: 174.61, dur: 1 }, { freq: 155.56, dur: 2 }, { freq: 130.81, dur: 1 }, { freq: null, dur: 2 },
    { freq: 207.65, dur: 1 }, { freq: null, dur: 1 }, { freq: 233.08, dur: 1 }, { freq: 207.65, dur: 2 }, { freq: 174.61, dur: 1 }, { freq: 155.56, dur: 2 },
    { freq: 155.56, dur: 3 }, { freq: 174.61, dur: 1 }, { freq: 130.81, dur: 4 },
];


const initAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

export const setSfxVolume = (volume: number) => {
    sfxVolume = Math.max(0, Math.min(1, volume));
    if (!isGloballyMuted) {
        lastSfxVolume = sfxVolume;
    }
}
export const getSfxVolume = () => sfxVolume;

export const setMusicVolume = (volume: number) => {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (!isGloballyMuted) {
        lastMusicVolume = musicVolume;
    }
    // Volume is read when notes are created, so no immediate adjustment needed here.
}
export const getMusicVolume = () => musicVolume;

export const toggleMute = (): boolean => {
  initAudioContext();
  isGloballyMuted = !isGloballyMuted;
  if (isGloballyMuted) {
      // Muting: store current volumes, set them to 0, and stop the music
      lastSfxVolume = sfxVolume;
      lastMusicVolume = musicVolume;
      stopMusic();
      setSfxVolume(0);
      setMusicVolume(0); 
  } else {
      // Unmuting: restore last known volumes and restart the music
      setSfxVolume(lastSfxVolume);
      setMusicVolume(lastMusicVolume);
      playMusic();
  }
  return isGloballyMuted;
};

export const getIsMuted = (): boolean => {
  return isGloballyMuted;
};

const play = (params: {
  type: OscillatorType;
  frequency?: number;
  volume?: number;
  duration: number;
  attack?: number;
  frequencyEnd?: number;
}) => {
  initAudioContext();
  if (!audioContext) return;
  
  const { 
    type, 
    frequency = 440, 
    volume, 
    duration, 
    attack = 0.01, 
    frequencyEnd = frequency
  } = params;

  const baseVolume = volume === undefined ? 0.3 : volume;
  const finalVolume = baseVolume * sfxVolume;
  if(finalVolume <= 0) return;

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  const oscillator = audioContext.createOscillator();
  oscillator.type = type;
  oscillator.connect(gainNode);

  const now = audioContext.currentTime;
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(finalVolume, now + attack);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  
  oscillator.frequency.setValueAtTime(frequency, now);
  if (frequency !== frequencyEnd) {
      oscillator.frequency.linearRampToValueAtTime(frequencyEnd, now + duration * 0.8);
  }

  oscillator.start(now);
  oscillator.stop(now + duration);
};

const playNoise = (params: {
  volume?: number;
  duration: number;
  attack?: number;
  filterFrequency?: number;
  filterQ?: number;
}) => {
    initAudioContext();
    if (!audioContext) return;

    const { volume, duration, attack = 0.01, filterFrequency = 800, filterQ = 1 } = params;
    
    const baseVolume = volume === undefined ? 0.2 : volume;
    const finalVolume = baseVolume * sfxVolume;
    if(finalVolume <= 0) return;

    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency;
    filter.Q.value = filterQ;

    const gainNode = audioContext.createGain();
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(finalVolume, now + attack);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    noise.start(now);
    noise.stop(now + duration);
}

// New music functions
export const playMusic = () => {
    initAudioContext();
    if (!audioContext || musicInterval || isGloballyMuted) return;

    const tempo = 100; // BPM
    const stepDuration = (60 / tempo) / 2; // Duration of a 16th note step

    const scheduleNextNote = () => {
        const noteInfo = musicSequence[currentStep % musicSequence.length];
        
        if (noteInfo.freq && !isGloballyMuted) {
            const osc = audioContext!.createOscillator();
            // Use triangle for bass notes, square for melody for a classic 8-bit feel
            osc.type = noteInfo.freq < 180 ? 'triangle' : 'square';
            osc.frequency.setValueAtTime(noteInfo.freq, audioContext!.currentTime);

            const gainNode = audioContext!.createGain();
            const peakGain = musicVolume * 0.15; // Adjusted for new sounds
            gainNode.gain.setValueAtTime(0, audioContext!.currentTime);
            gainNode.gain.linearRampToValueAtTime(peakGain, audioContext!.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext!.currentTime + (stepDuration * noteInfo.dur) - 0.02);

            const filter = audioContext!.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1500; // Gives a warmer, lo-fi sound

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext!.destination);

            osc.start(audioContext!.currentTime);
            osc.stop(audioContext!.currentTime + stepDuration * noteInfo.dur);
            musicNodes.push(osc, gainNode, filter);
        }

        const timeoutDuration = stepDuration * noteInfo.dur * 1000;
        currentStep++;
        musicInterval = window.setTimeout(scheduleNextNote, timeoutDuration);
    };
    
    scheduleNextNote();
}

export const stopMusic = () => {
    if (musicInterval) {
        clearTimeout(musicInterval);
        musicInterval = null;
    }
    musicNodes.forEach(node => {
        try {
            // Check if 'stop' method exists for oscillators
            if ('stop' in node && typeof node.stop === 'function') {
                (node as OscillatorNode).stop();
            }
            node.disconnect();
        } catch (e) {
            // Ignore errors on disconnect/stop
        }
    });
    musicNodes = [];
    currentStep = 0;
}

// Specific sounds
export const playClick = () => play({ type: 'triangle', frequency: 800, duration: 0.1, volume: 0.2 });
export const playMaterialChange = () => play({ type: 'sine', frequency: 600, frequencyEnd: 900, duration: 0.1, volume: 0.3 });
export const playReset = () => play({ type: 'sawtooth', frequency: 200, frequencyEnd: 1200, duration: 0.5, volume: 0.3 });
export const playDamage = () => playNoise({ duration: 0.2, volume: 0.4, filterFrequency: 200, filterQ: 2 });
export const playSimulationStart = () => {
    play({ type: 'sawtooth', frequency: 500, frequencyEnd: 700, duration: 0.3, volume: 0.4 });
    setTimeout(() => play({ type: 'sawtooth', frequency: 500, frequencyEnd: 700, duration: 0.3, volume: 0.4 }), 400);
};

// Disaster sounds
export const playEarthquakeSound = () => {
    if (!audioContext || sfxVolume <= 0) return;
    const interval = setInterval(() => playNoise({ duration: 0.3, volume: 0.5, filterFrequency: 100, filterQ: 1 }), 200);
    setTimeout(() => clearInterval(interval), 1800);
};
export const playTsunamiSound = () => playNoise({ duration: 2.0, volume: 0.6, filterFrequency: 400, filterQ: 1 });
export const playHurricaneSound = () => playNoise({ duration: 2.0, volume: 0.5, filterFrequency: 1000, filterQ: 2 });
export const playLightningSound = () => {
    setTimeout(() => playNoise({ duration: 0.2, volume: 0.7, filterFrequency: 4000, filterQ: 1 }), 880); // Corresponds to lightning-strike animation
};

// Result sounds
export const playResultSound = (health: number) => {
    if (health > 75) { // Good
        play({ type: 'sine', frequency: 523, duration: 0.15, volume: 0.4 });
        setTimeout(() => play({ type: 'sine', frequency: 659, duration: 0.15, volume: 0.4 }), 150);
        setTimeout(() => play({ type: 'sine', frequency: 783, duration: 0.2, volume: 0.4 }), 300);
    } else if (health > 35) { // Medium / Bad
        play({ type: 'square', frequency: 440, frequencyEnd: 340, duration: 0.6, volume: 0.3 });
    } else { // Collapse
        playNoise({ duration: 1.5, volume: 0.8, filterFrequency: 150, filterQ: 0.5 });
        play({ type: 'sawtooth', frequency: 200, frequencyEnd: 50, duration: 1.5, volume: 0.5 });
    }
};