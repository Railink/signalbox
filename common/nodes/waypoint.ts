import { Position } from "../config/config";

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
