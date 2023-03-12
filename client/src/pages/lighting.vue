<template>
    <div class="flex gap-6 flex-wrap">
        <div
            v-for="state in lightingState"
            :key="state.name"
            class="light"
            @click="toggleLight(state.name, state.active ? 'off' : 'on')"
        >
            <Icon
                name="uil:lightbulb"
                v-if="state.active"
                class="text-indicator-positive"
            />
            <Icon
                name="uil:lightbulb"
                v-if="!state.active"
                class="text-indicator-negative"
            />
            <h2>{{ state.name }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const fetchLighting = () =>
    $fetch<API.StationLighting[]>(`${config.baseURL}/lighting`);

let lightingState = ref<API.StationLighting[]>([]);

onMounted(async () => {
    lightingState.value = await fetchLighting();
});

const toggleLight = async (name: string, to: "on" | "off") => {
    await $fetch(`${config.baseURL}/lighting/${name}/${to}`, {
        method: "POST",
    });
    lightingState.value = await fetchLighting();
};
</script>

<style lang="scss" scoped>
.light {
    @apply text-3xl bg-background px-2 py-2 flex items-center gap-4 border border-border rounded-lg cursor-pointer select-none;
}
</style>
