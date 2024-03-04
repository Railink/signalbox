import { LinkedListItem } from "dijkstra-calculator";

export interface PathSetResult {
    type: "plan" | "result";
    id: string;
    steps: LinkedListItem[][];
    path: string;
}
