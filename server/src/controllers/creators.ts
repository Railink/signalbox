import { ControllerCreator } from "@common/controllers/Controller";
import TEST001 from "./TEST001";
import RLSR74HC595 from "./RLSR74HC595";
import MCP23017 from "./MCP23017";

export const controllerCreators = new Map<string, ControllerCreator>([
    ["TEST001", (env) => new TEST001(env)],
    ["RLSR74HC595", (env) => new RLSR74HC595(env)],
    ["MCP23017", (env) => new MCP23017(env)]
]);
