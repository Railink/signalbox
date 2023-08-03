<template>
    <nav>
        <ul>
            <li
                :class="`bg-panel ${route.path == element.page ? 'active' : null}`"
                :key="element.toString()"
                v-for="element in elements"
                @click="router.push({ path: element.page.toString() })"
            >
                {{ element.name }}
            </li>
            <li class="filler"></li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

defineProps({
    elements: {
        type: Array<{ name: String; page: String }>,
        default: [],
    }
});
</script>

<style scoped lang="scss">
nav > ul {
    @apply flex bg-background;

    & > li:not(.filler) {
        @apply text-xl 2xl:text-2xl px-2 py-1 2xl:px-4 2xl:py-2 rounded-t-xl border-x-border border-t-border border select-none cursor-pointer;
    }

    & > li:not(.active, .filler) {
        @apply bg-darker-panel border border-b-border;
    }

    & > li:nth-child(1) {
        @apply rounded-l-none border-l-transparent;
    }

    & > li.filler {
        @apply grow border border-b-border border-t-0 border-x-0;
    }

    & > li {
        @apply basis-48;
    }
}
</style>
