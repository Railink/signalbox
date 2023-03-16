"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const creators_1 = require("../controllers/creators");
function verifyAppConfig(appConfig) {
    if (!(0, util_1.isNumber)(appConfig.version) || appConfig.version < 0)
        throw new Error(`Invalid app config version! ${appConfig.version}`);
    appConfig.gpio.expanders.forEach((expander) => {
        if (!creators_1.controllerCreators.has(expander.type))
            throw new Error(`Invalid controller type! ${expander.type}`);
        if (expander.pins.length > expander.size)
            throw new Error(`Pin count invalid! (${expander.pins.length} > ${expander.size})`);
    });
}
exports.default = verifyAppConfig;
