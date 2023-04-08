import { RailSignal } from "@common/nodes/signal";
import { NodeState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import axios from "axios";
import { LinkedListItem } from "dijkstra-calculator";
import { useBaseURL } from "./baseURL";
import { LightingNode } from "@common/nodes/lighting";

export const fetchSwitches = async () =>
    (
        await axios.get<(RailSwitch & NodeState)[]>(
            `${useBaseURL()}/state/switches`
        )
    ).data;

export const fetchSignals = async () =>
    (
        await axios.get<(RailSignal & NodeState)[]>(
            `${useBaseURL()}/state/signals`
        )
    ).data;

export const fetchCurrentPaths = async () =>
    (
        await axios.get<{ id: string; steps: LinkedListItem[] }[]>(
            `${useBaseURL()}/state/paths`
        )
    ).data;

export const fetchCurrentQueues = async () =>
    (
        await axios.get<{ id: string; steps: LinkedListItem[][] }[]>(
            `${useBaseURL()}/state/queues`
        )
    ).data;

export const fetchWaypointConfig = async () =>
    (await axios.get<RailWaypoint[]>(`${useBaseURL()}/config/waypoints`)).data;

export const fetchLighting = async () =>
    (
        await axios.get<(LightingNode & NodeState)[]>(
            `${useBaseURL()}/state/lighting`
        )
    ).data;
