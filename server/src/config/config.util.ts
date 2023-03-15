import { RailSwitch, RailWaypoint, StationConfig } from "./config";
import { controllers } from "..";
import { Controller } from "../controllers/Controller";

interface NodePinConfiguration {
  controller: Controller;
  pin: number;
}

export const getNode = (
  id: number | string,
  stationConfig: StationConfig
): RailWaypoint | RailSwitch | null => {
  if (isNaN(+id)) return null;
  return (
    stationConfig.switches.find((s) => s.id === Number(id)) ??
    stationConfig.waypoints.find((wp) => wp.id === Number(id)) ??
    null
  );
};

export const getController = (pin: number): NodePinConfiguration => {
  let iterations = 0;
  let pinSum = 0;

  for (let controller of controllers) {
    if (pinSum + controller.size() > pin) break;
    pinSum += controller.size();
    iterations++;
  }

  return {
    pin: pin - pinSum,
    controller: controllers[iterations],
  };
};
