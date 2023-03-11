import Router from "@koa/router";
import { AppContext } from "../../config/config";
import { DefaultState } from "koa";
import { createPath, setPath } from "./path.service";
import { LinkedListItem } from "dijkstra-calculator";

const pathRoutes = (router: Router<DefaultState, AppContext>) => {
  router.get("/path/new/:a/:b", (ctx, _next) => {
    try {
      ctx.body = createPath(ctx.params.a, ctx.params.b, ctx.stationConfig);
    } catch (e: any) {
      console.error(e);
      ctx.body = e.message;
    }
  });

  router.post("/path/set", (ctx, _next) => {
    try {
      console.log(ctx.request.body);
      ctx.body = setPath(ctx.stationConfig, [ctx.request.body as LinkedListItem[]], false);
    } catch (e: any) {
      console.error(e);
      ctx.body = e.message;
    }
  });
};

export default pathRoutes;
