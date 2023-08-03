import { StationConfig } from "@common/config/config";
import { RailSignal, StandardSignalAspect } from "@common/nodes/signal";
import { logger } from "../..";
import { checkPathSate, PathState } from "../../path";
import { setSignal } from "../../signals";

export const allowSignal = (
    stationConfig: StationConfig,
    signal: RailSignal,
    target: string,
    aspect: number = -1,
    force: boolean = false,
    time?: number
) => {
    if (aspect === StandardSignalAspect.STOP || force) {
        setSignal(signal, aspect, time);
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
                if (aspect === -1) setSignal(signal, StandardSignalAspect.ALLOW, time);
                else setSignal(signal, aspect, time);
                break;
            case PathState.SAFE_CAUTION:
                if (aspect === -1)
                    setSignal(signal, StandardSignalAspect.ALLOW_CAUTION, time);
                else setSignal(signal, aspect, time);
                break;
            case PathState.UNSAFE:
                setSignal(signal, StandardSignalAspect.STOP, time);
                break;
        }
    } catch (e: any) {
        logger.error(e.message);
    }

    return "OK!";
};
