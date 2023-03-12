<template>
    <slot />
</template>

<script setup lang="ts">
import { provide } from "vue";
import StationPanel, { PanelInjection } from "../dashboard/panel";

const props = defineProps({
    id: {
        type: String,
        default: "station-panel",
    },
});

// TODO: Some weird type error
// @ts-ignore
let panel: StationPanel = reactive(
    new StationPanel(
        null,
        [],
        [],
        [],
        "",
        "",
        ""
    )
);

const updatePanel = (newValue: StationPanel) => {
    panel = newValue;
};

provide<PanelInjection>(props.id, { panel: () => panel, updatePanel });
</script>

<style lang="scss" scoped></style>
