import "module-alias/register";
import path from "path";
import winston from "winston";
import yaml, { YAMLException } from "js-yaml";
import fs from "fs";
import Koa from "koa";
import serve from "koa-static";
import Router from "@koa/router";
import configRoutes from "./routes/config/config.controller";
import pathRoutes from "./routes/path/path.controller";
import bodyParser from "koa-bodyparser";
import stateRoutes from "./routes/state/state.controller";
import { AppConfig, AppContext } from "@common/config/config";
import { Controller } from "@common/controllers/Controller";
import { LightingNode } from "@common/nodes/lighting";
import { RailSignal, StandardSignalAspect } from "@common/nodes/signal";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import verifyAppConfig from "./config/app";
import verifySwitches from "./config/switches";
import { controllerCreators } from "./controllers/creators";
import { initBlinkLoop, setSignal } from "./signals";
import { setSwitch } from "./switches";
import { SwitchState } from "@common/nodes/state";
import signalRoutes from "./routes/signal/signal.controller";
import switchRoutes from "./routes/switch/switch.controller";
import TEST001 from "./controllers/TEST001";

export const CONFIG_PATH = path.join(__dirname, "..", "..", "..", "config");
export const CLIENT_PATH = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "client",
    "dist"
);

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: "error.log",
            level: "error",
            dirname: "log",
        }),
        new winston.transports.File({ filename: "latest.log", dirname: "log" }),
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});

export const router = new Router<Koa.DefaultState, AppContext>({
    prefix: "/api",
});

export const controllers: Controller[] = [];

const app = new Koa<Koa.DefaultState, AppContext>();

try {
    const appConfig: AppConfig = yaml.load(
        fs.readFileSync(path.join(CONFIG_PATH, "station.yaml"), "utf-8")
    ) as AppConfig;

    const [switchConfig, signalConfig, lightingConfig, waypointConfig] = [
        yaml.load(
            fs.readFileSync(path.join(CONFIG_PATH, "switches.yaml"), "utf-8")
        ) as RailSwitch[],
        yaml.load(
            fs.readFileSync(path.join(CONFIG_PATH, "signals.yaml"), "utf-8")
        ) as RailSignal[],
        yaml.load(
            fs.readFileSync(path.join(CONFIG_PATH, "lighting.yaml"), "utf-8")
        ) as LightingNode[],
        yaml.load(
            fs.readFileSync(path.join(CONFIG_PATH, "waypoints.yaml"), "utf-8")
        ) as RailWaypoint[],
    ];

    verifySwitches(switchConfig);
    verifyAppConfig(appConfig);

    appConfig.gpio.expanders.forEach((expander, i) => {
        const controllerCreator = controllerCreators.get(expander.type);
        if (!controllerCreator) return;
        controllers.push(controllerCreator(expander.environment));
        logger.info(`Controller #${i} (${expander.type}) initialized`);
    });

    if (appConfig.name || typeof appConfig.gpio === "object") {
        app.context.appConfig = appConfig;
        app.context.stationConfig = {
            switches: switchConfig ?? [],
            signals: signalConfig ?? [],
            lighting: lightingConfig ?? [],
            waypoints: waypointConfig ?? [],
        };

        initBlinkLoop(); // Initialize signal blink loop

        app.context.stationConfig.switches.forEach((railSwitch) => {
            logger.info(`Switch ${railSwitch.id} -----\nMinus pin: #${railSwitch.minus.pin.id}\nPlus pin: #${railSwitch.plus.pin.id}`);
            setSwitch(railSwitch, SwitchState.MINUS) // All switches to neutral state
        });

        app.context.stationConfig.signals.forEach((railSignal) =>
            setSignal(railSignal, railSignal.defaultAspect) // All signals to default aspects
        );

    }
} catch (e: any) {
    logger.error((e as YAMLException).message);
}

if (!app.context.appConfig) {
    logger.error("Invalid application config!");
    process.exit(1);
}

configRoutes(router); // Register config-related routes
stateRoutes(router); // Register node-state-related routes
pathRoutes(router); // Register path-related routes
signalRoutes(router); // and so on...
switchRoutes(router);

app.use(bodyParser());
app.use(serve(CLIENT_PATH)) // Serve the dashboard
    .use(router.routes()) // Register router routes
    .use(router.allowedMethods());

app.listen(6969);
logger.info(`Server listening on :6969`);
