import { StationConfig } from "@common/config/config";
import { SwitchState } from "@common/nodes/state";
import { isRailSwitch, RailNode } from "@common/nodes/switch";
import { isWaypoint } from "@common/nodes/waypoint";
import { LinkedListItem, DijkstraCalculator } from "dijkstra-calculator";
import { getNode } from "../config/config.util";
import { readSwitchState } from "../switches";
import { randomBytes } from "crypto";

export enum PathState {
    SAFE,
    SAFE_CAUTION,
    UNSAFE,
}

export const checkPathSate = (
    source: string,
    target: string,
    stationConfig: StationConfig
): PathState => {
    const calculatedPath = calculatePath(source, target, stationConfig);

    if (splitPathOnDirectionChange(stationConfig, calculatedPath).length > 1)
        return PathState.UNSAFE;

    let directionChange = false;

    console.log("AAA", source, target, calculatedPath);
    
    for (let step of calculatedPath) {
        const source = getNode(step.source, stationConfig);
        const target = getNode(step.target, stationConfig);

        if (!source || !target) continue;

        if (!canTravelBetween(source, target)) {
            console.log(source.id, target.id)
            return PathState.UNSAFE
        };

        if (isRailSwitch(source) && !directionChange) {
            directionChange = source.plus.node === target.id;
        }

        if (isRailSwitch(target) && !directionChange) {
            directionChange = target.plus.node === source.id;
        }
    }

    if (directionChange) return PathState.SAFE_CAUTION;
    else return PathState.SAFE;
};

export const splitPathOnDirectionChange = (
    stationConfig: StationConfig,
    path: LinkedListItem[]
) => {
    const finalPath: LinkedListItem[][] = [];
    let currentStep: LinkedListItem[] = [];

    path.forEach((step, i) => {
        const prevNode =
            i === 0 ? null : getNode(path[i - 1].source, stationConfig);
        const currNode = getNode(step.source, stationConfig);
        const nextNode = getNode(step.target, stationConfig);
        if (prevNode && nextNode && currNode) {
            if (
                (prevNode.position.x > currNode.position.x &&
                    nextNode.position.x > currNode.position.x) ||
                (prevNode.position.x < currNode.position.x &&
                    nextNode.position.x < currNode.position.x)
            ) {
                finalPath.push(currentStep);
                currentStep = [];
            }
        }
        currentStep.push(step);
    });

    finalPath.push(currentStep);

    return finalPath;
};

export const calculatePath = (
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

    const graph = new DijkstraCalculator(); // Blank point for points with no further path

    pathNodes.forEach((pn) => {
        graph.addVertex(pn.id.toString()); // Add all points to the graph
    });

    pathNodes.forEach((pn) => {
        // Add the connections between them
        if (isWaypoint(pn)) {
            let randString = randomBytes(4).toString('hex');
            graph.addVertex(`___VOID___[${randString}]`);
            graph.addEdge(
                pn.id.toString(),
                pn.neighbors.left?.node?.toString() ?? `___VOID___[${randString}]`,
                pn.neighbors.left?.cost
            );
            randString = randomBytes(4).toString('hex');
            graph.addVertex(`___VOID___[${randString}]`);
            graph.addEdge(
                pn.id.toString(),
                pn.neighbors.right?.node?.toString() ?? `___VOID___[${randString}]`,
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

export const canTravelBetween = (
    source: RailNode,
    target: RailNode
): boolean => {
    if (isWaypoint(source) && isWaypoint(target)) {
        const sourceNeighbors = source.neighbors;
        const targetNeighbors = target.neighbors;
        // Check if target and source are neighbors
        return (
            (sourceNeighbors.left?.node === target.id ||
                sourceNeighbors.right?.node === target.id) &&
            (targetNeighbors.left?.node === source.id ||
                targetNeighbors.right?.node === source.id)
        );
    }

    if (isRailSwitch(source) && isRailSwitch(target)) {
        const sourceState = readSwitchState(source);
        const targetState = readSwitchState(target);

        // Switches are back-to-back
        if (source.back.node === target.id && target.back.node === source.id)
            return true;

        // The state the target has to be in in order to travel
        const requiredTargetState =
            target.minus.node === source.id
                ? SwitchState.MINUS
                : target.plus.node === source.id
                ? SwitchState.PLUS
                : SwitchState.UNKNOWN;

        // The target is behind the source
        console.log(source.back, target.id, requiredTargetState, targetState)
        if (source.back.node === target.id) return requiredTargetState == targetState;

        if (sourceState === SwitchState.MINUS) {
            // The target switch is in the same direction as the source switch
            if (
                source.minus.node === target.id &&
                target.back.node === source.id
            )
                return true;

            // The target is on the source's minus side and both switches' states match
            if (
                source.minus.node === target.id &&
                targetState === requiredTargetState
            )
                return true;
        }

        if (sourceState === SwitchState.PLUS) {
            // The target switch is in the same direction as the source switch
            if (
                source.plus.node === target.id &&
                target.back.node === source.id
            )
                return true;

            // The target is on the source's plus side and both switches' states match
            if (
                source.plus.node === target.id &&
                targetState === requiredTargetState
            )
                return true;
        }

        if (requiredTargetState === SwitchState.UNKNOWN) return false; // Target unreachable from source
    }

    if (isRailSwitch(source) && isWaypoint(target)) {
        // The switch is switched in the correct direction
        const sourceState = readSwitchState(source);
        if (source.back.node === target.id) return true; // The waypoint is behind the switch
        if (
            sourceState === SwitchState.MINUS &&
            source.minus.node === target.id
        )
            return true;
        if (sourceState === SwitchState.PLUS && source.plus.node === target.id)
            return true;
    }

    if (isWaypoint(source) && isRailSwitch(target)) {
        return canTravelBetween(target, source);
    }
    return false;
};
