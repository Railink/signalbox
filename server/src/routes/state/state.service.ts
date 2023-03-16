import { RailSignal } from "@common/nodes/signal";
import { NodeState, SwitchState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { getController } from "../../config/config.util";

export const switchState = (switches: RailSwitch[]): (RailSwitch & NodeState)[] => {
    const state: (RailSwitch & NodeState)[] = switches.map((sw) => {
        const minusPinInfo = getController(sw.minus.pin.id);
        const plusPinInfo = getController(sw.plus.pin.id);
        const minusState = minusPinInfo.controller.getValue(minusPinInfo.pin) === sw.minus.pin.value.enabled;
        const plusState = plusPinInfo.controller.getValue(plusPinInfo.pin) === sw.plus.pin.value.enabled;

        let state = minusState === plusState ? SwitchState.UNKNOWN : minusState ? SwitchState.MINUS : SwitchState.PLUS;

        return {
            ...sw,
            state
        }
    });

    return state;
}

export const signalState = (signals: RailSignal[]): (RailSignal & NodeState)[] => {
    const state: (RailSignal & NodeState)[] = signals.map((signal) => {
        return {
            ...signal,
            state: 1
        };
    });
    return state;
}