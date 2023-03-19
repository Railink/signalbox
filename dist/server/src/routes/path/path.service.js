"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPath = exports.createPath = exports.getActivePaths = void 0;
const state_1 = require("@common/nodes/state");
const crypto_1 = require("crypto");
const dijkstra_calculator_1 = require("dijkstra-calculator");
const config_util_1 = require("../../config/config.util");
const isWaypoint = (node) => Object.keys(node).includes("neighbors");
const activePaths = [];
const queues = new Map();
const getActivePaths = () => activePaths;
exports.getActivePaths = getActivePaths;
const createPath = (start, finish, stationConfig) => {
    const nodes = [
        ...stationConfig.switches.map((s) => s.id.toString()),
        ...stationConfig.waypoints.map((wp) => wp.id.toString()),
    ]; // For quick existency check
    const pathNodes = [...stationConfig.switches, ...stationConfig.waypoints];
    if (!(nodes.includes(start) || nodes.includes(finish))) {
        throw new Error("Invalid path nodes supplied!");
    }
    const graph = new dijkstra_calculator_1.DijkstraCalculator();
    graph.addVertex("___VOID___"); // Blank point for points with no further path
    pathNodes.forEach((pn) => {
        graph.addVertex(pn.id.toString()); // Add all points to the graph
    });
    pathNodes.forEach((pn) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Add the connections between them
        if (isWaypoint(pn)) {
            graph.addEdge(pn.id.toString(), (_c = (_b = (_a = pn.neighbors.left) === null || _a === void 0 ? void 0 : _a.node) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "___VOID___", (_d = pn.neighbors.left) === null || _d === void 0 ? void 0 : _d.cost);
            graph.addEdge(pn.id.toString(), (_g = (_f = (_e = pn.neighbors.right) === null || _e === void 0 ? void 0 : _e.node) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : "___VOID___", (_h = pn.neighbors.right) === null || _h === void 0 ? void 0 : _h.cost);
        }
        else {
            console.log(pn);
            graph.addEdge(pn.id.toString(), pn.back.node.toString(), pn.back.cost);
            graph.addEdge(pn.id.toString(), pn.plus.node.toString(), pn.plus.cost);
            graph.addEdge(pn.id.toString(), pn.minus.node.toString(), pn.minus.cost);
        }
    });
    return splitPathOnDirectionChange(stationConfig, graph.calculateShortestPathAsLinkedListResult(start, finish));
};
exports.createPath = createPath;
const validatePath = (stationConfig, steps) => {
    let currStep = [];
    let wholePath = [];
    steps.forEach((step) => {
        const sourceNode = (0, config_util_1.getNode)(step.source, stationConfig);
        const targetNode = (0, config_util_1.getNode)(step.target, stationConfig);
        if (!(targetNode === null || targetNode === void 0 ? void 0 : targetNode.position) || !(sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.position))
            throw new Error("Invalid node position!");
        if ((targetNode === null || targetNode === void 0 ? void 0 : targetNode.position.x) < (sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.position.x)) {
            wholePath.push(currStep);
            currStep = [step];
        }
        else {
            currStep.push(step);
        }
    });
    return wholePath;
};
// TODO: Check if the path collides with other active ones
const setPath = (stationConfig, steps, withSignals // TODO: Automatic signal setting according to the path
) => {
    // Make sure `steps` exists and it's of the correct type
    if (!steps || steps.length < 1)
        throw new Error("Invalid steps!");
    const validatedPath = validatePath(stationConfig, steps);
    if (validatedPath.length > 1) {
        // Multi-step operation, requires switching - only planning and awaiting step confirmations
        const planId = (0, crypto_1.randomBytes)(20).toString("hex");
        queues.set(planId, validatedPath);
        return {
            type: "plan",
            id: planId,
            steps: validatedPath,
        };
    }
    else {
        steps.forEach((step) => {
            // Only 1 step present, thus, setting the path right away
            const sourceNode = (0, config_util_1.getNode)(step.source, stationConfig);
            const targetNode = (0, config_util_1.getNode)(step.target, stationConfig);
            if (!sourceNode || !targetNode)
                throw new Error("Invalid node in steps!");
            const setNode = (source, target) => {
                if (source === null || target === null)
                    return;
                if (!isWaypoint(source)) {
                    const state = source.minus.node === target.id
                        ? state_1.SwitchState.MINUS
                        : state_1.SwitchState.PLUS;
                    if (source.back.node === target.id)
                        return;
                    let controllerConfig;
                    switch (state) {
                        case state_1.SwitchState.PLUS:
                            controllerConfig = (0, config_util_1.getController)(source.plus.pin.id);
                            controllerConfig.controller.setValue(controllerConfig.pin, source.plus.pin.value);
                            break;
                        case state_1.SwitchState.MINUS:
                            controllerConfig = (0, config_util_1.getController)(source.minus.pin.id);
                            controllerConfig.controller.setValue(controllerConfig.pin, source.minus.pin.value);
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
exports.setPath = setPath;
const splitPathOnDirectionChange = (stationConfig, path) => {
    const finalPath = [];
    let currentStep = [];
    path.forEach((step, i) => {
        const prevNode = i === 0 ? null : (0, config_util_1.getNode)(path[i - 1].source, stationConfig);
        const currNode = (0, config_util_1.getNode)(step.source, stationConfig);
        const nextNode = (0, config_util_1.getNode)(step.target, stationConfig);
        if (prevNode && nextNode && currNode) {
            if ((prevNode.position.x > currNode.position.x &&
                nextNode.position.x > currNode.position.x) ||
                (prevNode.position.x < currNode.position.x &&
                    nextNode.position.x < currNode.position.x)) {
                finalPath.push(currentStep);
                currentStep = [];
            }
        }
        currentStep.push(step);
    });
    finalPath.push(currentStep);
    return finalPath;
};
