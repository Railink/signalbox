"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signals_1 = require("../../signals");
const signal_service_1 = require("./signal.service");
const signal_1 = require("@common/nodes/signal");
const util_1 = require("util");
const signalRoutes = (router) => {
    router.post("/signals/allow/:signal/:target/:aspect/:time", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        if (!(0, util_1.isNumber)(ctx.params.aspect))
            throw new Error("The aspect ID must be a number!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, ctx.params.target, ctx.params.aspect, true);
    });
    router.post("/signals/allow/:signal/:target/:time", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        if (!(0, util_1.isNumber)(ctx.params.time))
            throw new Error("The time must be a number!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, ctx.params.target, -1, false, ctx.params.time);
    });
    router.post("/signals/close/:signal", (ctx, _next) => {
        const signal = (0, signals_1.getRailSignal)(ctx.stationConfig, ctx.params.signal);
        if (!signal)
            throw new Error("Invalid signal ID!");
        ctx.body = (0, signal_service_1.allowSignal)(ctx.stationConfig, signal, "", signal_1.StandardSignalAspect.STOP);
    });
};
exports.default = signalRoutes;
