<template>
    <div class="flex gap-3 flex-wrap">
        <div
            v-for="state in switchState"
            :key="state.id"
            class="switch"
            @click="toggleSwitch(state.id, state.state == 0 ? 1 : 0)"
        >
            <span
                v-if="state.state == 1 && !isLocked(state.id)"
                class="icon-[uil--arrow-up-right] text-indicator-positive"
            />
            <span
                v-if="state.state == 0 && !isLocked(state.id)"
                class="icon-[uil--arrow-down-right] text-indicator-negative"
            />
            <span
                v-if="isLocked(state.id)"
                class="icon-[uil--lock] text-indicator-ambient"
            />
            <h2>{{ state.id }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import axios from "axios";
import { NodeState } from "@common/nodes/state";
import { RailSwitch } from "@common/nodes/switch";
import { PanelInjection } from "../dashboard/panel";
import { useBaseURL } from "../composables/baseURL";
import { fetchSwitches } from "../composables/fetch";

const panelInjection = inject<PanelInjection>("dashboard-panel");

let switchState = ref<(RailSwitch & NodeState)[]>([]);

onMounted(async () => {
    switchState.value = await fetchSwitches();
    console.log(switchState.value);
});

const isLocked = (switchId: number) => {
    return !!panelInjection
        ?.panel()
        .currPaths.find(
            (p) =>
                !!p.find(
                    (s) =>
                        s.source === switchId.toString() ||
                        s.target === switchId.toString()
                )
        );
};

const toggleSwitch = async (switchId: number, to: number) => {
    if (isLocked(switchId)) return;
    const switched = await axios.post<RailSwitch[]>(
        `${useBaseURL()}/switches/${switchId}/set/${to}`
    );
    switchState.value = await fetchSwitches();
    await panelInjection?.panel().updatePanel(switchState.value);
};
</script>

<style lang="scss" scoped>
.switch {
    @apply text-xl bg-background px-2 flex items-center gap-4 border border-border rounded-lg cursor-pointer select-none;
}
</style>
