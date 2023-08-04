"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowSignal = void 0;
const signal_1 = require("@common/nodes/signal");
const __1 = require("../..");
const path_1 = require("../../path");
const signals_1 = require("../../signals");
const allowSignal = (stationConfig, signal, target, aspect = -1, force = false, time) => {
    if (aspect === signal_1.StandardSignalAspect.STOP || force) {
        (0, signals_1.setSignal)(signal, aspect, time);
        return;
    }
    const pathState = (0, path_1.checkPathSate)(signal.switchFront.toString(), target, stationConfig);
    try {
        switch (pathState) {
            case path_1.PathState.SAFE:
                if (aspect == -1)
                    (0, signals_1.setSignal)(signal, signal_1.StandardSignalAspect.ALLOW, time);
                else
                    (0, signals_1.setSignal)(signal, aspect, time);
                break;
            case path_1.PathState.SAFE_CAUTION:
                if (aspect == -1)
                    (0, signals_1.setSignal)(signal, signal_1.StandardSignalAspect.ALLOW_CAUTION, time);
                else
                    (0, signals_1.setSignal)(signal, aspect, time);
                break;
            case path_1.PathState.UNSAFE:
                (0, signals_1.setSignal)(signal, signal_1.StandardSignalAspect.STOP, time);
                break;
        }
    }
    catch (e) {
        __1.logger.error(e.message);
    }
    return "OK!";
};
exports.allowSignal = allowSignal;
