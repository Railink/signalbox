import { Position } from "../config/config";
import { PinSignal } from "../data/pin";

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