"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowSignal = exports.StandardSignalAspect = void 0;
const __1 = require("../..");
const path_1 = require("../../path");
const signals_1 = require("../../signals");
var StandardSignalAspect;
(function (StandardSignalAspect) {
    StandardSignalAspect[StandardSignalAspect["STOP"] = 0] = "STOP";
    StandardSignalAspect[StandardSignalAspect["ALLOW"] = 1] = "ALLOW";
    StandardSignalAspect[StandardSignalAspect["ALLOW_CAUTION"] = 2] = "ALLOW_CAUTION";
    StandardSignalAspect[StandardSignalAspect["NEXT_STOP"] = 3] = "NEXT_STOP";
})(StandardSignalAspect = exports.StandardSignalAspect || (exports.StandardSignalAspect = {}));
const allowSignal = (stationConfig, signal, target, aspect = -1) => {
    if (aspect === StandardSignalAspect.STOP) {
        (0, signals_1.setSignal)(signal, aspect);
        return;
    }
    const pathState = (0, path_1.checkPathSate)(signal.switchFront.toString(), target, stationConfig);
    try {
        switch (pathState) {
            case path_1.PathState.SAFE:
                if (aspect === -1)
                    (0, signals_1.setSignal)(signal, StandardSignalAspect.ALLOW);
                else
                    (0, signals_1.setSignal)(signal, aspect);
                break;
            case path_1.PathState.SAFE_CAUTION:
                if (aspect === -1)
                    (0, signals_1.setSignal)(signal, StandardSignalAspect.ALLOW_CAUTION);
                else
                    (0, signals_1.setSignal)(signal, aspect);
                break;
            case path_1.PathState.UNSAFE:
                (0, signals_1.setSignal)(signal, StandardSignalAspect.STOP);
                break;
        }
    }
    catch (e) {
        __1.logger.error(e.message);
    }
    return "OK!";
};
exports.allowSignal = allowSignal;
