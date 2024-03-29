import { RailSwitch } from "@common/nodes/switch";

export default function verifySwitches(switches: RailSwitch[]) {
    switches.forEach((railSwitch) => {
        if (railSwitch.id < 0)
            throw new Error(`Invalid switch id! (${railSwitch.id})`);

        if (
            railSwitch.back.node === railSwitch.plus.node ||
            railSwitch.back.node === railSwitch.plus.node ||
            railSwitch.plus.node === railSwitch.minus.node
        )
            throw new Error(
                `A switch cannot point to the same node in different directions! (${railSwitch.id})`
            );

        if (railSwitch.position.x < 0 || railSwitch.position.y < 0)
            throw new Error(
                `Position coordinates must be positive! ${railSwitch.id}`
            );
    });
}
