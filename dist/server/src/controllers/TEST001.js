"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const __1 = require("..");
class TEST001 {
    constructor(env) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));
        const pinCount = this.environment.get("PIN_COUNT");
        if (!pinCount || !(0, util_1.isNumber)(pinCount) || Number(pinCount) < 0)
            throw new Error("The pin count must be a positive number!");
        let i = 0;
        this.pinCount = Number(this.environment.get("PIN_COUNT"));
        this.pins = Array(this.pinCount).fill(0, 0, this.pinCount);
    }
    setValue(pin, value) {
        if (pin < 0 || pin >= this.pinCount)
            throw new Error("Invalid pin!");
        if (!(0, util_1.isNumber)(+value))
            throw new Error("Invalid value!");
        __1.logger.info(`Setting pin ${pin} on controller to ${value}`);
        this.pins[pin] = value;
    }
    getValue(pin) {
        if (pin < 0 || pin >= this.pinCount)
            throw new Error("Invalid pin!");
        return this.pins[pin];
    }
    size() {
        return this.pinCount;
    }
}
exports.default = TEST001;
