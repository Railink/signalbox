"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_util_1 = require("../../config/config.util");
const switch_1 = require("@common/nodes/switch");
const switches_1 = require("../../switches");
const state_1 = require("@common/nodes/state");
const util_1 = require("util");
const switchRoutes = (router) => {
    router.post("/switches/:id/set/:state", (ctx, _next) => {
        const railSwitch = (0, config_util_1.getNode)(ctx.params.id, ctx.stationConfig);
        const state = parseInt(ctx.params.state);
        if (!railSwitch || !(0, switch_1.isRailSwitch)(railSwitch))
            throw new Error(`Invalid rail switch ${ctx.params.id}!`);
        if (!(0, util_1.isNumber)(state) && state != 1 && state != 0)
            throw new Error(`Invalid state ${ctx.params.state}!`);
        (0, switches_1.setSwitch)(railSwitch, state === 0 ? state_1.SwitchState.MINUS : state_1.SwitchState.PLUS);
        ctx.body = 'OK!';
    });
};
exports.default = switchRoutes;
