import { StationConfig } from "@common/config/config";
import { SwitchState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import { randomBytes } from "crypto";
import { DijkstraCalculator } from "dijkstra-calculator";
import { LinkedListItem } from "dijkstra-calculator/build/main/lib";
import { getNode, getController } from "../../config/config.util";

type RailNode = RailSwitch | RailWaypoint | null;

const isWaypoint = (node: RailWaypoint | RailSwitch): node is RailWaypoint =>
    Object.keys(node).includes("neighbors");

const activePaths: LinkedListItem[][] = [];
const queues: Map<string, LinkedListItem[][]> = new Map();

export const getActivePaths = () => activePaths;

export const createPath = (
    start: string,
    finish: string,
    stationConfig: StationConfig
): LinkedListItem[] => {
    const nodes = [
        ...stationConfig.switches.map((s) => s.id.toString()),
        ...stationConfig.waypoints.map((wp) => wp.id.toString()),
    ]; // For quick existency check

    const pathNodes = [...stationConfig.switches, ...stationConfig.waypoints];

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
                pn.neighbors.left?.node?.toString() ?? "___VOID___",
                pn.neighbors.left?.cost
            );
            graph.addEdge(
                pn.id.toString(),
                pn.neighbors.right?.node?.toString() ?? "___VOID___",
                pn.neighbors.right?.cost
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

const validatePath = (
    stationConfig: StationConfig,
    steps: LinkedListItem[]
) => {
    let currStep: LinkedListItem[] = [];
    let wholePath: LinkedListItem[][] = [];
    steps.forEach((step) => {
        const sourceNode = getNode(step.source, stationConfig);
        const targetNode = getNode(step.target, stationConfig);

        if (!targetNode?.position || !sourceNode?.position) throw new Error("Invalid node position!");

        if (targetNode?.position.x < sourceNode?.position.x) {
          wholePath.push(currStep);
          currStep = [step];
        } else {
          currStep.push(step);
        }
    });

    return wholePath;
};

// TODO: Check if the path collides with other active ones
export const setPath = (
    stationConfig: StationConfig,
    steps: LinkedListItem[],
    withSignals: boolean // TODO: Automatic signal setting according to the path
): { type: "plan" | "result"; id: string; steps: LinkedListItem[][] } => {
    // Make sure `steps` exists and it's of the correct type
    if (!steps || steps.length < 1) throw new Error("Invalid steps!");

    const validatedPath = validatePath(stationConfig, steps);

    if (validatedPath.length > 1) {
        // Multi-step operation, requires switching - only planning and awaiting step confirmations
        const planId = randomBytes(20).toString("hex");
        queues.set(planId, validatedPath);
        return {
            type: "plan",
            id: planId,
            steps: validatedPath,
        };
    } else {
        steps.forEach((step) => {
            // Only 1 step present, thus, setting the path right away
            const sourceNode = getNode(step.source, stationConfig);
            const targetNode = getNode(step.target, stationConfig);

            if (!sourceNode || !targetNode)
                throw new Error("Invalid node in steps!");

            const setNode = (source: RailNode, target: RailNode) => {
                if (source === null || target === null) return;
                if (!isWaypoint(source)) {
                    const state =
                        source.minus.node === target.id
                            ? SwitchState.MINUS
                            : SwitchState.PLUS;

                    if (source.back.node === target.id) return;

                    let controllerConfig;
                    switch (state) {
                        case SwitchState.PLUS:
                            controllerConfig = getController(
                                source.plus.pin.id
                            );
                            controllerConfig.controller.setValue(
                                controllerConfig.pin,
                                source.plus.pin.value
                            );
                            break;
                        case SwitchState.MINUS:
                            controllerConfig = getController(
                                source.minus.pin.id
                            );
                            controllerConfig.controller.setValue(
                                controllerConfig.pin,
                                source.minus.pin.value
                            );
                            break;
                    }
                }
            };

            setNode(sourceNode, targetNode);
            setNode(targetNode, sourceNode);
        });

        activePaths.push(steps);

        return {
            // semi-placeholder response, nothing to return from a single-step operation
            type: "result",
            id: "___SUCCESS___",
            steps: [steps],
        };
    }
};
