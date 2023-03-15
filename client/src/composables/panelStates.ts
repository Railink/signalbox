import { LinkedListItem } from "dijkstra-calculator";
import { reactive, ref } from "vue";

export const usePaths = () => ref<LinkedListItem[][]>([])