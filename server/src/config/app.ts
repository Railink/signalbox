import { AppConfig } from "@railink/signalbox";
import { isNumber } from "util";
import { controllers } from "../controllers/Controller";

export default function verifyAppConfig(appConfig: AppConfig) {
    if (!isNumber(appConfig.version) || appConfig.version < 0)
        throw new Error(`Invalid app config version! ${appConfig.version}`);

    appConfig.gpio.expanders.forEach((expander) => {
        if (!controllers.has(expander.type))
            throw new Error(`Invalid controller type! ${expander.type}`);

        if (expander.pins.length > expander.size)
            throw new Error(
                `Pin count invalid! (${expander.pins.length} > ${expander.size})`
            );
    });
}
