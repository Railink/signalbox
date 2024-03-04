import { StationConfig } from "@common/config/config";
import { RailSignal, StandardSignalAspect } from "@common/nodes/signal";
import { writePin } from "../io";
import { log } from "console";
import { setInterval } from "timers";
import { PinSignal } from "@common/data/pin";

let blinkingPins: PinSignal[] = [];

export const initBlinkLoop = (): NodeJS.Timer => {
    let loopNum = 0;
    return setInterval(() => {
        switch (loopNum % 1) {
            case 0:
                blinkingPins.forEach((pin) =>
                    writePin(pin.id, pin.value.disabled)
                );
                loopNum++;
                break;
            case 1:
                blinkingPins.forEach((pin) =>
                    writePin(pin.id, pin.value.enabled)
                );
                loopNum = 0;
                break;
        }
    }, 1000);
};

export const setSignal = (
    signal: RailSignal,
    aspectId: number,
    time?: number
): void => {
    const aspectToSet = signal.aspects.find((a) => a.id === aspectId);
    log(aspectId, aspectToSet);
    if (!aspectToSet) throw new Error(`Invalid aspect ID! ${aspectId}`);

    // `for` instead of `forEach` for better performance
    // Iterate over all aspects
    for (let i = 0; i < signal.aspects.length; i++) {
        if (i === aspectId) continue; // Skip the new aspect
        for (let j = 0; j < signal.aspects[i].pins.length; j++) {
            // Iterate over pins of aspects to disable
            const pinSignal = signal.aspects[i].pins[j];
            blinkingPins = blinkingPins.filter((pin) => pin.id !== pinSignal.id);
            writePin(pinSignal.id, pinSignal.value.disabled);
        }
    }

    aspectToSet.pins.forEach((pinSignal) => {
        if (!pinSignal.blinking) {
            writePin(pinSignal.id, pinSignal.value.enabled);
        } else {
            blinkingPins.push(pinSignal);
        }
    });

    if (time && time > 0) {
        setTimeout(() => setSignal(signal, signal.defaultAspect), time * 1000);
    }
};

export const getRailSignal = (
    stationConfig: StationConfig,
    id: number | string
): RailSignal | undefined => {
    const idNum = Number(id);
    return stationConfig.signals.find((s) => s.id === idNum);
};
