import { ExpanderEnvironmentVariable } from "@common/config/config";
import { Controller } from "@common/controllers/Controller";
import { isNumber } from "util";
import { logger } from "..";
import { Gpio } from "onoff";

export default class RLSR74HC595 implements Controller {
    private pinCount: number;
    private pins: number[];
    private environment: Map<string, string>;
    private lowTrigger: boolean;

    private latchClock: Gpio;
    private shiftClock: Gpio;
    private dataPin: Gpio;

    constructor(env: ExpanderEnvironmentVariable[]) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));

        const pinCount = this.environment.get("PIN_COUNT");

        const latchClock = this.environment.get("LATCH_CLOCK");
        const shiftClock = this.environment.get("SHIFT_CLOCK");
        const dataPin = this.environment.get("DATA_PIN");

        if (!pinCount || !isNumber(pinCount) || Number(pinCount) < 0)
            throw new Error("The pin count must be a positive number!");

        if (!latchClock || !isNumber(latchClock) || Number(latchClock) < 0)
            throw new Error("The latch clock must be a positive number!");

        if (!shiftClock || !isNumber(shiftClock) || Number(shiftClock) < 0)
            throw new Error("The shift clock must be a positive number!");

        if (!dataPin || !isNumber(dataPin) || Number(dataPin) < 0)
            throw new Error("The data pin must be a positive number!");

        if (pinCount % 16 != 0)
            throw new Error("The pin count must be a multiple of 16");

        this.pinCount = Number(this.environment.get("PIN_COUNT"));
        this.lowTrigger = Boolean(this.environment.get("LOW_TRIGGER")) || false;
        this.latchClock = new Gpio(
            Number(this.environment.get("LATCH_CLOCK")),
            "out"
        );
        this.shiftClock = new Gpio(
            Number(this.environment.get("SHIFT_CLOCK")),
            "out"
        );
        this.dataPin = new Gpio(
            Number(this.environment.get("DATA_PIN")),
            "low"
        );
        this.pins = Array(this.pinCount).fill(0, 0, this.pinCount);

        this.pins.forEach((p, i) => this.setValue(i, 0));
    }

    setValue(pin: number, value: any): void {
        if (pin < 0 || pin >= this.pinCount)
            throw new Error(`Invalid pin! ${pin}`);
        if (value !== 0 && value !== 1)
            throw new Error(`Invalid value! ${value}`);

        logger.info(`Setting pin ${pin} on controller to ${value}`);
        this.pins[pin] = value as number;

        for (let i = this.pinCount - 1; i >= 0; i--) {
            this.dataPin.writeSync(
                this.lowTrigger
                    ? this.pins[i] == 0 // replace 0 with 1 if lowTrigger (active on 0)
                        ? 1
                        : (0 as 0 | 1)
                    : (this.pins[i] as 0 | 1)
            ); // Write data\

            // Shift data
            this.shiftClock.writeSync(0);
            this.shiftClock.writeSync(1);
        }

        // Latch data
        this.latchClock.writeSync(1);
        this.latchClock.writeSync(0);
    }

    getValue(pin: number): number {
        if (pin < 0 || pin >= this.pinCount) throw new Error("Invalid pin!");
        return this.pins[pin];
    }

    size(): number {
        return this.pinCount;
    }
}
