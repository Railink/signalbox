import { isNumber } from "util";
import { getController } from "../config/config.util"

export const readPin = (pinNum: number): any => {
    const { controller, pin } = getController(pinNum);
    if (!controller || !isNumber(pin)) throw new Error(`Invalid pin value! ${pin}`);
    return controller.getValue(pin);
}

export const writePin = (pinNum: number, value: any): any => {
    const { controller, pin } = getController(pinNum);
    if (!controller || !isNumber(pin)) throw new Error(`Invalid pin value! ${pin}`);
    return controller.setValue(pin, value);
}
