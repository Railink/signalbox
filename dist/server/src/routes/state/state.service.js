"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalState = exports.switchState = void 0;
const state_1 = require("@common/nodes/state");
const config_util_1 = require("../../config/config.util");
const switchState = (switches) => {
    const state = switches.map((sw) => {
        const minusPinInfo = (0, config_util_1.getController)(sw.minus.pin.id);
        const plusPinInfo = (0, config_util_1.getController)(sw.plus.pin.id);
        const minusState = minusPinInfo.controller.getValue(minusPinInfo.pin) === sw.minus.pin.value.enabled;
        const plusState = plusPinInfo.controller.getValue(plusPinInfo.pin) === sw.plus.pin.value.enabled;
        let state = minusState === plusState ? state_1.SwitchState.UNKNOWN : minusState ? state_1.SwitchState.MINUS : state_1.SwitchState.PLUS;
        return {
            ...sw,
            state
        };
    });
    return state;
};
exports.switchState = switchState;
const signalState = (signals) => {
    const state = signals.map((signal) => {
        return {
            ...signal,
            state: 1
        };
    });
    return state;
};
exports.signalState = signalState;
