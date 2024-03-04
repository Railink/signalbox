"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardSignalAspect = void 0;
var StandardSignalAspect;
(function (StandardSignalAspect) {
    StandardSignalAspect[StandardSignalAspect["STOP"] = 0] = "STOP";
    StandardSignalAspect[StandardSignalAspect["ALLOW"] = 1] = "ALLOW";
    StandardSignalAspect[StandardSignalAspect["ALLOW_CAUTION"] = 2] = "ALLOW_CAUTION";
    StandardSignalAspect[StandardSignalAspect["NEXT_STOP"] = 3] = "NEXT_STOP";
    StandardSignalAspect[StandardSignalAspect["SWITCHING_DENY"] = 4] = "SWITCHING_DENY";
    StandardSignalAspect[StandardSignalAspect["SWITCHING_ALLOW"] = 5] = "SWITCHING_ALLOW";
})(StandardSignalAspect = exports.StandardSignalAspect || (exports.StandardSignalAspect = {}));
