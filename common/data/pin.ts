export interface PinSignal {
    id: number;
    blinking?: boolean;
    value: {
        enabled: string;
        disabled: string;
    };
}
