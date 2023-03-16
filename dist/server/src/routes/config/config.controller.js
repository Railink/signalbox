"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configRoutes = (router) => {
    router.get('/config/switches', (ctx, _next) => {
        ctx.body = ctx.stationConfig.switches;
    });
    router.get('/config/signals', (ctx, _next) => {
        ctx.body = ctx.stationConfig.signals;
    });
    router.get('/config/lighting', (ctx, _next) => {
        ctx.body = ctx.stationConfig.lighting;
    });
    router.get('/config/waypoints', (ctx, _next) => {
        ctx.body = ctx.stationConfig.waypoints;
    });
};
exports.default = configRoutes;
