import { StationConfig } from "@common/config/config";
import { RailSignal } from "@common/nodes/signal";
import { logger } from "../..";
import { checkPathSate, PathState } from "../../path";
import { setSignal } from "../../signals";

export enum StandardSignalAspect {
    STOP,
    ALLOW,
    ALLOW_CAUTION,
    NEXT_STOP,
}

export const allowSignal = (
    stationConfig: StationConfig,
    signal: RailSignal,
    target: string,
    aspect: number = -1
) => {
    if (aspect === StandardSignalAspect.STOP) {
        setSignal(signal, aspect);
        return;
    }

    const pathState = checkPathSate(
        signal.switchFront.toString(),
        target,
        stationConfig
    );

    try {
        switch (pathState) {
            case PathState.SAFE:
                if (aspect === -1) setSignal(signal, StandardSignalAspect.ALLOW);
                else setSignal(signal, aspect);
                break;
            case PathState.SAFE_CAUTION:
                if (aspect === -1)
                    setSignal(signal, StandardSignalAspect.ALLOW_CAUTION);
                else setSignal(signal, aspect);
                break;
            case PathState.UNSAFE:
                setSignal(signal, StandardSignalAspect.STOP);
                break;
        }
    } catch (e: any) {
        logger.error(e.message);
    }

    return "OK!";
};
