import Router from "@koa/router";
import { AppContext } from "@railink/signalbox";
import { DefaultState } from "koa";
import { createPath } from "./path.service";

const pathRoutes = (router: Router<DefaultState, AppContext>) => {
    router.get("/path/new/:a/:b", (ctx, _next) => {
        try {
            ctx.body = createPath(ctx.params.a, ctx.params.b, ctx.stationConfig);
        } catch (e: any) {
            console.error(e);
            ctx.body = e.message;
        }
    });
};

export default pathRoutes;
