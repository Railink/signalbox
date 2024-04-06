"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRailSignal = exports.setSignal = exports.initBlinkLoop = void 0;
const io_1 = require("../io");
const timers_1 = require("timers");
let blinkingPins = [];
const initBlinkLoop = () => {
    let loopNum = 0;
    return (0, timers_1.setInterval)(() => {
        switch (loopNum % 2) {
            case 0:
                blinkingPins.forEach((pin) => (0, io_1.writePin)(pin.id, pin.value.disabled));
                loopNum++;
                break;
            case 1:
                blinkingPins.forEach((pin) => (0, io_1.writePin)(pin.id, pin.value.enabled));
                loopNum = 0;
                break;
        }
    }, 1000);
};
exports.initBlinkLoop = initBlinkLoop;
const setSignal = (signal, aspectId, time) => {
    const aspectToSet = signal.aspects.find((a) => a.id === aspectId);
    if (!aspectToSet)
        throw new Error(`Invalid aspect ID! ${aspectId}`);
    // `for` instead of `forEach` for better performance
    // Iterate over all aspects
    for (let i = 0; i < signal.aspects.length; i++) {
        if (i === aspectId)
            continue; // Skip the new aspect
        for (let j = 0; j < signal.aspects[i].pins.length; j++) {
            // Iterate over pins of aspects to disable
            const pinSignal = signal.aspects[i].pins[j];
            blinkingPins = blinkingPins.filter((pin) => pin.id !== pinSignal.id);
            (0, io_1.writePin)(pinSignal.id, pinSignal.value.disabled);
        }
    }
    aspectToSet.pins.forEach((pinSignal) => {
        if (!pinSignal.blinking) {
            (0, io_1.writePin)(pinSignal.id, pinSignal.value.enabled);
        }
        else {
            blinkingPins.push(pinSignal);
        }
        if (signal.pulse) {
            setTimeout(() => {
                aspectToSet.pins.forEach((pinSignal) => {
                    (0, io_1.writePin)(pinSignal.id, pinSignal.value.disabled);
                });
            }, 1000);
        }
    });
    if (time && time > 0) {
        setTimeout(() => (0, exports.setSignal)(signal, signal.defaultAspect), time * 1000);
    }
};
exports.setSignal = setSignal;
const getRailSignal = (stationConfig, id) => {
    const idNum = Number(id);
    return stationConfig.signals.find((s) => s.id === idNum);
};
exports.getRailSignal = getRailSignal;
