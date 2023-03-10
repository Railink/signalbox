import Router from "@koa/router";
import { AppContext } from "@railink/signalbox";
import { DefaultState } from "koa";

const configRoutes = (router: Router<DefaultState, AppContext>) => {
    router.get('/switches', (ctx, _next) => {
        ctx.body = ctx.stationConfig.switches;
    });

    router.get('/signals', (ctx, _next) => {
        ctx.body = ctx.stationConfig.signals;
    });

    router.get('/lighting', (ctx, _next) => {
        ctx.body = ctx.stationConfig.lighting;
    });

    router.get('/waypoints', (ctx, _next) => {
        ctx.body = ctx.stationConfig.waypoints;
    });
}

export default configRoutes;
