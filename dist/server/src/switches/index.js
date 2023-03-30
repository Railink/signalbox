"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSwitch = void 0;
const state_1 = require("@common/nodes/state");
const config_util_1 = require("../config/config.util");
const setSwitch = (railSwitch, switchState) => {
    let controllerConfig = null;
    switch (switchState) {
        case state_1.SwitchState.PLUS:
            controllerConfig = (0, config_util_1.getController)(railSwitch.minus.pin.id);
            controllerConfig.controller.setValue(controllerConfig.pin, railSwitch.minus.pin.value.disabled);
            controllerConfig = (0, config_util_1.getController)(railSwitch.plus.pin.id);
            controllerConfig.controller.setValue(controllerConfig.pin, railSwitch.plus.pin.value.enabled);
            break;
        case state_1.SwitchState.MINUS:
            controllerConfig = (0, config_util_1.getController)(railSwitch.plus.pin.id);
            controllerConfig.controller.setValue(controllerConfig.pin, railSwitch.plus.pin.value.disabled);
            controllerConfig = (0, config_util_1.getController)(railSwitch.minus.pin.id);
            controllerConfig.controller.setValue(controllerConfig.pin, railSwitch.minus.pin.value.enabled);
            break;
        default:
            throw new Error("Invalid switch state!");
    }
};
exports.setSwitch = setSwitch;
