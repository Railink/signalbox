import { ExpanderEnvironmentVariable } from "@common/config/config";
import { Controller } from "@common/controllers/Controller";
import i2c from "i2c-bus";

class MCP23017 implements Controller {
    static MCP23017_IODIRA = 0x00;
    static MCP23017_IPOLA = 0x02;
    static MCP23017_GPINTENA = 0x04;
    static MCP23017_DEFVALA = 0x06;
    static MCP23017_INTCONA = 0x08;
    static MCP23017_IOCONA = 0x0a;
    static MCP23017_GPPUA = 0x0c;
    static MCP23017_INTFA = 0x0e;
    static MCP23017_INTCAPA = 0x10;
    static MCP23017_GPIOA = 0x12;
    static MCP23017_OLATA = 0x14;

    static MCP23017_IODIRB = 0x01;
    static MCP23017_IPOLB = 0x03;
    static MCP23017_GPINTENB = 0x05;
    static MCP23017_DEFVALB = 0x07;
    static MCP23017_INTCONB = 0x09;
    static MCP23017_IOCONB = 0x0b;
    static MCP23017_GPPUB = 0x0d;
    static MCP23017_INTFB = 0x0f;
    static MCP23017_INTCAPB = 0x11;
    static MCP23017_GPIOB = 0x13;
    static MCP23017_OLATB = 0x15;

    private environment: Map<string, string>;
    private bus: i2c.I2CBus;

    private smbus: number;
    private address: number;

    private GPIOA_value: number;
    private GPIOB_value: number;

    constructor(env: ExpanderEnvironmentVariable[]) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));
        // TODO: add config checks

        this.smbus = Number(this.environment.get("SMBUS"));
        this.address = Number(this.environment.get("ADDRESS"));

        this.bus = i2c.openSync(this.smbus);

        this.bus.writeByteSync(
            this.address,
            MCP23017.MCP23017_IODIRA,
            Number(this.environment.get("GPIOA_MODE"))
        );
        this.bus.writeByteSync(
            this.address,
            MCP23017.MCP23017_IODIRB,
            Number(this.environment.get("GPIOB_MODE"))
        );

        this.GPIOA_value = this.bus.readByteSync(
            this.address,
            MCP23017.MCP23017_GPIOA
        );
        this.GPIOB_value = this.bus.readByteSync(
            this.address,
            MCP23017.MCP23017_GPIOB
        );

        this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOA, 0xff);
        this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOB, 0xff);
    }

    updateByte(byte: number, bit: number, value: number) {
        if (value === 0) return byte & ~(1 << bit);
        else if (value === 1) return byte | (1 << bit);
        else return 0x00;
    }

    checkBit(byte: number, bit: number) {
        return byte & (1 << bit) ? 1 : 0;
    }

    toggle(pin: number) {
        if (this.getValue(pin) == 1) {
            this.setValue(pin, 0);
        } else {
            this.setValue(pin, 1);
        }
    }

    writeSide(side: number, value: any) {
        if (side == MCP23017.MCP23017_GPIOA) {
            this.GPIOA_value = value;
            this.bus.writeByteSync(
                this.address,
                MCP23017.MCP23017_GPIOA,
                this.GPIOA_value
            );
        } else if (side == MCP23017.MCP23017_GPIOB) {
            this.GPIOB_value = value;
            this.bus.writeByteSync(
                this.address,
                MCP23017.MCP23017_GPIOB,
                this.GPIOB_value
            );
        }
    }

    setValue(pin: number, value: any): void {
        if (pin < 8) {
            this.GPIOA_value = this.updateByte(this.GPIOA_value, pin, value);
            this.bus.writeByteSync(
                this.address,
                MCP23017.MCP23017_GPIOA,
                this.GPIOA_value
            );
        } else {
            pin = pin - 8;
            this.GPIOB_value = this.updateByte(this.GPIOB_value, pin, value);
            this.bus.writeByteSync(
                this.address,
                MCP23017.MCP23017_GPIOB,
                this.GPIOB_value
            );
        }
    }
    getValue(pin: number) {
        if (pin < 8) {
            this.GPIOA_value = this.bus.readByteSync(
                this.address,
                MCP23017.MCP23017_GPIOA
            );
            return this.checkBit(this.GPIOA_value, pin);
        } else {
            pin = pin - 8;
            this.GPIOB_value = this.bus.readByteSync(
                this.address,
                MCP23017.MCP23017_GPIOB
            );
            return this.checkBit(this.GPIOB_value, pin);
        }
    }

    size(): number {
        return 16;
    }
}

export default MCP23017;
