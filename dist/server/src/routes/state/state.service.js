"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalState = exports.switchState = void 0;
const state_1 = require("@common/nodes/state");
const config_util_1 = require("../../config/config.util");
const switchState = (switches) => {
    const state = switches.map((sw) => {
        const minusPinInfo = (0, config_util_1.getController)(sw.minus.pin.id);
        const plusPinInfo = (0, config_util_1.getController)(sw.plus.pin.id);
        const minusState = minusPinInfo.controller.getValue(minusPinInfo.pin) ===
            sw.minus.pin.value.enabled;
        const plusState = plusPinInfo.controller.getValue(plusPinInfo.pin) ===
            sw.plus.pin.value.enabled;
        console.log(minusPinInfo.controller);
        let state = minusState === plusState
            ? state_1.SwitchState.UNKNOWN
            : minusState
                ? state_1.SwitchState.MINUS
                : state_1.SwitchState.PLUS;
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
        const aspectCombinations = aspects.map((a) => a.pins.map((p) => [p.id, p.value.enabled, a.id]));
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
