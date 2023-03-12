import Router from "@koa/router";
import { AppContext } from "../../config/config";
import { DefaultState } from "koa";

const configRoutes = (router: Router<DefaultState, AppContext>) => {
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
}

export default configRoutes;
