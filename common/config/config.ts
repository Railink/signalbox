import { LightingNode } from "../nodes/lighting";
import { RailSignal } from "../nodes/signal";
import { RailSwitch } from "../nodes/switch";
import { RailWaypoint } from "../nodes/waypoint";

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
