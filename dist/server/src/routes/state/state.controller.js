"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_service_1 = require("./state.service");
const stateRoutes = (router) => {
    router.get("/state/switches", (ctx, _next) => {
        ctx.body = (0, state_service_1.switchState)(ctx.stationConfig.switches);
    });
    router.get("/state/signals", (ctx, _next) => {
        ctx.body = (0, state_service_1.signalState)(ctx.stationConfig.signals);
    });
    router.get("/state/lighting", (ctx, _next) => { });
};
exports.default = stateRoutes;
