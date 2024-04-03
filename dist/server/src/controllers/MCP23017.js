"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i2c_bus_1 = __importDefault(require("i2c-bus"));
class MCP23017 {
    constructor(env) {
        this.environment = new Map(env.map((e) => [e.name, e.value]));
        // TODO: add config checks
        this.smbus = Number(this.environment.get("SMBUS"));
        this.address = Number(this.environment.get("ADDRESS"));
        this.bus = i2c_bus_1.default.openSync(this.smbus);
        this.bus.writeByteSync(this.address, MCP23017.MCP23017_IODIRA, Number(this.environment.get("GPIOA_MODE")));
        this.bus.writeByteSync(this.address, MCP23017.MCP23017_IODIRB, Number(this.environment.get("GPIOB_MODE")));
        this.GPIOA_value = this.bus.readByteSync(this.address, MCP23017.MCP23017_GPIOA);
        this.GPIOB_value = this.bus.readByteSync(this.address, MCP23017.MCP23017_GPIOB);
        this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOA, 0xff);
        this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOB, 0xff);
    }
    updateByte(byte, bit, value) {
        if (value === 0)
            return byte & ~(1 << bit);
        else if (value === 1)
            return byte | (1 << bit);
        else
            return 0x00;
    }
    checkBit(byte, bit) {
        return byte & (1 << bit) ? 1 : 0;
    }
    toggle(pin) {
        if (this.getValue(pin) == 1) {
            this.setValue(pin, 0);
        }
        else {
            this.setValue(pin, 1);
        }
    }
    writeSide(side, value) {
        if (side == MCP23017.MCP23017_GPIOA) {
            this.GPIOA_value = value;
            this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOA, this.GPIOA_value);
        }
        else if (side == MCP23017.MCP23017_GPIOB) {
            this.GPIOB_value = value;
            this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOB, this.GPIOB_value);
        }
    }
    setValue(pin, value) {
        if (pin < 8) {
            this.GPIOA_value = this.updateByte(this.GPIOA_value, pin, value);
            this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOA, this.GPIOA_value);
        }
        else {
            pin = pin - 8;
            this.GPIOB_value = this.updateByte(this.GPIOB_value, pin, value);
            this.bus.writeByteSync(this.address, MCP23017.MCP23017_GPIOB, this.GPIOB_value);
        }
    }
    getValue(pin) {
        if (pin < 8) {
            this.GPIOA_value = this.bus.readByteSync(this.address, MCP23017.MCP23017_GPIOA);
            return this.checkBit(this.GPIOA_value, pin);
        }
        else {
            pin = pin - 8;
            this.GPIOB_value = this.bus.readByteSync(this.address, MCP23017.MCP23017_GPIOB);
            return this.checkBit(this.GPIOB_value, pin);
        }
    }
    size() {
        return 16;
    }
}
MCP23017.MCP23017_IODIRA = 0x00;
MCP23017.MCP23017_IPOLA = 0x02;
MCP23017.MCP23017_GPINTENA = 0x04;
MCP23017.MCP23017_DEFVALA = 0x06;
MCP23017.MCP23017_INTCONA = 0x08;
MCP23017.MCP23017_IOCONA = 0x0a;
MCP23017.MCP23017_GPPUA = 0x0c;
MCP23017.MCP23017_INTFA = 0x0e;
MCP23017.MCP23017_INTCAPA = 0x10;
MCP23017.MCP23017_GPIOA = 0x12;
MCP23017.MCP23017_OLATA = 0x14;
MCP23017.MCP23017_IODIRB = 0x01;
MCP23017.MCP23017_IPOLB = 0x03;
MCP23017.MCP23017_GPINTENB = 0x05;
MCP23017.MCP23017_DEFVALB = 0x07;
MCP23017.MCP23017_INTCONB = 0x09;
MCP23017.MCP23017_IOCONB = 0x0b;
MCP23017.MCP23017_GPPUB = 0x0d;
MCP23017.MCP23017_INTFB = 0x0f;
MCP23017.MCP23017_INTCAPB = 0x11;
MCP23017.MCP23017_GPIOB = 0x13;
MCP23017.MCP23017_OLATB = 0x15;
exports.default = MCP23017;
