"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSignal = void 0;
const config_util_1 = require("../config/config.util");
const setSignal = (signal, aspectId) => {
    const aspectToSet = signal.aspects.find(a => a.id === aspectId);
    if (!aspectToSet)
        throw new Error("Invalid aspect ID!");
    signal.aspects.forEach(aspect => {
        aspect.pins.forEach(pinSignal => {
            const { controller, pin } = (0, config_util_1.getController)(pinSignal.id);
            controller.setValue(pin, pinSignal.value.disabled);
        });
    });
    aspectToSet.pins.forEach(pinSignal => {
        const { controller, pin } = (0, config_util_1.getController)(pinSignal.id);
        controller.setValue(pin, pinSignal.value.enabled);
    });
};
exports.setSignal = setSignal;
