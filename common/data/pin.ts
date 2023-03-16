export interface PinSignal {
    id: number;
    controller: number;
    value: {
        enabled: string;
        disabled: string;
    };
}
