import { AppContext } from "@common/config/config";
import Router from "@koa/router";
import { DefaultState } from "koa";
import { getRailSignal } from "../../signals";
import { allowSignal, StandardSignalAspect } from "./signal.service";

const signalRoutes = (router: Router<DefaultState, AppContext>) => {
    router.post("/signals/allow/:signal/:target", (ctx, _next) => {
        const signal = getRailSignal(ctx.stationConfig, ctx.params.signal);
        if (!signal) throw new Error("Invalid signal ID!");
        ctx.body = allowSignal(
            ctx.stationConfig,
            signal,
            ctx.params.target,
            -1
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
