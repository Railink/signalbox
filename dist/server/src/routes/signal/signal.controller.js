"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signals_1 = require("../../signals");
const signal_service_1 = require("./signal.service");
const signalRoutes = (router) => {
    router.post("/signals/allow/:signal/:target", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, ctx.params.target, -1);
    });
    router.post("/signals/close/:signal", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, "", signal_service_1.StandardSignalAspect.STOP);
    });
};
exports.default = signalRoutes;
