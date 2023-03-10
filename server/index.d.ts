declare module "@railink/signalbox" {
    interface AppConfig {
        version: number;
        name: string;
        gpio: GpioConfig;
    }

    interface GpioConfig {
        expanders: ExpanderConfig[];
    }

    interface ExpanderConfig {
        type: string;
        pins: PinConfig[];
        environment: ExpanderEnvironmentVariable[];
        size: number;
    }

    interface PinConfig {
        id: number;
        name: string;
    }

    interface ExpanderEnvironmentVariable {
        name: string;
        value: string;
    }

    interface AppContext {
        appConfig: AppConfig;
        stationConfig: StationConfig;
    }

    interface Position {
        x: number;
        y: number;
    }

    interface StationConfig {
        switches: RailSwitch[];
        signals: RailSignal[];
        lighting: LightingNode[];
        waypoints: StationWaypoint[];
    }

    interface RailSwitch {
        id: number;
        position: Position;
        plus: RailSwitchDirection;
        minus: RailSwitchDirection;
        back: {
            node: number;
            cost: number;
        };
    }

    interface PinSignal {
        id: number;
        controller: number;
        value: string;
    }

    interface RailSwitchDirection {
        node: number;
        cost: number;
        pin: PinSignal;
    }

    interface RailSignal {
        id: number;
        pulse: boolean;
        aspects: SignalAspect[];
        switchFront: number;
        position: Position;
    }

    interface SignalAspect {
        name: string;
        id: number;
        pins: PinSignal[];
    }

    interface LightingNode {
        name: string;
        id: number;
        pins: PinSignal[];
    }

    interface StationWaypoint {
        id: number;
        name: string;
        position: Position;
        neighbors: {
            left: {
                node: number;
                cost: number;
            } | null;
            right: {
                node: number;
                cost: number;
            } | null;
        };
    }
}
