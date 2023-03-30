import { Position } from "../config/config";
import { PinSignal } from "../data/pin";
import { RailWaypoint } from "./waypoint";

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

export interface RailSwitchDirection {
    node: number;
    cost: number;
    pin: PinSignal;
}

export type RailNode = RailSwitch | RailWaypoint;

export const isRailSwitch = (node: RailNode): node is RailSwitch => {
    return Object.keys(node).includes("plus") && Object.keys(node).includes("minus");
}
