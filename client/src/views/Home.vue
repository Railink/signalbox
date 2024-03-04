<template>
    <main class="flex w-full">
        <Modal
            :show="pathConfirmationModalVisible"
            @close="pathConfirmationModalVisible = false"
        >
            <article>
                <h1 class="text-3xl font-semibold">Potwierdzenie przebiegu</h1>
                <div class="flex items-center gap-2 text-2xl mt-3">
                    <h2>{{ nameMap.get(startNode?.toString() ?? "0") }}</h2>
                    <div>
                        <span
                            class="align-text-bottom icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                        />
                    </div>
                    <h2
                        class="bg-indicator-ambient px-2 py-1 rounded-xl text-xl font-semibold text-white uppercase"
                        v-if="currentCheckedPath.length > 1"
                    >
                        Manewry
                    </h2>
                    <div v-if="currentCheckedPath.length > 1">
                        <span
                            class="align-text-bottom icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                        />
                    </div>
                    <h2>{{ nameMap.get(finishNode?.toString() ?? "0") }}</h2>
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
        <Modal :show="queueModalVisible" @close="queueModalVisible = false">
            <article>
                <div class="flex gap-4 items-end">
                    <h1 class="text-2xl font-semibold">Manewry</h1>
                    <div class="flex items-center gap-2 text-xl mt-2">
                        <h2>
                            {{ selectedQueueSource }}
                        </h2>
                        <div class="">
                            <span
                                class="align-text-bottom icon-[uil--arrow-circle-right] text-2xl text-indicator-ambient"
                            />
                        </div>
                        <h2>{{ selectedQueueTarget }}</h2>
                    </div>
                </div>
                <h1 class="text-xl font-semibold">Kroki</h1>
                <ul class="mt-1 h-64 max-h-64 overflow-auto">
                    <li
                        v-for="(step, i) in activeQueues.get(selectedQueue)"
                        :key="i"
                        class="flex gap-2 items-center text-lg mb-2"
                    >
                        <button
                            @click="nextStep(selectedQueue)"
                            :disabled="i != 0"
                            class="bg-indicator-positive hover:enabled:bg-indicator-positive-darker disabled:bg-slate-500 px-2 py-1 text-white rounded-md font-semibold"
                        >
                            Wykonaj
                        </button>
                        <h2>
                            {{ nameMap.get(step[0].source) }}
                        </h2>
                        <div class="">
                            <span
                                class="align-text-bottom icon-[uil--arrow-circle-right] text-xl text-indicator-ambient"
                            />
                        </div>
                        <h2>{{ nameMap.get(step[step.length - 1].target) }}</h2>
                    </li>
                </ul>
                <div class="path-confirmation">
                    <button
                        class="bg-indicator-negative hover:bg-indicator-negative-darker"
                        @click="queueModalVisible = false"
                    >
                        Zamknij
                    </button>
                </div>
            </article>
        </Modal>
        <Modal :show="errorModalVisible" @close="errorModalVisible = false">
            <article>
                <h1 class="text-3xl font-semibold">
                    {{ error.name }}
                </h1>
                <div class="flex items-center gap-2 text-2xl mt-3">
                    <p>
                        {{ error.message }}
                    </p>
                </div>
                <div class="path-confirmation -ml-2">
                    <button class="cancel" @click="errorModalVisible = false">
                        Rozumiem
                    </button>
                </div>
            </article>
        </Modal>
        <div class="grid gap-4 basis-1/3">
            <section class="">
                <h1>Ustawianie przebiegu</h1>
                <form
                    class="flex items-center gap-2 my-3"
                    @submit.prevent="confirmPath"
                >
                    <select name="start" id="start" v-model="startNode">
                        <option
                            v-for="point in pointList.filter(
                                (p) => !p.name.endsWith('-S')
                            )"
                            :value="point.id"
                            :key="point.id"
                        >
                            {{ point.name ?? point.id }}
                        </option>
                    </select>
                    <span
                        class="icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                    />
                    <select name="finish" id="finish" v-model="finishNode">
                        <option
                            v-for="point in pointList.filter(
                                (p) => !p.name.endsWith('-S')
                            )"
                            :value="point.id"
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
                            v-for="signal in signalList.sort(s => s.id)"
                            :value="signal.id"
                            :key="signal.id"
                        >
                            {{ signal.id }}
                        </option>
                    </select>
                    <span
                        class="icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                    />
                    <select
                        name="finish"
                        id="finish"
                        v-model="signalDestination"
                    >
                        <option
                            v-for="point in pointList.filter(
                                (p) => !p.name.endsWith('-S')
                            )"
                            :value="point.id"
                            :key="point.id"
                        >
                            {{ point.name ?? point.id }}
                        </option>
                    </select>
                    <span
                        class="icon-[uil--traffic-light] text-3xl text-indicator-ambient"
                    />
                    <select
                        class="w-24"
                        name="aspect"
                        id="aspect"
                        v-model="signalAspect"
                    >
                        <option value="-1">Auto</option>
                        <option
                            v-for="aspect in signalList.find(
                                (s) => s.id === selectedSignal
                            )?.aspects"
                            :value="aspect.id"
                            :key="aspect.id"
                        >
                            {{ aspect.name }}
                        </option>
                    </select>
                    <span
                        class="icon-[uil--stopwatch] text-3xl text-indicator-ambient"
                    />
                    <select name="time" id="time" v-model="signalTime">
                        <option value="0">∞</option>
                        <option value="5">5s</option>
                        <option value="10">10s</option>
                        <option value="15">15s</option>
                        <option value="20">20s</option>
                        <option value="25">25s</option>
                        <option value="30">30s</option>
                        <option value="35">35s</option>
                        <option value="40">40s</option>
                        <option value="45">45s</option>
                        <option value="50">50s</option>
                        <option value="55">55s</option>
                        <option value="60">60s</option>
                    </select>
                    <button type="submit">Ustaw</button>
                </form>
            </section>
        </div>
        <section class="basis-1/3 flex flex-col">
            <h1>Aktywne przebiegi</h1>
            <ul class="min-h-64 h-64 max-h-64 overflow-y-auto">
                <li class="path" v-for="[id, steps] in activePaths">
                    <button @click="resetPath(id)" class="contents">
                        <span
                            class="icon-[uil--link-broken] text-3xl text-indicator-negative hover:text-indicator-negative-darker"
                        />
                    </button>
                    <h2>{{ nameMap.get(steps[0].source) }}</h2>
                    <span
                        class="icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                    />
                    <h2>{{ nameMap.get(steps[steps.length - 1].target) }}</h2>
                </li>
            </ul>
        </section>
        <section class="basis-1/3 flex flex-col">
            <h1>Aktywne manewry</h1>
            <ul class="min-h-64 h-64 max-h-64 overflow-y-auto">
                <li class="path" v-for="[id, steps] in activeQueues">
                    <button @click="resetPath(id)" class="-mr-2 contents">
                        <span
                            class="icon-[uil--trash] text-3xl text-indicator-negative hover:text-indicator-negative-darker"
                        />
                    </button>
                    <button @click="openQueueModal(id)" class="contents">
                        <span
                            class="icon-[uil--arrow-up-right] text-3xl text-indicator-ambient hover:bg-indicator-ambient-darker hover:text-background rounded-lg"
                        />
                    </button>
                    <h2>{{ nameMap.get(steps[0][0].source) }}</h2>
                    <span
                        class="icon-[uil--arrow-circle-right] text-3xl text-indicator-ambient"
                    />
                    <h2>
                        {{
                            nameMap.get(
                                steps[steps.length - 1][
                                    steps[steps.length - 1].length - 1
                                ].target
                            )
                        }}
                    </h2>
                </li>
            </ul>
        </section>
        <section class="basis-1/3">
            <h1 class="pb-3">Semafory</h1>
            <ul
                class="min-h-64 h-64 max-h-64 overflow-y-auto flex gap-2 flex-wrap justify-start content-start"
            >
                <li class="signal" v-for="signal in signalList">
                    <button @click="resetSignal(signal.id)" class="contents">
                        <span
                            class="icon-[uiw--stop] text-xl 2xl:text-3xl text-indicator-negative hover:text-indicator-negative-darker"
                            v-if="signal.state === 0"
                        />
                        <span
                            class="icon-[uiw--down-circle] text-xl 2xl:text-3xl text-indicator-positive hover:text-indicator-positive-darker"
                            v-else-if="signal.state === 1"
                        />
                        <span
                            class="icon-[uiw--down-circle] text-xl 2xl:text-3xl text-indicator-caution hover:text-indicator-caution-darker"
                            v-else-if="signal.state === 2"
                        />
                        <span
                            class="icon-[uiw--minus-circle] text-xl 2xl:text-3xl text-indicator-caution hover:text-indicator-caution-darker"
                            v-else-if="signal.state === 3"
                        />
                        <span
                            class="icon-[uiw--stop] text-xl 2xl:text-3xl text-indigo-300 hover:text-indigo-500"
                            v-else-if="signal.state === 4"
                        />
                        <span
                            class="icon-[uiw--down-circle] text-xl 2xl:text-3xl text-slate-300 hover:text-slate-500"
                            v-else-if="signal.state === 5"
                        />
                        <span
                            class="icon-[uiw--question-circle] text-xl 2xl:text-3xl text-slate-500 hover:text-slate-700"
                            v-else
                        />
                    </button>
                    <h2>{{ signal.id }}</h2>
                </li>
            </ul>
        </section>
    </main>
</template>

<script setup lang="ts">
import axios from "axios";
import { LinkedListItem } from "dijkstra-calculator";
import { ref, inject, onMounted, reactive, watchEffect, watch } from "vue";
import { RailSignal } from "@common/nodes/signal";
import { NodeState } from "@common/nodes/state";
import { RailWaypoint } from "@common/nodes/waypoint";
import { PathSetResult } from "@common/path";
import { useBaseURL } from "../composables/baseURL";
import { PanelInjection } from "../dashboard/panel";
import Modal from "../components/Modal.vue";
import {
    fetchWaypointConfig,
    fetchCurrentPaths,
    fetchSignals,
    fetchSwitches,
    fetchCurrentQueues,
} from "../composables/fetch";

type CheckedPath = LinkedListItem[][];

interface ErrorModal {
    name: string;
    message: string;
}

const pointList = ref<RailWaypoint[]>([]);
const signalList = ref<(RailSignal & NodeState)[]>([]);
const startNode = ref<number>();
const finishNode = ref<number>();
const selectedSignal = ref<number>();
const signalDestination = ref<number>();
const signalAspect = ref<number>(-1);
const signalTime = ref<number>(0);
const selectedQueue = ref<string>("0");
const selectedQueueSource = ref<string>("???");
const selectedQueueTarget = ref<string>("???");
const panelInjection = inject<PanelInjection>("dashboard-panel");

const activePaths = reactive<Map<string, LinkedListItem[]>>(new Map());
const activeQueues = reactive<Map<string, LinkedListItem[][]>>(new Map());
const error = reactive<ErrorModal>({ name: "?", message: "" });
const nameMap = reactive<Map<string, string>>(new Map());
const currentCheckedPath = ref<CheckedPath>([]);

const pathConfirmationModalVisible = ref(false);
const errorModalVisible = ref(false);
const queueModalVisible = ref(false);

watch(selectedSignal, () => (signalAspect.value = -1));

onMounted(async () => {
    pointList.value = await fetchWaypointConfig();
    activePaths.clear();
    (await fetchCurrentPaths()).forEach((p) => activePaths.set(p.id, p.steps));
    (await fetchCurrentQueues()).forEach((p) =>
        activeQueues.set(p.id, p.steps)
    );
    await updateSignals();
    pointList.value.forEach((p) => nameMap.set(p.id.toString(), p.name));
    (await fetchSwitches()).forEach((s) =>
        nameMap.set(s.id.toString(), `${s.id}`)
    );
});

const checkPath = async (from: string, to: string): Promise<CheckedPath> => {
    const checkedPath = await axios.post<CheckedPath>(
        `${useBaseURL()}/path/new/${from}/${to}`
    );
    return checkedPath.data;
};

const confirmPath = async () => {
    if (!startNode.value || !finishNode.value) return;

    const checkedPath = await checkPath(
        startNode.value.toString(),
        finishNode.value.toString()
    );

    currentCheckedPath.value = checkedPath;
    pathConfirmationModalVisible.value = true;
};

const submitPath = async (checkedPath: CheckedPath) => {
    pathConfirmationModalVisible.value = false;
    if (!startNode.value || !finishNode.value) return;

    let submittedPath = (
        await axios.post<PathSetResult>(
            `${useBaseURL()}/path/set`,
            checkedPath.flat()
        )
    ).data;

    if (submittedPath.type === "plan") {
        if (activeQueues.has(submittedPath.id)) return;
        activeQueues.set(submittedPath.id, submittedPath.steps);
    } else {
        if (submittedPath.id === "___COLLISION___") {
            errorModalVisible.value = true;
            error.name = "Błąd ustawiania przebiegu";
            error.message = "Ten przebieg koliduje z aktywnym przebiegiem";
            return;
        }

        panelInjection?.panel().updatePanel(await fetchSwitches());
        fetchCurrentPaths().then((currentPaths) => {
            activePaths.clear();
            currentPaths.forEach((p) => activePaths.set(p.id, p.steps));
            panelInjection
                ?.panel()
                .updatePaths(currentPaths.map((p) => p.steps));
        });
    }
};

const resetPath = async (id: string) => {
    await axios.post(`${useBaseURL()}/path/unlock/${id}`);
    await axios.get(`${useBaseURL()}/state/switches`).then(async () => {
        panelInjection?.panel().updatePanel(await fetchSwitches());
    });
    activePaths.clear();
    const setPaths = [] as LinkedListItem[][];
    (await fetchCurrentPaths()).forEach((p) => {
        activePaths.set(p.id, p.steps);
        setPaths.push(p.steps);
    });
    panelInjection?.panel().updatePaths(setPaths);
};

const setSignal = async () => {
    const signal = selectedSignal.value;
    const to = signalDestination.value;
    const aspect = signalAspect.value;

    if (aspect == -1) {
        await axios.post(
            `${useBaseURL()}/signals/allow/${signal}/${to}/${signalTime.value}`
        );
    } else {
        await axios.post(
            `${useBaseURL()}/signals/set/${signal}/${to}/${aspect}/${
                signalTime.value
            }`
        );
    }
    if (signalTime.value != 0) {
        updateSignals();
    }
    await updateSignals();
    setTimeout(updateSignals, signalTime.value * 1000 + 500);
};

const updateSignals = async () => {
    signalList.value = await fetchSignals();
};

const resetSignal = async (signal: number) => {
    await axios.post(`${useBaseURL()}/signals/close/${signal}`);
    signalList.value = await fetchSignals();
};

const openQueueModal = async (id: string) => {
    selectedQueue.value = id;
    const queue = activeQueues.get(id);
    if (!queue) return;
    selectedQueueSource.value = nameMap.get(queue[0][0].source) ?? "Unknown";
    selectedQueueTarget.value =
        nameMap.get(
            queue[queue.length - 1][queue[queue.length - 1].length - 1].target
        ) ?? "Unknown";
    queueModalVisible.value = true;
};

const nextStep = async (id: string) => {
    const result = (
        await axios.post<{
            type: "result";
            id: "___SUCCESS___" | "___COLLISION___" | "___INVQUEUE___";
            steps: [];
        }>(`${useBaseURL()}/path/queue/${id}/next`)
    ).data;

    switch (result.id) {
        case "___INVQUEUE___":
            return;
        case "___COLLISION___":
            errorModalVisible.value = true;
            error.name = "Błąd ustawiania przebiegu";
            error.message = "Ten przebieg koliduje z aktywnym przebiegiem";
            return;
        case "___SUCCESS___":
            activeQueues.clear();
            (await fetchCurrentQueues()).forEach((p) =>
                activeQueues.set(p.id, p.steps)
            );
            panelInjection?.panel().updatePanel(await fetchSwitches());
            fetchCurrentPaths().then((currentPaths) => {
                activePaths.clear();
                currentPaths.forEach((p) => activePaths.set(p.id, p.steps));
                panelInjection
                    ?.panel()
                    .updatePaths(currentPaths.map((p) => p.steps));
            });
    }
};
</script>

<style lang="scss" scoped>
.path {
    button:last-child {
        @apply mr-2;
    }
    @apply my-3 flex gap-2 items-center bg-background w-fit px-2 py-1 rounded-lg border-border/50 border;
}

.signal {
    button {
        @apply 2xl:mr-2 mr-1;
    }
    @apply h-fit 2xl:text-xl flex gap-2 items-center bg-background w-fit px-1 2xl:px-2 py-1 rounded-lg border-border/50 border;
}

main {
    @apply flex gap-8;
}

section {
    @apply border-darker-panel border-2 rounded-lg px-6 py-4;
}

select {
    @apply text-sm bg-field border-darker-panel border-2 rounded-lg py-1 px-1 w-12 2xl:py-2 2xl:px-2 2xl:w-24;
    &[name="aspect"],
    &[name="time"],
    &[name="start"],
    &[name="finish"] {
        @apply w-16 2xl:w-24;
    }
}

button[type="submit"],
button.confirm-queue {
    @apply bg-indicator-ambient hover:bg-indicator-ambient-darker px-2 py-1 2xl:px-4 2xl:py-2 rounded-lg text-white 2xl:font-semibold;
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
