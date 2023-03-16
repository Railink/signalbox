import { ExpanderEnvironmentVariable } from "../config/config";

export type ControllerCreator = (env: ExpanderEnvironmentVariable[]) => Controller;

export interface Controller {
    setValue(pin: number, value: any): void;
    getValue(pin: number): any;
    size(): number;
}
