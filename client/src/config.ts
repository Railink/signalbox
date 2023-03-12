export interface AppConfig {
  version: number;
  name: string;
  gpio: GpioConfig;
}

export interface GpioConfig {
  expanders: ExpanderConfig[];
}

export interface ExpanderConfig {
  type: string;
  pins: PinConfig[];
  environment: ExpanderEnvironmentVariable[];
  size: number;
}

export interface PinConfig {
  id: number;
  name: string;
}

export interface ExpanderEnvironmentVariable {
  name: string;
  value: string;
}

export interface AppContext {
  appConfig: AppConfig;
  stationConfig: StationConfig;
}

export interface Position {
  x: number;
  y: number;
}

export interface StationConfig {
  switches: RailSwitch[];
  signals: RailSignal[];
  lighting: LightingNode[];
  waypoints: RailWaypoint[];
}

export interface RailSwitch {
  id: number;
  position: Position;
  plus: RailSwitchDirection;
  minus: RailSwitchDirection;
  back: {
    node: number;
    cost: number;
  };
}

export interface PinSignal {
  id: number;
  controller: number;
  value: string;
}

export interface RailSwitchDirection {
  node: number;
  cost: number;
  pin: PinSignal;
}

export interface RailSignal {
  id: number;
  pulse: boolean;
  aspects: SignalAspect[];
  switchFront: number;
  position: Position;
}

export interface SignalAspect {
  name: string;
  id: number;
  pins: PinSignal[];
}

export interface LightingNode {
  name: string;
  id: number;
  pins: PinSignal[];
}

export interface RailWaypoint {
  id: number;
  name: string;
  position: Position;
  neighbors: {
    left: {
      node: number;
      cost: number;
    } | null;
    right: {
      node: number;
      cost: number;
    } | null;
  };
}

export enum PinState {
  HIGH,
  LOW,
  UNKNOWN,
}

export enum SwitchState {
  PLUS,
  MINUS,
  UNKNOWN,
}

export interface SwitchNodeState {
  id: number;
  state: number;
}

export type RailNode = RailSwitch | RailWaypoint;