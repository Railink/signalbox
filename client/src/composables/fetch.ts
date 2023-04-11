import { RailSignal } from "@common/nodes/signal";
import { NodeState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import axios from "axios";
import { LinkedListItem } from "dijkstra-calculator";
import { useBaseURL } from "./baseURL";
import { LightingNode } from "@common/nodes/lighting";

export async function fetchSwitches() {
    return (
        await axios.get<(RailSwitch & NodeState)[]>(
            `${useBaseURL()}/state/switches`
        )
    ).data;
}

export async function fetchSignals() {
    return (
        await axios.get<(RailSignal & NodeState)[]>(
            `${useBaseURL()}/state/signals`
        )
    ).data;
}

export async function fetchCurrentPaths() {
    return (
        await axios.get<{ id: string; steps: LinkedListItem[] }[]>(
            `${useBaseURL()}/state/paths`
        )
    ).data;
}

export async function fetchCurrentQueues() {
    return (
        await axios.get<{ id: string; steps: LinkedListItem[][] }[]>(
            `${useBaseURL()}/state/queues`
        )
    ).data;
}

export async function fetchWaypointConfig() {
    return (await axios.get<RailWaypoint[]>(`${useBaseURL()}/config/waypoints`))
        .data;
}

export async function fetchLighting() {
    return (
        await axios.get<(LightingNode & NodeState)[]>(
            `${useBaseURL()}/state/lighting`
        )
    ).data;
}
