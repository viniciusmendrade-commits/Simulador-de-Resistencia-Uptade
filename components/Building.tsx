

import React, { useState, useEffect, useRef } from 'react';
import type { BuildingState, ComponentHealth, DisasterId } from '../types';
import { BuildingComponentId, MaterialTypeId } from '../types';
import { COMPONENT_CONFIG, NUMBER_OF_FLOORS } from '../constants';
import { LightningIcon } from './Icons';
import { playDamage } from './sounds';

interface BuildingPartProps {
  id: string;
  health: number;
  className: string;
  colorClass: string;
  isAnimating: boolean;
  style?: React.CSSProperties;
}

const BuildingPart: React.FC<BuildingPartProps> = ({ id, health, className, colorClass, isAnimating, style }) => {
  const isDestroyed = health <= 20;
  const animationClass = isAnimating ? 'animate-[damage-shake_0.5s_ease-in-out]' : '';

  return (
    <div
      id={id}
      className={`${className} ${animationClass} transition-all duration-500 relative overflow-hidden`}
    >
        <div className={`absolute inset-0 ${isDestroyed ? 'bg-slate-800' : colorClass}`} style={{
             boxShadow: health < 100 ? `inset 0 0 15px 5px rgba(0,0,0,0.4)` : 'none',
             border: health < 70 ? '1px solid rgba(0,0,0,0.2)' : 'none',
             ...style
        }}/>
        {health < 50 && !isDestroyed && <div className="absolute inset-0 bg-black/50" />}
    </div>
  );
};

interface BuildingProps {
  buildingState: BuildingState;
  componentHealth: ComponentHealth;
  isSimulating: boolean;
  activeDisaster: DisasterId | null;
}

const DisasterAnimation: React.FC<{disasterId: DisasterId | null}> = ({ disasterId }) => {
    if (!disasterId) return null;

    switch (disasterId) {
        case 'tsunami':
            return (
                <div className="absolute bottom-0 left-0 w-full h-full z-20 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-900 via-blue-600 to-cyan-400 animate-[tsunami-rise_2s_ease-out_forwards]">
                        <div className="absolute -top-4 w-full h-8 bg-white/80 blur-md animate-[tsunami-foam_0.5s_ease-in-out_infinite_alternate]" />
                    </div>
                </div>
            );
        case 'hurricane':
            return (
                <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none bg-slate-900/60 animate-[hurricane-bg-pulse_2.5s_ease-in-out_infinite]">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-[hurricane-wind_0.8s_linear_infinite]"
                            style={{ 
                                width: `${40 + Math.random() * 40}%`,
                                top: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 0.8}s`,
                                animationDuration: `${0.3 + Math.random() * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            );
        case 'earthquake':
            return (
                <div className="absolute bottom-0 left-0 w-full h-24 z-20 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 rounded-[50%] border-2 border-stone-500 animate-[earthquake-shockwave_1.5s_ease-out_forwards_1s]" />
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bottom-0 rounded-sm bg-stone-600 animate-[earthquake-debris_2s_ease-out_forwards]"
                            style={{
                                width: `${Math.random() * 8 + 3}px`,
                                height: `${Math.random() * 8 + 3}px`,
                                left: `${5 + Math.random() * 90}%`,
                                animationDelay: `${0.8 + Math.random()}s`,
                            }}
                        />
                    ))}
                </div>
            );
        case 'lightningStorm':
            return (
                <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 animate-[lightning-strike_2s_ease-in-out]"/>
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-24 h-full animate-[lightning-bolt_2s_ease-in-out]">
                         <LightningIcon className="text-white text-[10rem] drop-shadow-[0_0_10px_white]"/>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

// --- New Defense Components ---

const TunedMassDamper: React.FC<{ partProps: BuildingPartProps }> = ({ partProps }) => {
    const { isAnimating } = partProps;
    const animationClass = isAnimating ? 'animate-[damage-shake_0.5s_ease-in-out]' : '';

    return (
        <div className={`absolute top-[-25%] left-1/2 -translate-x-1/2 w-[8%] pt-[8%] z-20 ${animationClass}`}>
            <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600" 
                style={{ 
                    boxShadow: 'inset 1px -1px 3px rgba(0,0,0,0.5), inset -1px 1px 3px rgba(255,255,255,0.5)' 
                }}
            />
        </div>
    );
};

const SeawallBarrier: React.FC<{ partProps: BuildingPartProps }> = ({ partProps }) => (
    <>
        {/* Left Barrier */}
        <div className="absolute bottom-0 left-[12%] w-[10%] h-[6%] z-10">
             <BuildingPart {...partProps} className="w-full h-full" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
        </div>
         {/* Right Barrier */}
        <div className="absolute bottom-0 right-[12%] w-[10%] h-[6%] z-10">
             <BuildingPart {...partProps} className="w-full h-full" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
        </div>
    </>
);

const HydraulicSprings: React.FC = () => {
    const Spring = () => (
        <div className="w-1/5 h-full flex flex-col items-center justify-between">
            <div className="w-full h-[15%] bg-zinc-600 rounded-t-sm border-x border-t border-black/50" />
            <div className="w-[70%] h-[70%] border-2 border-zinc-500 border-t-0 border-b-0 flex flex-col justify-around py-0.5">
                <div className="w-full h-[2px] bg-zinc-400" />
                <div className="w-full h-[2px] bg-zinc-400" />
                <div className="w-full h-[2px] bg-zinc-400" />
            </div>
            <div className="w-full h-[15%] bg-zinc-600 rounded-b-sm border-x border-b border-black/50" />
        </div>
    );
    return (
        <div className="absolute bottom-[0.5%] w-[90%] h-[4%] left-1/2 -translate-x-1/2 z-20 flex justify-around">
            {Array.from({ length: 6 }).map((_, i) => <Spring key={i} />)}
        </div>
    );
};

const Cloud: React.FC<{ className: string; style: React.CSSProperties }> = ({ className, style }) => (
  <div className={`absolute ${className}`} style={style}>
    <div className="relative w-full h-full opacity-80" style={{ filter: 'blur(8px)' }}>
      <div className="absolute bg-white rounded-full w-[60%] h-[60%] bottom-0 left-[20%]" />
      <div className="absolute bg-white rounded-full w-[55%] h-[55%] bottom-[5%] left-0" />
      <div className="absolute bg-white rounded-full w-[50%] h-[50%] bottom-[2%] right-0" />
    </div>
  </div>
);

// --- Main Building Component ---

const Building: React.FC<BuildingProps> = ({ buildingState, componentHealth, isSimulating, activeDisaster }) => {
  const [animatingParts, setAnimatingParts] = useState<Record<string, boolean>>({});
  
  const prevHealthRef = useRef<ComponentHealth>(componentHealth);

  useEffect(() => {
    const newAnimatingParts: Record<string, boolean> = {};
    let animationTriggered = false;

    for (const key in componentHealth) {
      const componentId = key as BuildingComponentId;
      componentHealth[componentId].forEach((health, index) => {
        if (health < prevHealthRef.current[componentId][index]) {
          newAnimatingParts[`${componentId}-${index}`] = true;
          animationTriggered = true;
        }
      });
    }

    if (animationTriggered) {
      playDamage();
      setAnimatingParts(prev => ({ ...prev, ...newAnimatingParts }));
      const timer = setTimeout(() => {
        setAnimatingParts({});
      }, 400);
      return () => clearTimeout(timer);
    }
    
    prevHealthRef.current = componentHealth;

  }, [componentHealth]);
  
  const windDamperMaterial = buildingState[BuildingComponentId.WindDampers][0];
  const tsunamiBarrierMaterial = buildingState[BuildingComponentId.TsunamiBarriers][0];
  const seismicDamperMaterial = buildingState[BuildingComponentId.SeismicDampers][0];
  const spdaMaterial = buildingState[BuildingComponentId.LightningRod][0];

  const getPartProps = (id: BuildingComponentId, levelIndex: number): BuildingPartProps => {
    let colorClass = COMPONENT_CONFIG[id].materials[buildingState[id][levelIndex]].color;
    let style = {};

    if (id === BuildingComponentId.Glass) {
        if (windDamperMaterial === MaterialTypeId.Medium) { // Vidros Laminados
            colorClass = COMPONENT_CONFIG[BuildingComponentId.WindDampers].materials[MaterialTypeId.Medium].color;
        } else if (tsunamiBarrierMaterial === MaterialTypeId.Strong) { // Barreiras Anti-Inundação
            colorClass = '';
            style = {
                backgroundImage: `linear-gradient(rgba(107, 114, 128, 0.7) 2px, transparent 2px)`, // gray-500/70
                backgroundSize: '100% 10px',
                backgroundColor: '#374151' // gray-700
            };
        }
    }

    return {
        id: `${id}-${levelIndex}`,
        health: componentHealth[id][levelIndex],
        colorClass,
        style,
        isAnimating: animatingParts[`${id}-${levelIndex}`] || false,
        className: '', // será adicionado no JSX
    };
  };

  const buildingShakeClass = isSimulating && activeDisaster === 'earthquake' ? 'animate-[shake_0.4s_4_1s]' : '';
  const buildingSwayClass = isSimulating && activeDisaster === 'hurricane' ? 'animate-[sway_2.5s_ease-in-out_infinite_alternate_0.5s]' : '';
  
  const windowStyle = {
    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
    backgroundSize: '8px 8px',
  };

  const buildingStyle1 = { backgroundColor: '#111827', ...windowStyle };
  const buildingStyle2 = { backgroundColor: '#030712', ...windowStyle };

  return (
    <div id="tutorial-building-area" className="w-full aspect-square max-w-[400px] md:max-w-[600px] relative flex items-end justify-center rounded-xl overflow-hidden">
        {/* Background Scene */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-500" />
            <div className="absolute top-[8%] left-[8%] w-20 h-20 bg-yellow-200 rounded-full blur-md animate-[sun-glow_8s_ease-in-out_infinite]" />
            <div className="absolute inset-0" style={{
                maskImage: 'linear-gradient(to right, black 20%, transparent 21%, transparent 79%, black 80%)',
                WebkitMaskImage: 'linear-gradient(to right, black 20%, transparent 21%, transparent 79%, black 80%)',
            }}>
                <Cloud 
                    className="w-48 h-24 top-[20%] animate-[move-clouds_55s_linear_infinite]" 
                    style={{ animationDelay: '-25s' }}
                />
                <Cloud 
                    className="w-40 h-20 top-[15%] animate-[move-clouds_45s_linear_infinite]" 
                    style={{}}
                />
                <Cloud 
                    className="w-32 h-16 top-[25%] animate-[move-clouds_30s_linear_infinite]" 
                    style={{ animationDelay: '-10s' }} 
                />
            </div>
            <div className="absolute bottom-0 left-0 w-1/4 h-2/3">
                 <div className="absolute bottom-0 left-[0%] w-[25%] h-[40%]" style={buildingStyle1} />
                 <div className="absolute bottom-0 left-[15%] w-[30%] h-[53%]" style={buildingStyle2} />
                 <div className="absolute bottom-0 left-[40%] w-[20%] h-[37%]" style={buildingStyle1} />
                 <div className="absolute bottom-0 left-[55%] w-[35%] h-[47%]" style={buildingStyle2} />
                 <div className="absolute bottom-0 left-[75%] w-[25%] h-[63%]" style={buildingStyle1} />
            </div>
            <div className="absolute bottom-0 right-0 w-1/4 h-2/3">
                <div className="absolute bottom-0 right-[0%] w-[25%] h-[43%]" style={buildingStyle1} />
                <div className="absolute bottom-0 right-[15%] w-[30%] h-[57%]" style={buildingStyle2} />
                <div className="absolute bottom-0 right-[40%] w-[20%] h-[33%]" style={buildingStyle1} />
                <div className="absolute bottom-0 right-[55%] w-[35%] h-[50%]" style={buildingStyle2} />
                <div className="absolute bottom-0 right-[75%] w-[25%] h-[67%]" style={buildingStyle1} />
            </div>
        </div>
      
        {isSimulating && <DisasterAnimation disasterId={activeDisaster} />}
        
        {/* Defense Systems Visuals */}
        {tsunamiBarrierMaterial === MaterialTypeId.Medium && (
            <SeawallBarrier partProps={getPartProps(BuildingComponentId.TsunamiBarriers, 0)} />
        )}

        <div className={`relative w-[60%] h-[90%] ${buildingShakeClass} ${buildingSwayClass} z-10 flex flex-col`}>
        
        {/* SPDA System */}
        {spdaMaterial !== MaterialTypeId.Weak && (
          <div className="absolute top-[-8%] left-0 w-full h-[108%] z-20 pointer-events-none">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[10%] ${spdaMaterial === MaterialTypeId.Strong ? 'w-[5px]' : 'w-[4px]'}`}>
              <BuildingPart {...getPartProps(BuildingComponentId.LightningRod, 0)} className="w-full h-full" />
            </div>
            
            {spdaMaterial === MaterialTypeId.Strong && (
              <>
                <div className="absolute top-[8%] left-[8%] w-[3px] h-[95%] bg-slate-300/70 rounded" />
                <div className="absolute top-[8%] right-[8%] w-[3px] h-[95%] bg-slate-300/70 rounded" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="absolute left-[8%] w-[84%] h-[3px] bg-slate-300/70 rounded" style={{ top: `${15 + i * 20}%`}} />
                ))}
              </>
            )}
          </div>
        )}
        
        {seismicDamperMaterial === MaterialTypeId.Strong && ( // Isoladores Sísmicos
          <div className="absolute bottom-[0%] w-full h-[2.5%] left-1/2 -translate-x-1/2 z-20">
              <BuildingPart 
                  {...getPartProps(BuildingComponentId.SeismicDampers, 0)} 
                  className="w-full h-full border-2 border-black" 
              />
          </div>
        )}
        
        {seismicDamperMaterial === MaterialTypeId.Medium && ( // Amortecedores Hidráulicos (Molas)
             <HydraulicSprings />
        )}

        <div className="relative w-full flex-grow flex flex-col">
            <div className="h-[8%] w-full flex flex-col relative">
                {windDamperMaterial === MaterialTypeId.Strong && (
                  <TunedMassDamper partProps={getPartProps(BuildingComponentId.WindDampers, 0)} />
                )}
                <div className="flex-grow w-full flex items-end justify-center z-10">
                    <div className="w-[90%] h-[80%]">
                        <BuildingPart {...getPartProps(BuildingComponentId.Roof, 0)} className="h-full w-full" />
                    </div>
                </div>
                <BuildingPart {...getPartProps(BuildingComponentId.Beams, NUMBER_OF_FLOORS -1)} className="h-[25%] w-[95%] mx-auto z-10" />
            </div>
            
            {Array.from({ length: NUMBER_OF_FLOORS }).map((_, index) => {
                const reversedIndex = NUMBER_OF_FLOORS - 1 - index;
                return (
                <div key={reversedIndex} className="flex-grow flex flex-col relative">
                    <div className="flex-grow flex items-center">
                        <div className="w-[10%] h-[95%] relative">
                            <BuildingPart {...getPartProps(BuildingComponentId.Walls, reversedIndex)} className="w-full h-full" />
                        </div>
                        
                        <div className="flex-grow h-full flex items-center justify-around p-1 relative">
                            {Array.from({ length: 4 }).flatMap((_, colIndex) => {
                                const {style, ...restOfProps} = getPartProps(BuildingComponentId.Glass, reversedIndex);
                                const windowElement = (
                                    <div key={`win-${reversedIndex}-${colIndex}`} className="flex-grow h-full flex flex-col bg-slate-800/10 w-full z-10">
                                        <BuildingPart {...getPartProps(BuildingComponentId.Beams, reversedIndex)} className="h-[8%]" />
                                        
                                        {reversedIndex === 0 && (colIndex === 1 || colIndex === 2) ? (
                                            <div className="flex-grow my-1 bg-slate-800/80 flex items-end justify-center border-2 border-black/20 relative">
                                                <BuildingPart {...getPartProps(BuildingComponentId.Walls, reversedIndex)} className="absolute inset-0" />
                                                <div className="absolute -top-1 w-[110%] h-[20%] bg-slate-700" />
                                                <div className="w-2/3 h-4/5 bg-black/50 rounded-t-sm"></div>
                                            </div>
                                        ) : (
                                            <BuildingPart {...restOfProps} style={style} className="flex-grow my-1" />
                                        )}

                                        <BuildingPart {...getPartProps(BuildingComponentId.Beams, reversedIndex)} className="h-[8%]" />
                                    </div>
                                );

                                if (colIndex < 3) {
                                    const pillarElement = (
                                        <div key={`pil-${reversedIndex}-${colIndex}`} className="w-[5%] h-[95%] z-10">
                                             <BuildingPart {...getPartProps(BuildingComponentId.Pillars, reversedIndex)} className="h-full w-full" />
                                        </div>
                                    );
                                    return [windowElement, pillarElement];
                                }
                                return [windowElement];
                            })}
                        </div>

                        <div className="w-[10%] h-[95%] relative">
                            <BuildingPart {...getPartProps(BuildingComponentId.Walls, reversedIndex)} className="w-full h-full" />
                        </div>
                    </div>
                    {reversedIndex > 0 && (
                         <>
                            <BuildingPart {...getPartProps(BuildingComponentId.Floor, reversedIndex)} className="h-[2%] w-full" />
                            <BuildingPart {...getPartProps(BuildingComponentId.Beams, reversedIndex -1)} className="h-[3%] w-[95%] mx-auto" />
                         </>
                    )}
                </div>
            )})}
            
            <BuildingPart {...getPartProps(BuildingComponentId.Floor, 0)} className="h-[5%] w-full" />
        </div>
      </div>
       <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            @keyframes damage-shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
                40%, 60% { transform: translate3d(2px, 0, 0); }
            }
            @keyframes tsunami-rise {
                0% { height: 0%; opacity: 0.8; }
                70% { height: 40%; opacity: 1; }
                100% { height: 35%; opacity: 0; }
            }
            @keyframes tsunami-foam {
                from { transform: translateY(-2px) scaleX(1); }
                to { transform: translateY(2px) scaleX(1.05); }
            }
            @keyframes hurricane-bg-pulse {
                50% { background-color: rgba(30, 41, 59, 0.75); } /* slate-800/75 */
            }
            @keyframes hurricane-wind {
                from { transform: translateX(-150%); }
                to { transform: translateX(250%); }
            }
            @keyframes sway {
                from { transform: translateX(-2%) rotate(-0.5deg); }
                to { transform: translateX(2%) rotate(0.5deg); }
            }
            @keyframes earthquake-shockwave {
                0% { transform: scale(1); opacity: 0.9; }
                100% { transform: scale(60); opacity: 0; }
            }
            @keyframes earthquake-debris {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-150px) rotate(720deg); opacity: 0; }
            }
            @keyframes lightning-strike {
                0%, 100% { opacity: 0; }
                40%, 45%, 50% { opacity: 1; background: white; box-shadow: 0 0 50px 30px white; }
                42%, 47% { opacity: 0; background: transparent; box-shadow: none; }
            }
            @keyframes lightning-bolt {
                0% { opacity: 0; transform: translateY(-100%) scaleY(1); }
                40% { opacity: 0; }
                45% { opacity: 1; transform: translateY(10%) scaleY(1); }
                50% { opacity: 0; transform: translateY(30%) scaleY(0); }
                100% { opacity: 0; }
            }
            @keyframes move-clouds {
                from { transform: translateX(-150%); }
                to { transform: translateX(250%); }
            }
            @keyframes sun-glow {
                0%, 100% { 
                    box-shadow: 0 0 70px 35px rgba(254,249,195,0.5); 
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 85px 45px rgba(254,249,195,0.6); 
                    transform: scale(1.02);
                }
            }
        `}</style>
    </div>
  );
};

export default Building;