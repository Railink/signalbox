export enum PinState {
    LOW,
    HIGH,
    UNKNOWN,
}

export enum SwitchState {
    MINUS,
    PLUS,
    UNKNOWN,
}

export interface NodeState {
    state: number;
}
