"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyPath = exports.nextStep = exports.unlockPath = exports.setPath = exports.createPath = exports.getActiveQueues = exports.getActivePaths = void 0;
const state_1 = require("@common/nodes/state");
const waypoint_1 = require("@common/nodes/waypoint");
const crypto_1 = require("crypto");
const config_util_1 = require("../../config/config.util");
const switches_1 = require("../../switches");
const path_1 = require("../../path");
const activePaths = new Map(); // Currently used paths
const queues = new Map(); // Switching queues
const lastQueuePath = new Map(); // Last path a queue has locked
const getActivePaths = () => Array.from(activePaths, ([id, steps]) => {
    return { id, steps };
});
exports.getActivePaths = getActivePaths;
const getActiveQueues = () => Array.from(queues, ([id, steps]) => {
    return { id, steps };
});
exports.getActiveQueues = getActiveQueues;
const createPath = (start, finish, stationConfig) => {
    return (0, path_1.splitPathOnDirectionChange)(stationConfig, (0, path_1.calculatePath)(start, finish, stationConfig));
};
exports.createPath = createPath;
const setPath = (stationConfig, steps, withSignals // TODO: Automatic signal setting according to the path
) => {
    // Make sure `steps` exists and it's of the correct type
    if (!steps || steps.length < 1)
        throw new Error("Invalid steps!");
    const validatedPath = (0, path_1.splitPathOnDirectionChange)(stationConfig, steps);
    if (validatedPath.length > 1) {
        // Multi-step operation, requires switching - only planning and awaiting step confirmations
        const planId = (0, crypto_1.randomBytes)(20).toString("hex");
        queues.set(planId, validatedPath);
        return {
            type: "plan",
            id: planId,
            steps: validatedPath,
            path: "___NULL___",
        };
    }
    else {
        if (steps.find((step) => Array.from(activePaths.values()).find((p) => p.find((s) => s.source === step.source ||
            s.source === step.target ||
            s.target === step.source ||
            s.target === step.target)) // Another path includes a node required for this one
        )) {
            return {
                type: "result",
                id: "___COLLISION___",
                steps: [],
                path: "___NULL___",
            };
        }
        steps.forEach((step) => {
            // Only 1 step present, thus, setting the path right away
            const sourceNode = (0, config_util_1.getNode)(step.source, stationConfig);
            const targetNode = (0, config_util_1.getNode)(step.target, stationConfig);
            if (!sourceNode || !targetNode)
                throw new Error("Invalid node in steps!");
            const setNode = (source, target) => {
                if (source === null || target === null)
                    return;
                if (!(0, waypoint_1.isWaypoint)(source)) {
                    const state = source.minus.node === target.id
                        ? state_1.SwitchState.MINUS
                        : state_1.SwitchState.PLUS;
                    if (source.back.node === target.id)
                        return;
                    (0, switches_1.setSwitch)(source, state);
                }
                if (!(0, waypoint_1.isWaypoint)(target)) {
                    const state = target.minus.node === source.id
                        ? state_1.SwitchState.MINUS
                        : state_1.SwitchState.PLUS;
                    if (target.back.node === source.id)
                        return;
                    (0, switches_1.setSwitch)(target, state);
                }
            };
            setNode(sourceNode, targetNode);
            setNode(targetNode, sourceNode);
        });
        const pathId = (0, crypto_1.randomBytes)(20).toString("hex");
        activePaths.set(pathId, steps);
        return {
            // semi-placeholder response, nothing to return from a single-step operation
            type: "result",
            id: "___SUCCESS___",
            steps: [steps],
            path: pathId,
        };
    }
};
exports.setPath = setPath;
const unlockPath = (id) => {
    if (!activePaths.has(id)) {
        return "Invalid path id!";
    }
    else {
        activePaths.delete(id);
        return "OK!";
    }
};
exports.unlockPath = unlockPath;
const nextStep = (stationConfig, id) => {
    var _a, _b;
    if (!queues.has(id)) {
        return {
            type: "result",
            id: "___INVQUEUE___",
            steps: [],
            path: "___NULL___",
        };
    }
    const queue = queues.get(id);
    const nextStep = queue[0];
    let result = (0, exports.setPath)(stationConfig, nextStep, false);
    // If there's collision but the last path set by this queue includes the source node of this step try unlocking it
    if (result.id === "___COLLISION___" &&
        ((_b = activePaths
            .get((_a = lastQueuePath.get(id)) !== null && _a !== void 0 ? _a : "")) === null || _b === void 0 ? void 0 : _b.find((s) => nextStep.find((step) => s.source === step.source ||
            s.source === step.target ||
            s.target === step.source ||
            s.target === step.target)))) {
        (0, exports.unlockPath)(lastQueuePath.get(id));
        lastQueuePath.delete(id);
        result = (0, exports.setPath)(stationConfig, nextStep, false);
    }
    if (result.id === "___COLLISION___") {
        return result;
    }
    queue.shift();
    if (queue.length <= 0)
        queues.delete(id);
    else
        lastQueuePath.set(id, result.path);
    return {
        type: "result",
        id: "___SUCCESS___",
        steps: [],
        path: result.path,
    };
};
exports.nextStep = nextStep;
const destroyPath = (id) => {
    queues.delete(id);
    return {
        type: "result",
        id: "___SUCCESS___",
        steps: [],
    };
};
exports.destroyPath = destroyPath;
