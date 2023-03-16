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
    router.get("/path/active", (ctx, _next) => {
        ctx.body = (0, path_service_1.getActivePaths)();
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
};
exports.default = pathRoutes;
