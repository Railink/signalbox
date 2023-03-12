<template>
    <div :id="id" class="flex h-full items-center justify-center"></div>
</template>

<script setup lang="ts">
import StationPanel, { PanelInjection } from "../dashboard/panel";
import axios from "axios";
import { watch } from "fs";
import { inject, onMounted } from "vue";
import { RailSignal, RailSwitch, RailWaypoint, SwitchNodeState } from "../config";
import { LinkedListItem } from "dijkstra-calculator";
import { Svg } from "@svgdotjs/svg.js";

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
    id: {
        type: String,
        default: "station-panel",
    },
});

const fetchStationStatus = async () =>
    (await axios.get<SwitchNodeState[]>(`${window.location.host}/api/switches`)).data;
const fetchCurrentPaths = async () =>
    (await axios.get<LinkedListItem[][]>(`${window.location.host}/api/path/active`)).data;
const fetchSwitchConfig = async () =>
    (await axios.get<RailSwitch[]>(`${window.location.host}/api/config/switches`)).data;
const fetchWaypointConfig = async () =>
    (await axios.get<RailWaypoint[]>(`${window.location.host}/api/config/waypoints`)).data;
const fetchSignalConfig = async () =>
    (await axios.get<RailSignal[]>(`${window.location.host}/api/config/signals`)).data;

const panelInjection = inject<PanelInjection>(props.id);

onMounted(async () => {
    const canvas = new Svg().addTo(`div#${props.id}`);

    canvas.attr("preserveAspectRatio", "slice");
    canvas.attr("ref", "panel");
    canvas.attr("style", "height: inherit;")

    const switches = await fetchSwitchConfig();
    const waypoints = await fetchWaypointConfig();
    const signals = await fetchSignalConfig();
    const switchState = await fetchStationStatus();

    panelInjection?.updatePanel(
        new StationPanel(
            canvas,
            switches,
            waypoints,
            signals,
            props.lineColor,
            props.wayColor,
            props.pathColor
        )
    );

    if (!panelInjection) return;
    const panel = panelInjection.panel();

    await panel.drawPanel();
    await panel.updatePanel(switchState);
    await panel.updatePaths(await fetchCurrentPaths());

    const { x, y, width, height } = canvas.bbox();
    const newWidth = x + width + x;
    const newHeight = y + height + y;

    canvas.size(newWidth, newHeight);
    canvas.viewbox(0, 0, newWidth, newHeight);
});

// watch(
//     () => usePaths(),
//     (_, newValue) => {
//         panelInjection?.panel().updatePaths(newValue.value);
//     }
// );
</script>
