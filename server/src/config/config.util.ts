import {
  RailSwitch,
  RailWaypoint,
  StationConfig,
} from "../config/config";
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
    pinSum += controller.size();
    if (pinSum > pin) break;
    iterations++;
  }

  return {
    pin: pinSum - (pinSum - pin),
    controller: controllers[iterations],
  };
};
