"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRailSignal = exports.setSignal = void 0;
const signal_1 = require("@common/nodes/signal");
const config_util_1 = require("../config/config.util");
const setSignal = (signal, aspectId, time) => {
    const aspectToSet = signal.aspects.find((a) => a.id === aspectId);
    if (!aspectToSet)
        throw new Error("Invalid aspect ID!");
    signal.aspects.forEach((aspect) => {
        aspect.pins.forEach((pinSignal) => {
            const { controller, pin } = (0, config_util_1.getController)(pinSignal.id);
            controller.setValue(pin, pinSignal.value.disabled);
        });
    });
    aspectToSet.pins.forEach((pinSignal) => {
        const { controller, pin } = (0, config_util_1.getController)(pinSignal.id);
        controller.setValue(pin, pinSignal.value.enabled);
    });
    if (time && time > 0) {
        setTimeout(() => (0, exports.setSignal)(signal, signal_1.StandardSignalAspect.STOP), time * 1000);
    }
};
exports.setSignal = setSignal;
const getRailSignal = (stationConfig, id) => {
    const idNum = Number(id);
    return stationConfig.signals.find((s) => s.id === idNum);
};
exports.getRailSignal = getRailSignal;
