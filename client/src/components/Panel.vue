<template>
    <div :id="id" class="flex h-full items-center justify-center"></div>
</template>

<script setup lang="ts">
import StationPanel, { PanelInjection } from "../dashboard/panel";
import axios from "axios";
import { LinkedListItem } from "dijkstra-calculator";
import { Svg } from "@svgdotjs/svg.js";
import { inject, onMounted, watch } from "vue";
import { usePaths } from "../composables/panelStates";
import { RailSignal } from "@common/nodes/signal";
import { RailSwitch } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import { NodeState } from "@common/nodes/state";
import { useBaseURL } from "../composables/baseURL";

const props = defineProps({
    lineColor: {
        type: String,
        default: "#000",
    },
    wayColor: {
        type: String,
        default: "#009933",
    },
    pathColor: {
        type: String,
        default: "#FF0000",
    },
    errorColor: {
        type: String,
        default: "#FF9900",
    },
    id: {
        type: String,
        default: "station-panel",
    },
});

const fetchSwitches = async () =>
    (
        await axios.get<(RailSwitch & NodeState)[]>(
            `${useBaseURL()}/state/switches`
        )
    ).data;
const fetchCurrentPaths = async () =>
    (
        await axios.get<{ id: string; steps: LinkedListItem[] }[]>(
            `${useBaseURL()}/state/paths`
        )
    ).data;
const fetchSwitchConfig = async () =>
    (await axios.get<RailSwitch[]>(`${useBaseURL()}/config/switches`)).data;
const fetchWaypointConfig = async () =>
    (await axios.get<RailWaypoint[]>(`${useBaseURL()}/config/waypoints`)).data;
const fetchSignalConfig = async () =>
    (await axios.get<RailSignal[]>(`${useBaseURL()}/config/signals`)).data;

const panelInjection = inject<PanelInjection>(props.id);

onMounted(async () => {
    const canvas = new Svg().addTo(`div#${props.id}`);

    canvas.attr("preserveAspectRatio", "slice");
    canvas.attr("ref", "panel");
    canvas.attr("style", "height: inherit;");

    const switches = await fetchSwitchConfig();
    const waypoints = await fetchWaypointConfig();
    const signals = await fetchSignalConfig();
    const switchState = await fetchSwitches();

    panelInjection?.updatePanel(
        new StationPanel(
            canvas,
            switches,
            waypoints,
            signals,
            props.lineColor,
            props.wayColor,
            props.pathColor,
            props.errorColor
        )
    );

    if (!panelInjection) return;
    const panel = panelInjection.panel();

    await panel.drawPanel();
    await panel.updatePanel(switchState);
    await panel.updatePaths((await fetchCurrentPaths()).map((p) => p.steps));

    const { x, y, width, height } = canvas.bbox();
    const newWidth = x + width + x;
    const newHeight = y + height + y;

    canvas.size(newWidth, newHeight);
    canvas.viewbox(0, 0, newWidth, newHeight);
});

watch(
    () => usePaths(),
    (_, newValue) => {
        panelInjection?.panel().updatePaths(newValue.value);
    }
);
</script>
