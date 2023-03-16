<template>
    <teleport to="body">
        <transition enter-active-class="transition ease-out duration-200 transform" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200 transform"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div ref="backdrop" class="fixed z-10 inset-0 overflow-y-auto bg-black bg-opacity-50" v-show="visible">
                <div class="flex justify-center items-center min-h-screen text-center" @click.prevent>
                    <transition enter-active-class="transition ease-out duration-300 transform "
                        enter-from-class="opacity-0 translate-y-10 scale-95"
                        enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="ease-in duration-200"
                        leave-from-class="opacity-100 translate-y-0 scale-100"
                        leave-to-class="opacity-0 translate-y-10 translate-y-0 scale-95">
                        <div class="bg-white rounded-lg text-left overflow-hidden shadow-xl p-8 w-1/3" role="dialog"
                            ref="modal" aria-modal="true" aria-labelledby="modal-headline" v-show="visible">
                            <div>
                                <button class="float-right mr-auto">
                                    <Icon name="uil:multiply" class="text-red-400" @click="closeModal" />
                                </button>
                            </div>
                            <div>
                                <slot>I'm empty inside</slot>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
    id: {
        type: String,
    },
    show: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const visible = ref(false);

const closeModal = () => {
    visible.value = false;
    emit('close');
};

watch(
    () => props.show,
    (show) => {
        visible.value = show;
    }
);
</script>

<style scoped>
.__modal-replay {
    @apply absolute w-screen h-screen bg-black/30;
}
</style>
