"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerCreators = void 0;
const TEST001_1 = __importDefault(require("./TEST001"));
const RLSR74HC595_1 = __importDefault(require("./RLSR74HC595"));
exports.controllerCreators = new Map([
    ["TEST001", (env) => new TEST001_1.default(env)],
    ["RLSR74HC595", (env) => new RLSR74HC595_1.default(env)]
]);
