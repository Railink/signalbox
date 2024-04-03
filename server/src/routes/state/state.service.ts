import { RailSignal } from "@common/nodes/signal";
import { NodeState, SwitchState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { getController } from "../../config/config.util";
import { readSwitchState } from "../../switches";

export const switchState = (
    switches: RailSwitch[]
): (RailSwitch & NodeState)[] => {
    const state: (RailSwitch & NodeState)[] = switches.map((sw) => {
        let state = readSwitchState(sw);

        return {
            ...sw,
            state,
        };
    });

    return state;
};

export const signalState = (
    signals: RailSignal[]
): (RailSignal & NodeState)[] => {
    const state: (RailSignal & NodeState)[] = signals.map((signal) => {
        const { aspects } = signal;

        // TODO: Check pulse functionality
        const aspectCombinations = aspects.map((a) =>
            a.pins.map((p) => [p.id, signal.pulse ? p.value.disabled : p.value.enabled, a.id])
        );
        const relevantPins = [
            ...new Set(aspects.map((a) => a.pins.map((p) => p.id)).flat()),
        ];
        const currentPinState: (number | string)[][] = relevantPins.map((p) => {
            const { controller, pin } = getController(p);
            return [p, controller.getValue(pin)];
        });

        // All relevant pin states in the format of [[pin_num, pin_val, aspect_id]]
        const currentSignalState = (aspectCombinations.find((combo) =>
            combo.every((pin) =>
                currentPinState.some(
                    (ps) => ps[0] === pin[0] && ps[1] === pin[1]
                )
            )
        ) ?? [[0, 0, -1]])[0][2];

        return {
            ...signal,
            state: currentSignalState as number,
        };
    });
    return state;
};
