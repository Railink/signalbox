<template>
    <div class="page-wrapper bg-background">
        <PanelContext id="dashboard-panel">
            <Panel way-color="#3b82f6" line-color="#0f172a" path-color="#be123c" id="dashboard-panel"
                class="col-span-12 panel" ref="mainPanel" />
            <div class="content-wrapper bg-panel">
                <TabList :elements="pages" />
                <div class="m-6">
                    <router-view />
                </div>
            </div>
        </PanelContext>
    </div>
</template>

<script setup lang="ts">
import TabList from './components/TabList.vue';
import Panel from './components/Panel.vue';
import PanelContext from './components/PanelContext.vue';

const pages = [
    {
        name: "Przebiegi",
        page: "/",
    },
    {
        name: "Rozjazdy",
        page: "/switches",
    },
    {
        name: "Oświetlenie",
        page: "/lighting",
    },
];
</script>

<style lang="scss" scoped>
.page-wrapper {
    @apply grid grid-cols-12 grid-rows-2 h-full;

    .sidebar {
        @apply bg-red-500 col-span-2 row-span-2;
    }

    .content-wrapper {
        @apply flex flex-col w-full col-span-12;
    }
}
</style>
