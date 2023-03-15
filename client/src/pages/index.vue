<template>
    <main class="flex w-full">
        <Modal
            :show="pathConfirmationModalVisible"
            @close="pathConfirmationModalVisible = false"
        >
            <article>
                <h1 class="text-3xl font-semibold">Potwierdzenie przebiegu</h1>
                <div class="flex items-center gap-2 text-2xl mt-3">
                    <h2>{{ startNode }}</h2>
                    <div>
                        <Icon
                            name="uil:arrow-circle-right"
                            class="text-3xl text-indicator-ambient"
                        />
                    </div>
                    <h2
                        class="bg-indicator-ambient px-2 py-1 rounded-xl text-xl font-semibold text-white uppercase"
                        v-if="currentCheckedPath.length > 1"
                    >
                        Manewry
                    </h2>
                    <div v-if="currentCheckedPath.length > 1">
                        <Icon
                            name="uil:arrow-circle-right"
                            class="text-3xl text-indicator-ambient"
                        />
                    </div>
                    <h2>{{ finishNode }}</h2>
                </div>
                <div class="path-confirmation">
                    <button
                        class="confirm"
                        @click="submitPath(currentCheckedPath)"
                    >
                        Potwierdzam
                    </button>
                    <button
                        class="cancel"
                        @click="pathConfirmationModalVisible = false"
                    >
                        Anuluj
                    </button>
                </div>
            </article>
        </Modal>
        <div class="grid gap-8">
            <section>
                <h1>Ustawianie przebiegu</h1>
                <form
                    class="flex items-center gap-2 my-3"
                    @submit.prevent="confirmPath"
                >
                    <select name="start" id="start" v-model="startNode">
                        <option
                            v-for="point in pointList"
                            :value="point"
                            :key="point.id"
                        >
                            {{ point.name ?? point.id }}
                        </option>
                    </select>
                    <Icon
                        name="uil:arrow-circle-right"
                        class="text-3xl text-indicator-ambient"
                    />
                    <select name="finish" id="finish" v-model="finishNode">
                        <option
                            v-for="point in pointList"
                            :value="point"
                            :key="point.id"
                        >
                            {{ point.name ?? point.id }}
                        </option>
                    </select>
                    <button type="submit">Ustaw</button>
                </form>
            </section>
            <section>
                <h1>Ustawianie sygnału</h1>
                <form
                    class="flex items-center gap-2 my-3"
                    @submit.prevent="setSignal"
                >
                    <select name="start" id="start" v-model="selectedSignal">
                        <option
                            v-for="signal in signalList"
                            :value="signal.id"
                            :key="signal.id"
                        >
                            {{ signal.id }}
                        </option>
                    </select>
                    <Icon
                        name="uil:arrow-circle-right"
                        class="text-3xl text-indicator-ambient"
                    />
                    <select
                        name="finish"
                        id="finish"
                        v-model="signalDestination"
                    >
                        <option
                            v-for="point in pointList"
                            :value="point"
                            :key="point.id"
                        >
                            {{ point.name ?? point.id }}
                        </option>
                    </select>
                    <button type="submit">Ustaw</button>
                </form>
            </section>
        </div>
        <section class="basis-1/3">
            <h1>Aktywne przebiegi</h1>
            <div
                class="path"
                v-for="path in activePaths.filter((p) => p.length > 0)"
            >
                <button @click="resetPath()">
                    <Icon
                        name="uil:link-broken"
                        class="text-3xl text-indicator-negative hover:text-indicator-negative-darker"
                    />
                </button>
                <h2>{{ path[0] }}</h2>
                <Icon
                    name="uil:arrow-circle-right"
                    class="text-3xl text-indicator-ambient"
                />
                <h2>{{ path[path.length - 1] }}</h2>
            </div>
        </section>
        <section class="basis-1/3">
            <h1>Aktywne manewry</h1>
        </section>
        <section class="basis-1/3">
            <h1>Semafory</h1>
            <div class="flex gap-2 flex-wrap mt-3">
                <div class="signal" v-for="signal in signalList">
                    <button @click="resetSignal(signal.id)">
                        <Icon
                            name="uiw:stop"
                            class="text-3xl text-indicator-negative hover:text-indicator-negative-darker"
                            v-if="signal.aspect === 3"
                        />
                        <Icon
                            name="uiw:minus-circle"
                            class="text-3xl text-indicator-caution hover:text-indicator-caution-darker"
                            v-if="signal.aspect === 2"
                        />
                        <Icon
                            name="uiw:down-circle"
                            class="text-3xl text-indicator-caution hover:text-indicator-caution-darker"
                            v-if="signal.aspect === 1"
                        />
                        <Icon
                            name="uiw:down-circle"
                            class="text-3xl text-indicator-positive hover:text-indicator-positive-darker"
                            v-if="signal.aspect === 0"
                        />
                    </button>
                    <h2>{{ signal.id }}</h2>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import axios from "axios";
import {
    SwitchNodeState,
    RailSwitch,
    RailWaypoint,
    RailSignal,
} from "common/config/config";
import { LinkedListItem } from "dijkstra-calculator";
import { config } from "process";
import { ref, inject, reactive, onMounted } from "vue";
import { PanelInjection } from "../dashboard/panel";

type CheckedPath = { length: number; queue: LinkedListItem[][] };

const fetchStationStatus = async () =>
    (await axios.get<SwitchNodeState[]>(`${window.location.host}/api/switches`))
        .data;
const fetchCurrentPaths = async () =>
    (
        await axios.get<LinkedListItem[][]>(
            `${window.location.host}/api/path/active`
        )
    ).data;
const fetchSwitchConfig = async () =>
    (
        await axios.get<RailSwitch[]>(
            `${window.location.host}/api/config/switches`
        )
    ).data;
const fetchWaypointConfig = async () =>
    (
        await axios.get<RailWaypoint[]>(
            `${window.location.host}/api/config/waypoints`
        )
    ).data;
const fetchSignalConfig = async () =>
    (
        await axios.get<RailSignal[]>(
            `${window.location.host}/api/config/signals`
        )
    ).data;

const pointList = ref<RailWaypoint[]>([]);
const signalList = ref<RailSignal[]>([]);
const startNode = ref<number>();
const finishNode = ref<number>();
const selectedSignal = ref<number>();
const signalDestination = ref<number>();
const activePaths = ref<LinkedListItem[][]>([]);
const panelInjection = inject<PanelInjection>("dashboard-panel");

const pathConfirmationModalVisible = ref(false);
let currentCheckedPath = reactive<CheckedPath>({ length: 0, queue: [] });

onMounted(async () => {
    pointList.value = await fetchWaypointConfig();
    activePaths.value = await fetchCurrentPaths();
    signalList.value = await fetchSignalConfig();
});

const checkPath = async (from: string, to: string): Promise<CheckedPath> => {
    const checkedPath = await axios.post<CheckedPath>(
        `${window.location.host}/check_path/${from}/${to}`
    );
    return checkedPath.data;
};

const confirmPath = async () => {
    if (!startNode.value || !finishNode.value) return;

    const checkedPath = await checkPath(
        startNode.value.toString(),
        finishNode.value.toString()
    );

    currentCheckedPath = checkedPath;
    pathConfirmationModalVisible.value = true;
};

const submitPath = async (checkedPath: CheckedPath) => {
    pathConfirmationModalVisible.value = false;
    if (!startNode.value || !finishNode.value) return;
    if (checkedPath.length < 2) {
        const submittedPath = await axios.post<{ queue_id: number }>(
            `${window.location.host}/path/${startNode.value}/${finishNode.value}`
        );

        axios
            .post(
                `${window.location.host}/steps/${submittedPath.data.queue_id}/next`
            )
            .then(async () => {
                panelInjection?.panel().updatePanel(await fetchSwitches());
                panelInjection?.panel().updatePaths(checkedPath.queue);
            });
    }

    activePaths.value = await fetchCurrentPaths();
};

const resetPath = async () => {
    await axios.post(`${window.location.host}/resetPath`);
    await axios.get(`${window.location.host}/switches`).then(async () => {
        panelInjection?.panel().updatePanel(await fetchSwitches());
        panelInjection?.panel().updatePaths([]);
    });
    activePaths.value = await fetchCurrentPaths();
};

const setSignal = async () => {
    const signal = selectedSignal.value;
    const to = signalDestination.value;

    await axios.post(`${window.location.host}/signals/allow/${signal}`, {
        method: "POST",
        body: {
            to,
        },
    });
    signalList.value = await fetchSignalConfig();
};

const resetSignal = async (signal: number) => {
    await axios.post(`${window.location.host}/signals/close/${signal}`);
    signalList.value = await fetchSignalConfig();
};
</script>

<style lang="scss" scoped>
.path {
    button {
        @apply mr-2;
    }
    @apply text-xl my-3 flex gap-2 items-center bg-background w-fit px-2 py-1 rounded-lg border-border/50 border;
}

.signal {
    button {
        @apply mr-2;
    }
    @apply text-xl flex gap-2 items-center bg-background w-fit px-2 py-1 rounded-lg border-border/50 border;
}

main {
    @apply flex gap-8;
}

section {
    @apply border-darker-panel border-2 rounded-lg px-6 py-4;
}

select {
    @apply bg-field border-darker-panel border-2 rounded-lg py-2 px-2;
}

button[type="submit"] {
    @apply bg-indicator-ambient hover:bg-indicator-ambient-darker px-4 py-2 rounded-lg text-white font-semibold;
}

.path-confirmation {
    @apply mt-6;
    button {
        @apply px-3 py-1 text-white text-xl rounded-md font-semibold;
        &.confirm {
            @apply bg-indicator-positive hover:bg-indicator-positive-darker;
        }

        &.cancel {
            @apply bg-indicator-negative hover:bg-indicator-negative-darker ml-2;
        }
    }
}
</style>
