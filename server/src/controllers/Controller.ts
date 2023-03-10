import { ExpanderEnvironmentVariable } from "@railink/signalbox";
import TEST001 from "./TEST001";

type ControllerCreator = (env: ExpanderEnvironmentVariable[]) => Controller;

export interface Controller {
    setValue(pin: number, value: any): void;
    getValue(pin: number): number;
    size(): number;
}

export const controllers = new Map<string, ControllerCreator>([
    ["TEST001", (env) => new TEST001(env)]
]);
