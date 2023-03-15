import { PinSignal } from "../data/pin";

export interface LightingNode {
    name: string;
    id: number;
    pins: PinSignal[];
  }