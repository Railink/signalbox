import { Position } from "../config/config";
import { RailSwitch } from "./switch";

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

export const isWaypoint = (
    node: RailWaypoint | RailSwitch
): node is RailWaypoint => Object.keys(node).includes("neighbors");
