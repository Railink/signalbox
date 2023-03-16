import { ControllerCreator } from "@common/controllers/Controller";
import TEST001 from "./TEST001";

export const controllerCreators = new Map<string, ControllerCreator>([
    ["TEST001", (env) => new TEST001(env)]
]);
