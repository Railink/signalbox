import { StationConfig } from "@common/config/config";
import { SwitchState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { isWaypoint, RailWaypoint } from "@common/nodes/waypoint";
import { randomBytes } from "crypto";
import { LinkedListItem } from "dijkstra-calculator/build/main/lib";
import { getNode } from "../../config/config.util";
import { PathSetResult } from "@common/path";
import { setSwitch } from "../../switches";
import { calculatePath, splitPathOnDirectionChange } from "../../path";

type RailNode = RailSwitch | RailWaypoint | null;

const activePaths: Map<string, LinkedListItem[]> = new Map(); // Currently used paths
const queues: Map<string, LinkedListItem[][]> = new Map(); // Switching queues

export const getActivePaths = (): { id: string; steps: LinkedListItem[] }[] =>
    Array.from(activePaths, ([id, steps]) => {
        return { id, steps };
    });

export const getActiveQueues = (): {
    id: string;
    steps: LinkedListItem[][];
}[] =>
    Array.from(queues, ([id, steps]) => {
        return { id, steps };
    });

export const createPath = (
    start: string,
    finish: string,
    stationConfig: StationConfig
): LinkedListItem[][] => {
    return splitPathOnDirectionChange(
        stationConfig,
        calculatePath(start, finish, stationConfig)
    );
};

export const setPath = (
    stationConfig: StationConfig,
    steps: LinkedListItem[],
    withSignals: boolean // TODO: Automatic signal setting according to the path
): PathSetResult => {
    // Make sure `steps` exists and it's of the correct type
    if (!steps || steps.length < 1) throw new Error("Invalid steps!");

    const validatedPath = splitPathOnDirectionChange(stationConfig, steps);

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
        if (
            steps.find(
                (step) =>
                    Array.from(activePaths.values()).find((p) =>
                        p.find((s) => s.source === step.source)
                    ) // Another path includes a node required for this one
            )
        ) {
            return {
                type: "result",
                id: "___COLLISION___", // Indicate that the path collides with an already confirmed one
                steps: [],
            };
        }

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
                    setSwitch(source, state);
                }
            };

            setNode(sourceNode, targetNode);
            setNode(targetNode, sourceNode);
        });

        activePaths.set(randomBytes(20).toString("hex"), steps);

        return {
            // semi-placeholder response, nothing to return from a single-step operation
            type: "result",
            id: "___SUCCESS___",
            steps: [steps],
        };
    }
};

export const unlockPath = (id: string) => {
    if (!activePaths.has(id)) {
        return "Invalid path id!";
    } else {
        activePaths.delete(id);
        return "OK!";
    }
};

export const nextStep = (
    stationConfig: StationConfig,
    id: string
): PathSetResult => {
    if (!queues.has(id)) {
        return {
            type: "result",
            id: "___INVQUEUE___",
            steps: [],
        };
    }

    const queue = queues.get(id)!!;
    const nextStep = queue[0];
    const result = setPath(stationConfig, nextStep, false);

    if (result.id === "___COLLISION___") {
        return {
            type: "result",
            id: "___COLLISION___",
            steps: [],
        };
    }

    queue.shift();

    if (queue.length <= 0) queues.delete(id);

    return {
        type: "result",
        id: "___SUCCESS___",
        steps: [],
    };
};
