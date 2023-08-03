import { AppContext } from "@common/config/config";
import Router from "@koa/router";
import { DefaultState } from "koa";
import { getRailSignal } from "../../signals";
import { allowSignal } from "./signal.service";
import { StandardSignalAspect } from "@common/nodes/signal";
import { isNumber } from "util";

const signalRoutes = (router: Router<DefaultState, AppContext>) => {
    router.post("/signals/allow/:signal/:target/:aspect/:time", (ctx, _next) => {
        const signal = getRailSignal(ctx.stationConfig, ctx.params.signal);
        if (!signal) throw new Error("Invalid signal ID!");
        if (!isNumber(ctx.params.aspect)) throw new Error("The aspect ID must be a number!");
        ctx.body = allowSignal(
            ctx.stationConfig,
            signal,
            ctx.params.target,
            ctx.params.aspect,
            true
        );
    });

    router.post("/signals/allow/:signal/:target/:time", (ctx, _next) => {
        const signal = getRailSignal(ctx.stationConfig, ctx.params.signal);
        if (!signal) throw new Error("Invalid signal ID!");
        if (!isNumber(ctx.params.time)) throw new Error("The time must be a number!");
        ctx.body = allowSignal(
            ctx.stationConfig,
            signal,
            ctx.params.target,
            -1,
            false,
            ctx.params.time
        );
    });

    router.post("/signals/close/:signal", (ctx, _next) => {
        const signal = getRailSignal(ctx.stationConfig, ctx.params.signal);
        if (!signal) throw new Error("Invalid signal ID!");
        ctx.body = allowSignal(
            ctx.stationConfig,
            signal,
            "",
            StandardSignalAspect.STOP
        );
    });
};

export default signalRoutes;
