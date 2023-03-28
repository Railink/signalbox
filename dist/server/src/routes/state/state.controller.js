"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_service_1 = require("./state.service");
const path_service_1 = require("../path/path.service");
const stateRoutes = (router) => {
    router.get("/state/switches", (ctx, _next) => {
        ctx.body = (0, state_service_1.switchState)(ctx.stationConfig.switches);
    });
    router.get("/state/signals", (ctx, _next) => {
        ctx.body = (0, state_service_1.signalState)(ctx.stationConfig.signals);
    });
    router.get("/state/lighting", (ctx, _next) => { });
    router.get("/state/paths", (ctx, _next) => {
        ctx.body = (0, path_service_1.getActivePaths)();
    });
    router.get("/state/queues", (ctx, _next) => {
        ctx.body = (0, path_service_1.getActiveQueues)();
    });
};
exports.default = stateRoutes;
