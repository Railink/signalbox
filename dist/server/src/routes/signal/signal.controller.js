"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signals_1 = require("../../signals");
const signal_service_1 = require("./signal.service");
const signalRoutes = (router) => {
    router.post("/signals/set/:signal/:target/:aspect/:time", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        if (Number.isNaN(ctx.params.aspect))
            throw new Error("The aspect ID must be a number!");
        if (Number.isNaN(ctx.params.time))
            throw new Error("The time must be a number!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, ctx.params.target, parseInt(ctx.params.aspect), true, parseInt(ctx.params.time));
    });
    router.post("/signals/allow/:signal/:target/:time", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        if (Number.isNaN(ctx.params.time))
            throw new Error("The time must be a number!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, ctx.params.target, -1, false, parseInt(ctx.params.time));
    });
    router.post("/signals/close/:signal", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, "", signal.defaultAspect);
    });
};
exports.default = signalRoutes;
