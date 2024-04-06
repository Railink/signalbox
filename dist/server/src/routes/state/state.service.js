"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalState = exports.switchState = void 0;
const config_util_1 = require("../../config/config.util");
const switches_1 = require("../../switches");
const switchState = (switches) => {
    const state = switches.map((sw) => {
        let state = (0, switches_1.readSwitchState)(sw);
        return {
            ...sw,
            state,
        };
    });
    return state;
};
exports.switchState = switchState;
const signalState = (signals) => {
    const state = signals.map((signal) => {
        var _a;
        const { aspects } = signal;
        // TODO: Check pulse functionality
        const aspectCombinations = aspects.map((a) => a.pins.map((p) => [p.id, signal.pulse ? p.value.disabled : p.value.enabled, a.id]));
        const relevantPins = [
            ...new Set(aspects.map((a) => a.pins.map((p) => p.id)).flat()),
        ];
        const currentPinState = relevantPins.map((p) => {
            const { controller, pin } = (0, config_util_1.getController)(p);
            return [p, controller.getValue(pin)];
        });
        // All relevant pin states in the format of [[pin_num, pin_val, aspect_id]]
        const currentSignalState = ((_a = aspectCombinations.find((combo) => combo.every((pin) => currentPinState.some((ps) => ps[0] === pin[0] && ps[1] === pin[1])))) !== null && _a !== void 0 ? _a : [[0, 0, -1]])[0][2];
        return {
            ...signal,
            state: currentSignalState,
        };
    });
    return state;
};
exports.signalState = signalState;
