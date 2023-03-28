"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getController = exports.getNode = void 0;
const __1 = require("..");
const getNode = (id, stationConfig) => {
    var _a, _b;
    console.log(id, isNaN(+id));
    if (isNaN(+id))
        return null;
    return ((_b = (_a = stationConfig.switches.find((s) => s.id === Number(id))) !== null && _a !== void 0 ? _a : stationConfig.waypoints.find((wp) => wp.id === Number(id))) !== null && _b !== void 0 ? _b : null);
};
exports.getNode = getNode;
const getController = (pin) => {
    let iterations = 0;
    let pinSum = 0;
    for (let controller of __1.controllers) {
        if (pinSum + controller.size() > pin)
            break;
        pinSum += controller.size();
        iterations++;
    }
    return {
        pin: pin - pinSum,
        controller: __1.controllers[iterations],
    };
};
exports.getController = getController;
