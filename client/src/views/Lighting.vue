<template>
    <div class="flex gap-6 flex-wrap">
        <div
            v-for="state in lightingState"
            :key="state.name"
            class="light"
            @click="toggleLight(state.name, state.state === 1 ? 'off' : 'on')"
        >
            <span
                v-if="state.state === 1"
                class="icon-[uil--lightbulb] text-indicator-positive"
            />
            <span
                v-if="state.state !== 0"
                class="icon-[uil--lightbulb] text-indicator-negative"
            />
            <h2>{{ state.name }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { LightingNode } from '@common/nodes/lighting';
import { NodeState } from '@common/nodes/state';
import { ref, onMounted } from 'vue';
import { useBaseURL } from '../composables/baseURL';
import { fetchLighting } from '../composables/fetch';

let lightingState = ref<(LightingNode & NodeState)[]>([]);

onMounted(async () => {
    lightingState.value = await fetchLighting();
});

const toggleLight = async (name: string, to: "on" | "off") => {
    await axios.post(`${useBaseURL()}/state/lighting/${name}/${to}`);
    lightingState.value = await fetchLighting();
};
</script>

<style lang="scss" scoped>
.light {
    @apply text-3xl bg-background px-2 py-2 flex items-center gap-4 border border-border rounded-lg cursor-pointer select-none;
}
</style>
