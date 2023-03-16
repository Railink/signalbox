"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchState = exports.PinState = void 0;
var PinState;
(function (PinState) {
    PinState[PinState["LOW"] = 0] = "LOW";
    PinState[PinState["HIGH"] = 1] = "HIGH";
    PinState[PinState["UNKNOWN"] = 2] = "UNKNOWN";
})(PinState = exports.PinState || (exports.PinState = {}));
var SwitchState;
(function (SwitchState) {
    SwitchState[SwitchState["MINUS"] = 0] = "MINUS";
    SwitchState[SwitchState["PLUS"] = 1] = "PLUS";
    SwitchState[SwitchState["UNKNOWN"] = 2] = "UNKNOWN";
})(SwitchState = exports.SwitchState || (exports.SwitchState = {}));
