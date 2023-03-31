"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWaypoint = void 0;
const isWaypoint = (node) => Object.keys(node).includes("neighbors");
exports.isWaypoint = isWaypoint;
