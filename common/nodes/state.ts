export enum PinState {
    HIGH,
    LOW,
    UNKNOWN,
}

export enum SwitchState {
    PLUS,
    MINUS,
    UNKNOWN,
}

export interface NodeState {
    state: number;
}
