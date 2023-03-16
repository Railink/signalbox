import Router from "@koa/router";
import { AppContext } from "@common/config/config";
import { DefaultState } from "koa";
import { signalState, switchState } from "./state.service";

const stateRoutes = (router: Router<DefaultState, AppContext>) => {
    router.get("/state/switches", (ctx, _next) => {
        ctx.body = switchState(ctx.stationConfig.switches);
    });
    router.get("/state/signals", (ctx, _next) => {
        ctx.body = signalState(ctx.stationConfig.signals);
    });
    router.get("/state/lighting", (ctx, _next) => {});
}

export default stateRoutes;
