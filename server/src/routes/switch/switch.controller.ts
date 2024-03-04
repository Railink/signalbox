import { AppContext } from "@common/config/config";
import Router from "@koa/router";
import { DefaultState } from "koa";
import { getNode } from "../../config/config.util";
import { RailNode, RailSwitch, isRailSwitch } from "@common/nodes/switch";
import { setSwitch } from "../../switches";
import { SwitchState } from "@common/nodes/state";
import { isNumber } from "util";

const switchRoutes = (router: Router<DefaultState, AppContext>) => {
    router.post("/switches/:id/set/:state", (ctx, _next) => {
        const railSwitch = getNode(ctx.params.id, ctx.stationConfig);
        const state = parseInt(ctx.params.state);

        if (!railSwitch || !isRailSwitch(railSwitch as RailNode))
            throw new Error(`Invalid rail switch ${ctx.params.id}!`);
        if (!isNumber(state) && state != 1 && state != 0)
            throw new Error(`Invalid state ${ctx.params.state}!`);

        setSwitch(
            railSwitch as RailSwitch,
            state === 0 ? SwitchState.MINUS : SwitchState.PLUS
        );

        ctx.body = 'OK!';
    });
};

export default switchRoutes;
