"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writePin = exports.readPin = void 0;
const config_util_1 = require("../config/config.util");
const readPin = (pinNum) => {
    const { controller, pin } = (0, config_util_1.getController)(pinNum);
    if (!controller || !pin)
        throw new Error("Invalid pin value!");
    return controller.getValue(pin);
};
exports.readPin = readPin;
const writePin = (pinNum, value) => {
    const { controller, pin } = (0, config_util_1.getController)(pinNum);
    if (!controller || !pin)
        throw new Error("Invalid pin value!");
    return controller.setValue(pin, value);
};
exports.writePin = writePin;
