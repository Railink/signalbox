import { StationConfig } from "@common/config/config";
import { Controller } from "@common/controllers/Controller";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import { controllers } from "..";

interface NodePinConfiguration {
  controller: Controller;
  pin: number;
}

export const getNode = (
  id: number | string,
  stationConfig: StationConfig
): RailWaypoint | RailSwitch | null => {
  console.log(id, isNaN(+id));
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
