"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const __1 = require("..");
const onoff_1 = require("onoff");
class RLSR74HC595 {
    constructor(env) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));
        const pinCount = this.environment.get("PIN_COUNT");
        const latchClock = this.environment.get("LATCH_CLOCK");
        const shiftClock = this.environment.get("SHIFT_CLOCK");
        const dataPin = this.environment.get("DATA_PIN");
        if (!pinCount || !(0, util_1.isNumber)(pinCount) || Number(pinCount) < 0)
            throw new Error("The pin count must be a positive number!");
        if (!latchClock || !(0, util_1.isNumber)(latchClock) || Number(latchClock) < 0)
            throw new Error("The latch clock must be a positive number!");
        if (!shiftClock || !(0, util_1.isNumber)(shiftClock) || Number(shiftClock) < 0)
            throw new Error("The shift clock must be a positive number!");
        if (!dataPin || !(0, util_1.isNumber)(dataPin) || Number(dataPin) < 0)
            throw new Error("The data pin must be a positive number!");
        if (pinCount % 16 != 0)
            throw new Error("The pin count must be a multiple of 16");
        this.pinCount = Number(this.environment.get("PIN_COUNT"));
        this.latchClock = new onoff_1.Gpio(Number(this.environment.get("LATCH_CLOCK")), "out");
        this.shiftClock = new onoff_1.Gpio(Number(this.environment.get("SHIFT_CLOCK")), "out");
        this.dataPin = new onoff_1.Gpio(Number(this.environment.get("DATA_PIN")), "low");
        this.pins = Array(this.pinCount).fill(0, 0, this.pinCount);
        this.pins.forEach((p, i) => this.setValue(i, 0));
    }
    setValue(pin, value) {
        if (pin < 0 || pin >= this.pinCount)
            throw new Error(`Invalid pin! ${pin}`);
        if (value !== 0 && value !== 1)
            throw new Error(`Invalid value! ${value}`);
        __1.logger.info(`Setting pin ${pin} on controller to ${value}`);
        this.pins[pin] = value;
        for (let i = this.pinCount - 1; i >= 0; i--) {
            this.dataPin.writeSync(this.pins[i]); // Write data\
            // Shift data
            this.shiftClock.writeSync(0);
            this.shiftClock.writeSync(1);
        }
        // Latch data
        this.latchClock.writeSync(1);
        this.latchClock.writeSync(0);
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
exports.default = RLSR74HC595;
