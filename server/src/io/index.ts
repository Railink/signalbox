import { getController } from "../config/config.util"

export const readPin = (pinNum: number): any => {
    const { controller, pin } = getController(pinNum);

    if (!controller || !pin) throw new Error("Invalid pin value!");

    return controller.getValue(pin);
}

export const writePin = (pinNum: number, value: any): any => {
    const { controller, pin } = getController(pinNum);

    if (!controller || !pin) throw new Error("Invalid pin value!");

    return controller.setValue(pin, value);
}
