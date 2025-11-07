
import React, { useState, useMemo, useEffect } from 'react';
import type { BuildingState, ComponentHealth, BuildingComponentId, MaterialTypeId, DisasterId, SimulationPhase } from '../types';
import { COMPONENT_CONFIG, DISASTER_CONFIG, NUMBER_OF_FLOORS } from '../constants';
import { BuildingComponentId as BCI } from '../types';
import { playClick } from './sounds';

interface ControlPanelProps {
  buildingState: BuildingState;
  componentHealth: ComponentHealth;
  onMaterialChange: (component: BuildingComponentId, material: MaterialTypeId, levelIndex: number) => void;
  onStartSimulation: (disaster: DisasterId) => void;
  onNextWave: () => void;
  onRepairComponent: (componentId: BuildingComponentId, levelIndex: number) => void;
  onReset: () => void;
  simulationState: {
    phase: SimulationPhase;
    activeDisaster: DisasterId | null;
    resultMessage: string | null;
  };
  selectedLevel: number | 'roof';
  onSelectLevel: (level: number | 'roof') => void;
}

const MaterialSelector: React.FC<{
  componentId: BuildingComponentId;
  currentMaterial: MaterialTypeId;
  onChange: (material: MaterialTypeId) => void;
  disabled: boolean;
}> = ({ componentId, currentMaterial, onChange, disabled }) => {
  const config = COMPONENT_CONFIG[componentId];
  return (
    <div className={`mb-4 transition-opacity duration-300 ${disabled && currentMaterial === 'weak' ? 'opacity-50' : 'opacity-100'}`}>
      <h3 className="text-lg font-semibold text-amber-300 mb-2">{config.label}</h3>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(config.materials) as MaterialTypeId[]).map((materialId) => {
          const material = config.materials[materialId];
          const isSelected = currentMaterial === materialId;
          return (
            <button
              key={materialId}
              onClick={() => onChange(materialId)}
              disabled={disabled}
              className={`group p-2 text-center rounded-md transition-all duration-200 flex flex-col justify-center items-center h-20
                ${isSelected ? 'bg-amber-500 text-slate-900 font-bold shadow-md shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-sm font-semibold leading-tight">{material.name}</span>
              <span className={`text-xs font-mono mt-1 transition-opacity duration-200 ${isSelected ? 'opacity-90' : 'opacity-0 group-hover:opacity-90'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(material.cost)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

type Tab = 'build' | 'defense' | 'simulate';

interface DamagedItem {
    componentId: BuildingComponentId;
    levelIndex: number;
    health: number;
    repairCost: number;
    isRoof: boolean;
}

interface DamagedGroup {
    componentId: BuildingComponentId;
    label: string;
    items: DamagedItem[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  buildingState,
  componentHealth,
  onMaterialChange,
  onStartSimulation,
  onNextWave,
  onRepairComponent,
  onReset,
  simulationState,
  selectedLevel,
  onSelectLevel,
}) => {
  const isControlsDisabled = simulationState.phase !== 'idle';
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const [currentDamageCategoryIndex, setCurrentDamageCategoryIndex] = useState(0);


  const disasterButtonColors: Record<DisasterId, string> = {
    lightningStorm: 'bg-purple-700 hover:bg-purple-600',
    hurricane: 'bg-slate-700 hover:bg-slate-600',
    tsunami: 'bg-blue-700 hover:bg-blue-600',
    earthquake: 'bg-orange-700 hover:bg-orange-600',
  };

  const floorComponents: BuildingComponentId[] = [BCI.Pillars, BCI.Beams, BCI.Walls, BCI.Glass, BCI.Floor];
  const roofComponents: BuildingComponentId[] = [BCI.Roof];
  const defenseComponents: BuildingComponentId[] = [BCI.LightningRod, BCI.WindDampers, BCI.TsunamiBarriers, BCI.SeismicDampers];
  
  const activeDefenseSystem = defenseComponents.find(id => buildingState[id][0] !== 'weak') || null;

  const levelIndex = selectedLevel === 'roof' ? 0 : selectedLevel;
  const componentsToShow = selectedLevel === 'roof' ? roofComponents : floorComponents;

  const tabs: {id: Tab, label: string}[] = [
      { id: 'build', label: 'Construção' },
      { id: 'defense', label: 'Defesas' },
      { id: 'simulate', label: 'Simulação' },
  ];
  
  const groupedDamagedComponents = useMemo((): DamagedGroup[] => {
    const groups: Record<string, DamagedGroup> = {};
    for (const key in componentHealth) {
        const componentId = key as BuildingComponentId;
        componentHealth[componentId].forEach((health, index) => {
            if (health < 100) {
                if (!groups[componentId]) {
                    groups[componentId] = {
                        componentId,
                        label: COMPONENT_CONFIG[componentId].label,
                        items: []
                    };
                }
                const materialId = buildingState[componentId][index];
                const material = COMPONENT_CONFIG[componentId].materials[materialId];
                const costPerPoint = material.cost / 200;
                const repairCost = (100 - health) * costPerPoint;
                
                groups[componentId].items.push({
                    componentId,
                    levelIndex: index,
                    health,
                    repairCost,
                    isRoof: buildingState[componentId].length === 1,
                });
            }
        });
    }
    // Sort items within each group by health
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => a.health - b.health);
    });
    return Object.values(groups);
  }, [componentHealth, buildingState]);
  
  useEffect(() => {
    if (simulationState.phase.startsWith('repair_')) {
        setCurrentDamageCategoryIndex(0);
    }
  }, [simulationState.phase]);


  // --- Dynamic Panels for Simulation Phases ---
  
  if (simulationState.phase.startsWith('wave_')) {
      const waveNumber = simulationState.phase.split('_')[1];
      const disasterName = simulationState.activeDisaster ? DISASTER_CONFIG[simulationState.activeDisaster].label : 'Desastre';
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold font-orbitron mb-4 text-amber-400">Simulação em Andamento</h2>
            <p className="text-xl text-yellow-300 animate-pulse">
                {disasterName} - Rodada {waveNumber} de 3...
            </p>
        </div>
      );
  }
  
  if (simulationState.phase === 'results') {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold font-orbitron mb-2 text-amber-400">Resultado Final da Simulação</h2>
            <p className="text-lg text-slate-200 mb-6">{simulationState.resultMessage}</p>
            <button
                onClick={onReset}
                className="w-full p-3 text-lg font-semibold text-slate-900 bg-amber-500 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                Construir Novamente
            </button>
        </div>
    );
  }

  if (simulationState.phase.startsWith('repair_')) {
    const waveNumber = parseInt(simulationState.phase.split('_')[1]);
    const currentCategory = groupedDamagedComponents[currentDamageCategoryIndex];

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold font-orbitron mb-2 text-white border-b border-slate-700 pb-2">
              Fase de Reparos
            </h2>
            <p className="text-md text-slate-300 mb-4">Após a rodada {waveNumber}, repare sua estrutura antes do próximo impacto.</p>
             
            {groupedDamagedComponents.length > 0 && currentCategory ? (
                 <>
                    <div className="flex items-center justify-between mb-3">
                        <button 
                            onClick={() => setCurrentDamageCategoryIndex(i => i - 1)}
                            disabled={currentDamageCategoryIndex === 0}
                            className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
                        >
                            &larr;
                        </button>
                        <h3 className="text-lg font-bold text-amber-300 text-center">
                            {currentCategory.label}
                            <span className="text-sm font-normal text-slate-400 ml-2">({currentDamageCategoryIndex + 1}/{groupedDamagedComponents.length})</span>
                        </h3>
                        <button 
                            onClick={() => setCurrentDamageCategoryIndex(i => i + 1)}
                            disabled={currentDamageCategoryIndex >= groupedDamagedComponents.length - 1}
                            className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
                        >
                            &rarr;
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
                        {currentCategory.items.map(({ componentId, levelIndex, health, repairCost, isRoof }) => (
                            <div key={`${componentId}-${levelIndex}`} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between gap-2 animate-[fade-in_0.3s_ease-out]">
                                <div className="flex-grow">
                                    <p className="font-semibold text-white">{isRoof ? 'Cobertura' : `${levelIndex + 1}º Andar`}</p>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                                        <div className="bg-red-500 h-2.5 rounded-full" style={{width: `${health}%`}}></div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRepairComponent(componentId, levelIndex)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors flex-shrink-0"
                                >
                                    Reparar <span className="font-mono text-xs">({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(repairCost)})</span>
                                </button>
                            </div>
                        ))}
                    </div>
                 </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-center text-emerald-400 py-8">Nenhum dano detectado. Estrutura 100% intacta!</div>
            )}

            <button
                onClick={onNextWave}
                className="w-full mt-4 p-3 text-lg font-semibold text-slate-900 bg-amber-500 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {waveNumber < 3 ? `Iniciar Rodada ${waveNumber + 1}` : 'Ver Resultado Final'}
            </button>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
  }

  // --- Default Idle View ---

  return (
    <div id="tutorial-control-panel" className="h-full flex flex-col">
        <h2 className="text-2xl font-bold font-orbitron mb-4 text-white border-b border-slate-700 pb-2 flex-shrink-0">
          Painel de Controle
        </h2>
        
        <div className="flex-shrink-0 mb-4 border-b border-slate-700">
            <div className="grid grid-cols-3 gap-2 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        id={`tutorial-tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        disabled={isControlsDisabled}
                        className={`py-2 px-1 text-center font-bold rounded-md transition-colors duration-200 text-sm
                            ${activeTab === tab.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}
                            ${isControlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            {activeTab === 'build' && (
                <>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-amber-300 mb-2">Selecionar Andar</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                        {['T', ...Array.from({length: NUMBER_OF_FLOORS - 1}, (_, i) => `${i + 1}º`), 'C'].map((level, index) => {
                            const levelId = index === 0 ? 0 : index < NUMBER_OF_FLOORS ? index : 'roof';
                            const isSelected = selectedLevel === levelId;
                            return (
                                <button 
                                    key={level}
                                    onClick={() => {
                                      if (selectedLevel !== levelId) {
                                        playClick();
                                        onSelectLevel(levelId);
                                      }
                                    }}
                                    disabled={isControlsDisabled}
                                    className={`py-2 px-1 text-center font-bold rounded-md transition-colors duration-200 text-sm
                                        ${isSelected ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}
                                        ${isControlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {level}
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                {componentsToShow.map((componentId) => {
                  return (
                    <MaterialSelector
                      key={`${componentId}-${selectedLevel}`}
                      componentId={componentId}
                      currentMaterial={buildingState[componentId][levelIndex]}
                      onChange={(materialId) => onMaterialChange(componentId, materialId, levelIndex)}
                      disabled={isControlsDisabled}
                    />
                  );
                })}
                </div>
              </>
            )}
            
            {activeTab === 'defense' && (
                <>
                {defenseComponents.map((componentId) => {
                  const isComponentDisabled = isControlsDisabled || (!!activeDefenseSystem && activeDefenseSystem !== componentId);
                  return (
                    <MaterialSelector
                      key={componentId}
                      componentId={componentId}
                      currentMaterial={buildingState[componentId][0]}
                      onChange={(materialId) => onMaterialChange(componentId, materialId, 0)}
                      disabled={isComponentDisabled}
                    />
                  );
                })}
              </>
            )}

            {activeTab === 'simulate' && (
              <div className="mt-2">
                  <p className="text-center text-slate-300 mb-4">Escolha um desastre para iniciar a simulação em 3 rodadas.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(DISASTER_CONFIG) as DisasterId[]).map((disasterId) => {
                      const disaster = DISASTER_CONFIG[disasterId];
                      return (
                        <button
                          key={disasterId}
                          onClick={() => onStartSimulation(disasterId)}
                          disabled={isControlsDisabled}
                          className={`flex items-center justify-center gap-2 p-3 text-lg font-semibold text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:bg-slate-800 disabled:shadow-none disabled:transform-none disabled:cursor-wait ${disasterButtonColors[disasterId]}`}
                        >
                          <disaster.Icon className="text-2xl" />
                          {disaster.label}
                        </button>
                      );
                    })}
                  </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default ControlPanel;
