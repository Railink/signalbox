import { SwitchState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { getController } from "../config/config.util";
import { readPin, writePin } from "../io";

export const setSwitch = (railSwitch: RailSwitch, switchState: SwitchState) => {
    const minusPin = railSwitch.minus.pin;
    const plusPin = railSwitch.plus.pin;

    switch (switchState) {
        case SwitchState.PLUS: // Disable minus first, and then switch plus on
            writePin(minusPin.id, minusPin.value.disabled);
            writePin(plusPin.id, plusPin.value.enabled);
            break;
        case SwitchState.MINUS: // Disable plus first, and then switch minus on
            writePin(plusPin.id, plusPin.value.disabled);
            writePin(minusPin.id, minusPin.value.enabled);
            break;
        default: // Possibly SwitchState.UNKNOWN
            throw new Error("Invalid switch state!");
    }
};

export const readSwitchState = (railSwitch: RailSwitch) => {
    const minusPin = railSwitch.minus.pin;
    const plusPin = railSwitch.plus.pin;

    const minusState = readPin(minusPin.id);
    const plusState = readPin(plusPin.id);

    if (minusState === plusState) return SwitchState.UNKNOWN;
    return minusState === minusPin.value.enabled
        ? SwitchState.MINUS
        : SwitchState.PLUS;
};
