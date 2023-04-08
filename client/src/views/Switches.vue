<template>
    <div class="flex gap-6 flex-wrap">
        <div
            v-for="state in switchState"
            :key="state.id"
            class="switch"
            @click="toggleSwitch(state.id, state.state == 0 ? 1 : 0)"
        >
            <Icon
                name="uil:arrow-up-right"
                v-if="state.state === 1 && !isLocked(state.id)"
                class="text-indicator-positive"
            />
            <Icon
                name="uil:arrow-right"
                v-if="state.state === 0 && !isLocked(state.id)"
                class="text-indicator-negative"
            />
            <Icon
                name="uil:lock"
                v-if="isLocked(state.id)"
                class="text-indicator-ambient"
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
import { fetchSwitches } from "src/composables/fetch";

const panelInjection = inject<PanelInjection>("dashboard-panel");

let switchState = ref<(RailSwitch & NodeState)[]>([]);

onMounted(async () => {
    switchState.value = await fetchSwitches();
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
        `${useBaseURL()}/switches/${to == 0 ? "minus" : "plus"}/${switchId}`
    );
    switchState.value = await fetchSwitches();
    await panelInjection?.panel().updatePanel(switchState.value);
};
</script>

<style lang="scss" scoped>
.switch {
    @apply text-3xl bg-background px-2 flex items-center gap-4 border border-border rounded-lg cursor-pointer select-none;
}
</style>
