import { ExpanderEnvironmentVariable } from "@common/config/config";
import { Controller } from "@common/controllers/Controller";
import { isNumber } from "util";
import { logger } from "..";

export default class TEST001 implements Controller {
    private pinCount: number;
    private pins: number[];
    private environment: Map<string, string>;

    constructor(env: ExpanderEnvironmentVariable[]) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));

        const pinCount = this.environment.get("PIN_COUNT");

        if (!pinCount || !isNumber(pinCount) || Number(pinCount) < 0)
            throw new Error("The pin count must be a positive number!");

        let i = 0;
        this.pinCount = Number(this.environment.get("PIN_COUNT"));
        this.pins = Array(this.pinCount).fill(0, 0, this.pinCount);
    }

    setValue(pin: number, value: any): void {
        if (pin < 0 || pin >= this.pinCount) throw new Error("Invalid pin!");

        if (!isNumber(+value)) throw new Error("Invalid value!");

        logger.info(`Setting pin ${pin} on controller to ${value}`);
        this.pins[pin] = value as number;
    }

    getValue(pin: number): number {
        if (pin < 0 || pin >= this.pinCount) throw new Error("Invalid pin!");
        return this.pins[pin];
    }

    size(): number {
        return this.pinCount;
    }
}
