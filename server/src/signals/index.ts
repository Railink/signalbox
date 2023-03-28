import { RailSignal, SignalAspect } from "@common/nodes/signal";
import { getController } from "../config/config.util";

export const setSignal = (signal: RailSignal, aspectId: number) => {
    const aspectToSet = signal.aspects.find(a => a.id === aspectId);

    if (!aspectToSet) throw new Error("Invalid aspect ID!");

    signal.aspects.forEach(aspect => {
        aspect.pins.forEach(pinSignal => {
            const { controller, pin } = getController(pinSignal.id);
            controller.setValue(pin, pinSignal.value.disabled);
        });
    });

    aspectToSet.pins.forEach(pinSignal => {
        const { controller, pin } = getController(pinSignal.id);
        controller.setValue(pin, pinSignal.value.enabled);
    });
}
