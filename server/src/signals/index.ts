import { StationConfig } from "@common/config/config";
import { RailSignal, StandardSignalAspect } from "@common/nodes/signal";
import { getController } from "../config/config.util";

export const setSignal = (
    signal: RailSignal,
    aspectId: number,
    time?: number
) => {
    const aspectToSet = signal.aspects.find((a) => a.id === aspectId);

    if (!aspectToSet) throw new Error("Invalid aspect ID!");

    signal.aspects.forEach((aspect) => {
        aspect.pins.forEach((pinSignal) => {
            const { controller, pin } = getController(pinSignal.id);
            controller.setValue(pin, pinSignal.value.disabled);
        });
    });

    aspectToSet.pins.forEach((pinSignal) => {
        const { controller, pin } = getController(pinSignal.id);
        controller.setValue(pin, pinSignal.value.enabled);
    });

    if (time && time > 0) {
        setTimeout(
            () => setSignal(signal, StandardSignalAspect.STOP),
            time * 1000
        );
    }
};

export const getRailSignal = (
    stationConfig: StationConfig,
    id: number | string
) => {
    const idNum = Number(id);
    return stationConfig.signals.find((s) => s.id === idNum);
};
