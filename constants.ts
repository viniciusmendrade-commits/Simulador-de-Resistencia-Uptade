
import type { ComponentConfig, Disaster, BuildingState, ComponentHealth } from './types';
import { BuildingComponentId, DisasterId, MaterialTypeId } from './types';
import { TsunamiIcon, HurricaneIcon, EarthquakeIcon, LightningIcon } from './components/Icons';

export const NUMBER_OF_FLOORS = 7;

export const COMPONENT_CONFIG: Record<BuildingComponentId, ComponentConfig> = {
  [BuildingComponentId.Roof]: {
    label: 'Teto',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Laje Fibrocimento', resistance: 30, color: 'bg-slate-600', cost: 15000 },
      [MaterialTypeId.Medium]: { name: 'Telha Cerâmica', resistance: 35, color: 'bg-red-600', cost: 50000 },
      [MaterialTypeId.Strong]: { name: 'Telha Metálica', resistance: 70, color: 'bg-slate-300', cost: 60000 },
    },
  },
  [BuildingComponentId.Walls]: {
    label: 'Paredes',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Drywall', resistance: 45, color: 'bg-neutral-200', cost: 48000 },
      [MaterialTypeId.Medium]: { name: 'Bloco Cerâmico', resistance: 65, color: 'bg-slate-300', cost: 65000 },
      [MaterialTypeId.Strong]: { name: 'Bloco de Concreto', resistance: 75, color: 'bg-stone-600', cost: 18000 },
    },
  },
  [BuildingComponentId.Pillars]: {
    label: 'Pilares',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Concreto Pré-Moldado', resistance: 70, color: 'bg-slate-400', cost: 13000 },
      [MaterialTypeId.Medium]: { name: 'Aço Estrutural', resistance: 75, color: 'bg-zinc-500', cost: 14000 },
      [MaterialTypeId.Strong]: { name: 'Concreto Armado', resistance: 90, color: 'bg-stone-700', cost: 13500 },
    },
  },
  [BuildingComponentId.Beams]: {
    label: 'Vigas',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Viga Metálica', resistance: 30, color: 'bg-stone-200', cost: 3000 },
      [MaterialTypeId.Medium]: { name: 'Viga de Madeira Maciça', resistance: 80, color: 'bg-amber-700', cost: 4500 },
      [MaterialTypeId.Strong]: { name: 'Viga de Concreto Armado', resistance: 90, color: 'bg-stone-600', cost: 4000 },
    },
  },
  [BuildingComponentId.Floor]: {
    label: 'Piso',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Piso Vinílico', resistance: 40, color: 'bg-stone-100', cost: 40000 },
      [MaterialTypeId.Medium]: { name: 'Piso Cerâmica', resistance: 45, color: 'bg-amber-100', cost: 22000 },
      [MaterialTypeId.Strong]: { name: 'Porcelanato', resistance: 60, color: 'bg-slate-300', cost: 36000 },
    },
  },
  [BuildingComponentId.Glass]: {
    label: 'Vidros',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Vão Aberto', resistance: 1, color: 'bg-black/10', cost: 0 },
      [MaterialTypeId.Medium]: { name: 'Vidro Comum', resistance: 50, color: 'bg-cyan-200/60', cost: 20000 },
      [MaterialTypeId.Strong]: { name: 'Vidro Temperado', resistance: 60, color: 'bg-cyan-400/60', cost: 25000 },
    },
  },
  [BuildingComponentId.LightningRod]: {
    label: 'Contra Tempestade de Raios (SPDA)',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Sem Proteção', resistance: 1, color: 'hidden', cost: 0 },
      [MaterialTypeId.Medium]: { name: 'SPDA Franklin', resistance: 25, color: 'bg-slate-400', cost: 10000 },
      [MaterialTypeId.Strong]: { name: 'SPDA Completo', resistance: 30, color: 'bg-slate-300', cost: 25000 },
    },
  },
  [BuildingComponentId.WindDampers]: {
    label: 'Contra Furacão',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Sem Proteção', resistance: 1, color: 'hidden', cost: 0 },
      [MaterialTypeId.Medium]: { name: 'Vidros Laminados', resistance: 20, color: 'bg-cyan-800/80', cost: 50000 },
      [MaterialTypeId.Strong]: { name: 'Dampers de Vento', resistance: 25, color: 'bg-slate-500', cost: 110000 },
    },
  },
  [BuildingComponentId.TsunamiBarriers]: {
    label: 'Contra Tsunami',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Sem Proteção', resistance: 1, color: 'hidden', cost: 0 },
      [MaterialTypeId.Medium]: { name: 'Parede Quebra-Maré', resistance: 35, color: 'bg-yellow-700', cost: 75000 },
      [MaterialTypeId.Strong]: { name: 'Barreiras Anti-Inundação', resistance: 40, color: 'bg-stone-500', cost: 100000 },
    },
  },
  [BuildingComponentId.SeismicDampers]: {
    label: 'Contra Terremoto',
    materials: {
      [MaterialTypeId.Weak]: { name: 'Sem Proteção', resistance: 1, color: 'hidden', cost: 0 },
      [MaterialTypeId.Medium]: { name: 'Amortecedores Hidráulicos', resistance: 50, color: 'bg-red-700/80', cost: 120000 },
      [MaterialTypeId.Strong]: { name: 'Isoladores Sísmicos', resistance: 55, color: 'bg-gray-700', cost: 150000 },
    },
  },
};

export const DISASTER_CONFIG: Record<DisasterId, Disaster> = {
  [DisasterId.LightningStorm]: {
    label: 'Tempestade de Raios',
    power: 120,
    Icon: LightningIcon,
  },
  [DisasterId.Hurricane]: {
    label: 'Furacão',
    power: 90,
    Icon: HurricaneIcon,
  },
  [DisasterId.Tsunami]: {
    label: 'Tsunami',
    power: 110,
    Icon: TsunamiIcon,
  },
  [DisasterId.Earthquake]: {
    label: 'Terremoto',
    power: 135,
    Icon: EarthquakeIcon,
  },
};

const createInitialState = <T>(floorValue: T, roofValue: T): Record<BuildingComponentId, T[]> => ({
  [BuildingComponentId.Roof]: [roofValue],
  [BuildingComponentId.Walls]: Array(NUMBER_OF_FLOORS).fill(floorValue),
  [BuildingComponentId.Pillars]: Array(NUMBER_OF_FLOORS).fill(floorValue),
  [BuildingComponentId.Beams]: Array(NUMBER_OF_FLOORS).fill(floorValue),
  [BuildingComponentId.Floor]: Array(NUMBER_OF_FLOORS).fill(floorValue),
  [BuildingComponentId.Glass]: Array(NUMBER_OF_FLOORS).fill(floorValue),
  [BuildingComponentId.LightningRod]: [floorValue],
  [BuildingComponentId.WindDampers]: [floorValue],
  [BuildingComponentId.TsunamiBarriers]: [floorValue],
  [BuildingComponentId.SeismicDampers]: [floorValue],
});

export const INITIAL_BUILDING_STATE: BuildingState = createInitialState(MaterialTypeId.Weak, MaterialTypeId.Weak);
export const INITIAL_HEALTH_STATE: ComponentHealth = createInitialState(100, 100);

// Constants for Structural Bonus calculation
const getAvgResistance = (materialType: MaterialTypeId): number => {
    const p = COMPONENT_CONFIG[BuildingComponentId.Pillars].materials[materialType].resistance;
    const b = COMPONENT_CONFIG[BuildingComponentId.Beams].materials[materialType].resistance;
    const f = COMPONENT_CONFIG[BuildingComponentId.Floor].materials[materialType].resistance;
    return (p + b + f) / 3;
};

export const MIN_STRUCTURAL_RESISTANCE = getAvgResistance(MaterialTypeId.Weak);
export const MAX_STRUCTURAL_RESISTANCE = getAvgResistance(MaterialTypeId.Strong);
export const MAX_STRUCTURAL_BONUS = 0.3; // 30% max bonus
