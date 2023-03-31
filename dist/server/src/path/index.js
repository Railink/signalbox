"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTravelBetween = exports.calculatePath = exports.splitPathOnDirectionChange = exports.checkPathSate = exports.PathState = void 0;
const state_1 = require("@common/nodes/state");
const switch_1 = require("@common/nodes/switch");
const waypoint_1 = require("@common/nodes/waypoint");
const dijkstra_calculator_1 = require("dijkstra-calculator");
const config_util_1 = require("../config/config.util");
const switches_1 = require("../switches");
var PathState;
(function (PathState) {
    PathState[PathState["SAFE"] = 0] = "SAFE";
    PathState[PathState["SAFE_CAUTION"] = 1] = "SAFE_CAUTION";
    PathState[PathState["UNSAFE"] = 2] = "UNSAFE";
})(PathState = exports.PathState || (exports.PathState = {}));
const checkPathSate = (source, target, stationConfig) => {
    const calculatedPath = (0, exports.calculatePath)(source, target, stationConfig);
    if ((0, exports.splitPathOnDirectionChange)(stationConfig, calculatedPath).length > 1)
        return PathState.UNSAFE;
    let directionChange = false;
    console.log("AAA", source, target, calculatedPath);
    for (let step of calculatedPath) {
        const source = (0, config_util_1.getNode)(step.source, stationConfig);
        const target = (0, config_util_1.getNode)(step.target, stationConfig);
        console.log(source, target);
        if (!source || !target)
            continue;
        if (!(0, exports.canTravelBetween)(source, target))
            return PathState.UNSAFE;
        if ((0, switch_1.isRailSwitch)(source) && !directionChange) {
            directionChange = source.plus.node === target.id;
            console.log(source.plus.node === target.id);
        }
        if ((0, switch_1.isRailSwitch)(target) && !directionChange) {
            directionChange = target.plus.node === source.id;
            console.log(target.plus.node === source.id);
        }
    }
    if (directionChange)
        return PathState.SAFE_CAUTION;
    else
        return PathState.SAFE;
};
exports.checkPathSate = checkPathSate;
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
exports.splitPathOnDirectionChange = splitPathOnDirectionChange;
const calculatePath = (start, finish, stationConfig) => {
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
        if ((0, waypoint_1.isWaypoint)(pn)) {
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
    return graph.calculateShortestPathAsLinkedListResult(start, finish);
};
exports.calculatePath = calculatePath;
const canTravelBetween = (source, target) => {
    var _a, _b, _c, _d;
    if ((0, waypoint_1.isWaypoint)(source) && (0, waypoint_1.isWaypoint)(target)) {
        const sourceNeighbors = source.neighbors;
        const targetNeighbors = target.neighbors;
        // Check if target and source are neighbors
        return ((((_a = sourceNeighbors.left) === null || _a === void 0 ? void 0 : _a.node) === target.id ||
            ((_b = sourceNeighbors.right) === null || _b === void 0 ? void 0 : _b.node) === target.id) &&
            (((_c = targetNeighbors.left) === null || _c === void 0 ? void 0 : _c.node) === source.id ||
                ((_d = targetNeighbors.right) === null || _d === void 0 ? void 0 : _d.node) === source.id));
    }
    if ((0, switch_1.isRailSwitch)(source) && (0, switch_1.isRailSwitch)(target)) {
        const sourceState = (0, switches_1.readSwitchState)(source);
        const targetState = (0, switches_1.readSwitchState)(target);
        // Switches are back-to-back
        if (source.back.node === target.id && target.back.node === source.id)
            return true;
        // The state the target has to be in in order to travel
        const requiredTargetState = target.minus.node === source.id
            ? state_1.SwitchState.MINUS
            : target.plus.node === source.id
                ? state_1.SwitchState.PLUS
                : state_1.SwitchState.UNKNOWN;
        if (sourceState === state_1.SwitchState.MINUS) {
            // The target switch is in the same direction as the source switch
            if (source.minus.node === target.id &&
                target.back.node === source.id)
                return true;
            // The target is on the source's minus side and both switches' states match
            if (source.minus.node === target.id &&
                targetState === requiredTargetState)
                return true;
        }
        if (sourceState === state_1.SwitchState.PLUS) {
            // The target switch is in the same direction as the source switch
            if (source.plus.node === target.id &&
                target.back.node === source.id)
                return true;
            // The target is on the source's plus side and both switches' states match
            if (source.plus.node === target.id &&
                targetState === requiredTargetState)
                return true;
        }
        if (requiredTargetState === state_1.SwitchState.UNKNOWN)
            return false; // Target unreachable from source
    }
    if ((0, switch_1.isRailSwitch)(source) && (0, waypoint_1.isWaypoint)(target)) {
        // The switch is switched in the correct direction
        const sourceState = (0, switches_1.readSwitchState)(source);
        if (source.back.node === target.id)
            return true; // The waypoint is behind the switch
        if (sourceState === state_1.SwitchState.MINUS &&
            source.minus.node === target.id)
            return true;
        if (sourceState === state_1.SwitchState.PLUS && source.plus.node === target.id)
            return true;
    }
    if ((0, waypoint_1.isWaypoint)(source) && (0, switch_1.isRailSwitch)(target)) {
        return (0, exports.canTravelBetween)(target, source);
    }
    return false;
};
exports.canTravelBetween = canTravelBetween;
