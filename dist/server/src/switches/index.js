"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSwitchState = exports.setSwitch = void 0;
const state_1 = require("@common/nodes/state");
const io_1 = require("../io");
const setSwitch = (railSwitch, switchState) => {
    const minusPin = railSwitch.minus.pin;
    const plusPin = railSwitch.plus.pin;
    switch (switchState) {
        case state_1.SwitchState.PLUS: // Disable minus first, and then switch plus on
            (0, io_1.writePin)(minusPin.id, minusPin.value.disabled);
            (0, io_1.writePin)(plusPin.id, plusPin.value.enabled);
            break;
        case state_1.SwitchState.MINUS: // Disable plus first, and then switch minus on
            (0, io_1.writePin)(plusPin.id, plusPin.value.disabled);
            (0, io_1.writePin)(minusPin.id, minusPin.value.enabled);
            break;
        default: // Possibly SwitchState.UNKNOWN
            throw new Error("Invalid switch state!");
    }
};
exports.setSwitch = setSwitch;
const readSwitchState = (railSwitch) => {
    const minusPin = railSwitch.minus.pin;
    const plusPin = railSwitch.plus.pin;
    const minusState = (0, io_1.readPin)(minusPin.id);
    const plusState = (0, io_1.readPin)(plusPin.id);
    if (minusState === minusPin.value.enabled &&
        plusState === plusPin.value.disabled)
        return state_1.SwitchState.MINUS;
    else if (plusState === plusPin.value.enabled &&
        minusState === minusPin.value.disabled)
        return state_1.SwitchState.PLUS;
    else
        return state_1.SwitchState.UNKNOWN;
};
exports.readSwitchState = readSwitchState;
