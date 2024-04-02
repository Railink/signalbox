"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = exports.router = exports.logger = exports.CLIENT_PATH = exports.CONFIG_PATH = void 0;
require("module-alias/register");
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const koa_1 = __importDefault(require("koa"));
const koa_static_1 = __importDefault(require("koa-static"));
const router_1 = __importDefault(require("@koa/router"));
const config_controller_1 = __importDefault(require("./routes/config/config.controller"));
const path_controller_1 = __importDefault(require("./routes/path/path.controller"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const state_controller_1 = __importDefault(require("./routes/state/state.controller"));
const app_1 = __importDefault(require("./config/app"));
const switches_1 = __importDefault(require("./config/switches"));
const creators_1 = require("./controllers/creators");
const signals_1 = require("./signals");
const switches_2 = require("./switches");
const state_1 = require("@common/nodes/state");
const signal_controller_1 = __importDefault(require("./routes/signal/signal.controller"));
const switch_controller_1 = __importDefault(require("./routes/switch/switch.controller"));
exports.CONFIG_PATH = path_1.default.join(__dirname, "..", "..", "..", "config");
exports.CLIENT_PATH = path_1.default.join(__dirname, "..", "..", "..", "client", "dist");
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({
            filename: "error.log",
            level: "error",
            dirname: "log",
        }),
        new winston_1.default.transports.File({ filename: "latest.log", dirname: "log" }),
        new winston_1.default.transports.Console({ format: winston_1.default.format.simple() }),
    ],
});
exports.router = new router_1.default({
    prefix: "/api",
});
exports.controllers = [];
const app = new koa_1.default();
try {
    const appConfig = js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(exports.CONFIG_PATH, "station.yaml"), "utf-8"));
    const [switchConfig, signalConfig, lightingConfig, waypointConfig] = [
        js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(exports.CONFIG_PATH, "switches.yaml"), "utf-8")),
        js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(exports.CONFIG_PATH, "signals.yaml"), "utf-8")),
        js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(exports.CONFIG_PATH, "lighting.yaml"), "utf-8")),
        js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(exports.CONFIG_PATH, "waypoints.yaml"), "utf-8")),
    ];
    (0, switches_1.default)(switchConfig);
    (0, app_1.default)(appConfig);
    appConfig.gpio.expanders.forEach((expander, i) => {
        const controllerCreator = creators_1.controllerCreators.get(expander.type);
        if (!controllerCreator)
            return;
        exports.controllers.push(controllerCreator(expander.environment));
        exports.logger.info(`Controller #${i} (${expander.type}) initialized`);
    });
    if (appConfig.name || typeof appConfig.gpio === "object") {
        app.context.appConfig = appConfig;
        app.context.stationConfig = {
            switches: switchConfig !== null && switchConfig !== void 0 ? switchConfig : [],
            signals: signalConfig !== null && signalConfig !== void 0 ? signalConfig : [],
            lighting: lightingConfig !== null && lightingConfig !== void 0 ? lightingConfig : [],
            waypoints: waypointConfig !== null && waypointConfig !== void 0 ? waypointConfig : [],
        };
        (0, signals_1.initBlinkLoop)(); // Initialize signal blink loop
        app.context.stationConfig.switches.forEach((railSwitch) => {
            exports.logger.info(`Switch ${railSwitch.id} -----\nMinus pin: #${railSwitch.minus.pin.id}\nPlus pin: #${railSwitch.plus.pin.id}`);
            (0, switches_2.setSwitch)(railSwitch, state_1.SwitchState.MINUS); // All switches to neutral state
        });
        app.context.stationConfig.signals.forEach((railSignal) => (0, signals_1.setSignal)(railSignal, railSignal.defaultAspect) // All signals to default aspects
        );
    }
}
catch (e) {
    exports.logger.error(e.message);
}
if (!app.context.appConfig) {
    exports.logger.error("Invalid application config!");
    process.exit(1);
}
(0, config_controller_1.default)(exports.router); // Register config-related routes
(0, state_controller_1.default)(exports.router); // Register node-state-related routes
(0, path_controller_1.default)(exports.router); // Register path-related routes
(0, signal_controller_1.default)(exports.router); // and so on...
(0, switch_controller_1.default)(exports.router);
app.use((0, koa_bodyparser_1.default)());
app.use((0, koa_static_1.default)(exports.CLIENT_PATH)) // Serve the dashboard
    .use(exports.router.routes()) // Register router routes
    .use(exports.router.allowedMethods());
app.listen(6969);
exports.logger.info(`Server listening on :6969`);
