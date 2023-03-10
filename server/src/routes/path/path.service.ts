import { RailSwitchDirection, StationConfig } from "@railink/signalbox";
import { randomBytes } from "crypto";
import { DijkstraCalculator } from "dijkstra-calculator";
import { LinkedListItem } from "dijkstra-calculator/build/main/lib";
import { Controller } from "../../controllers/Controller";

interface WaypointNode {
    type: "waypoint";
    id: number;
    left: {
        node: number;
        cost: number;
    } | null;
    right: {
        node: number;
        cost: number;
    } | null;
}

interface RailSwitchNode {
    type: "switch";
    id: number;
    plus: RailSwitchDirection;
    minus: RailSwitchDirection;
    back: {
        node: number;
        cost: number;
    };
}

const isWaypoint = (
    node: WaypointNode | RailSwitchNode
): node is WaypointNode => node.type === "waypoint";

const queues: Map<string, LinkedListItem[][]> = new Map();

export const createPath = (
    start: string,
    finish: string,
    stationConfig: StationConfig
): LinkedListItem[] => {
    const nodes = [
        ...stationConfig.switches.map((s) => s.id.toString()),
        ...stationConfig.waypoints.map((wp) => wp.id.toString()),
    ]; // For quick existency check

    const pathNodes = [
        ...stationConfig.switches.map((s) => {
            return {
                type: "switch",
                id: s.id,
                plus: s.plus,
                minus: s.minus,
                back: s.back,
            } as RailSwitchNode;
        }),
        ...stationConfig.waypoints.map((wp) => {
            return {
                type: "waypoint",
                id: wp.id,
                left: wp.neighbors.left ?? { node: "___VOID___", cost: 1 },
                right: wp.neighbors.right ?? { node: "___VOID___", cost: 1 },
            } as WaypointNode;
        }),
    ];

    if (!(nodes.includes(start) || nodes.includes(finish))) {
        throw new Error("Invalid path nodes supplied!");
    }

    const graph = new DijkstraCalculator();
    graph.addVertex("___VOID___"); // Blank point for points with no further path

    pathNodes.forEach((pn) => {
        graph.addVertex(pn.id.toString()); // Add all points to the graph
    });

    pathNodes.forEach((pn) => {
        // Add the connections between them
        if (isWaypoint(pn)) {
            graph.addEdge(
                pn.id.toString(),
                pn.left?.node?.toString() ?? "___VOID___",
                pn.left?.cost
            );
            graph.addEdge(
                pn.id.toString(),
                pn.right?.node?.toString() ?? "___VOID___",
                pn.right?.cost
            );
        } else {
            console.log(pn);
            graph.addEdge(
                pn.id.toString(),
                pn.back.node.toString(),
                pn.back.cost
            );
            graph.addEdge(
                pn.id.toString(),
                pn.plus.node.toString(),
                pn.plus.cost
            );
            graph.addEdge(
                pn.id.toString(),
                pn.minus.node.toString(),
                pn.minus.cost
            );
        }
    });

    return graph.calculateShortestPathAsLinkedListResult(start, finish);
};

export const setPath = (
    stationConfig: StationConfig,
    controllers: Controller[],
    steps: LinkedListItem[][],
    withSignals: boolean
): { type: "plan" | "result"; id: string; steps: LinkedListItem[][] } => {
    if (steps.length > 1) {
        const planId = randomBytes(20).toString("hex");
        queues.set(planId, steps);
        return {
            type: "plan",
            id: planId,
            steps,
        };
    } else {
        return {
            type: "result",
            id: "___SUCCESS___",
            steps
        };
    }
};
