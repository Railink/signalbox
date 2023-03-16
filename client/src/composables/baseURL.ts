import { ref } from "vue";

export function useBaseURL() {
    return window.location.protocol + "//" + window.location.host + "/api";
}
