"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRailSwitch = void 0;
const isRailSwitch = (node) => {
    return Object.keys(node).includes("plus") && Object.keys(node).includes("minus");
};
exports.isRailSwitch = isRailSwitch;
