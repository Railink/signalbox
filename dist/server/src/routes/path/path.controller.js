"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_service_1 = require("./path.service");
const pathRoutes = (router) => {
    router.post("/path/new/:a/:b", (ctx, _next) => {
        try {
            ctx.body = (0, path_service_1.createPath)(ctx.params.a, ctx.params.b, ctx.stationConfig);
        }
        catch (e) {
            console.error(e);
            ctx.body = e.message;
        }
    });
    router.post("/path/set", (ctx, _next) => {
        try {
            ctx.body = (0, path_service_1.setPath)(ctx.stationConfig, ctx.request.body, false);
        }
        catch (e) {
            console.error(e);
            ctx.body = e.message;
        }
    });
    router.post("/path/unlock/:id", (ctx, _next) => {
        ctx.body = (0, path_service_1.unlockPath)(ctx.params.id);
    });
    router.post("/path/queue/:id/next", (ctx, _next) => {
        ctx.body = (0, path_service_1.nextStep)(ctx.stationConfig, ctx.params.id);
    });
    router.post("/path/queue/:id/destroy", (ctx, _next) => {
        ctx.body = (0, path_service_1.destroyPath)(ctx.params.id);
    });
};
exports.default = pathRoutes;
