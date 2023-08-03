import { RailSignal } from "@common/nodes/signal";
import { NodeState } from "@common/nodes/state";
import { RailSwitch, RailNode } from "@common/nodes/switch";
import { RailWaypoint } from "@common/nodes/waypoint";
import { Shape, Svg } from "@svgdotjs/svg.js";
import { LinkedListItem } from "dijkstra-calculator";

const SIZE_FACTOR = 25;
const POINT_SIZE = 10;
const FONT_SIZE = 14;

export interface PanelInjection {
    panel: () => StationPanel;
    updatePanel: (panel: StationPanel) => void;
}

class StationPanel {
    private switches: RailSwitch[];
    private waypoints: RailWaypoint[];
    private signals: RailSignal[];
    private canvas: Svg | null;

    private lineColor: string;
    private wayColor: string;
    private pathColor: string;
    private errorColor: string;

    private statusNodes: Shape[] = [];
    private pathNodes: Shape[] = [];
    public currPaths: LinkedListItem[][] = [];

    constructor(
        canvas: Svg | null,
        switches: RailSwitch[],
        waypoints: RailWaypoint[],
        signals: RailSignal[],
        lineColor: string,
        wayColor: string,
        pathColor: string,
        errorColor: string
    ) {
        this.canvas = canvas;
        this.switches = switches;
        this.waypoints = waypoints;
        this.signals = signals;
        this.lineColor = lineColor;
        this.wayColor = wayColor;
        this.pathColor = pathColor;
        this.errorColor = errorColor;
    }

    private getSwitchOrientation(node: RailNode) {
        if ((node as RailWaypoint).neighbors) return;

        const railSwitch = node as RailSwitch;

        const minusNode = [...this.switches, ...this.waypoints].find(
            (n) => n.id === railSwitch.minus.node
        );
        const plusNode = [...this.switches, ...this.waypoints].find(
            (n) => n.id === railSwitch.plus.node
        );
        const backNode = [...this.switches, ...this.waypoints].find(
            (n) => n.id === railSwitch.back.node
        );

        if (!minusNode || !plusNode || !backNode) return "up";

        if (
            minusNode.position.y === backNode.position.y &&
            backNode.position.y < plusNode.position.y
        ) {
            return "down";
        } else if (
            minusNode.position.y === backNode.position.y &&
            backNode.position.y > plusNode.position.y
        ) {
            return "up";
        } else {
            return "up";
        }
    }

    async drawPanel() {
        const nodes = [...this.switches, ...this.waypoints];

        this.signals.forEach((signal) => {
            if (!this.canvas) return;
            const right =
                nodes.find((n) => n.id === signal.switchFront)?.position?.x ?? 0 >
                signal.position.x;

            this.canvas
                .text(
                    right
                        ? signal.id.toString() + "►"
                        : "◄" + signal.id.toString()
                )
                .move(signal.position.x * SIZE_FACTOR, signal.position.y * SIZE_FACTOR - (POINT_SIZE * 3))
                .font({
                    fill: "#44403c",
                    family: "Calibri",
                    weight: 700,
                    size: `${FONT_SIZE}px`,
                })
        });
        nodes.forEach((node) => {
            // Drawing lines between the points
            const neighbors = [
                (node as RailSwitch)?.back,
                (node as RailWaypoint).neighbors?.right,
                (node as RailWaypoint).neighbors?.left,
                (node as RailSwitch)?.plus,
                (node as RailSwitch)?.minus,
            ];

            if (!node.position) return;

            const name = (node as RailWaypoint).name ?? node.id.toString();

            if (!name.endsWith("-S")) {
                this.canvas
                    ?.text(name)
                    .move(
                        node.position.x * SIZE_FACTOR,
                        (node.position.y * SIZE_FACTOR) -
                            (this.getSwitchOrientation(node) === "down"
                                ? ((POINT_SIZE * 3))
                                : -((POINT_SIZE * 2) / 3))
                    )
                    .font({
                        fill: "#3D3D3D",
                        family: "Calibri",
                        weight: 700,
                        size: `${FONT_SIZE}px`,
                    });
            }

            neighbors.forEach((neighbor) => {
                if (!neighbor) return;

                let neighborName = neighbor.node;
                let neighborNode: RailNode | undefined;

                neighborNode = nodes.find((n) => n.id === neighborName);

                if (!neighborNode || !neighborNode.position || !node.position)
                    return;

                const { x: x1, y: y1 } = node.position;
                const { x: x2, y: y2 } = neighborNode.position;

                this.canvas
                    ?.line(
                        x1 * SIZE_FACTOR,
                        y1 * SIZE_FACTOR,
                        (x2 * SIZE_FACTOR) / 2 + (x1 * SIZE_FACTOR) / 2, // Line halving
                        (y2 * SIZE_FACTOR) / 2 + (y1 * SIZE_FACTOR) / 2 // Line halving
                    )
                    .stroke({
                        color: this.lineColor,
                        width: POINT_SIZE,
                        linecap: "round",
                    });
            });
        });
    }

    async updatePanel(switchState: (RailSwitch & NodeState)[]) {
        this.statusNodes.forEach((n) => n.remove());
        this.statusNodes = [];
        this.switches.forEach((s) => {
            if (!s.position) return;

            const state = switchState.find((st) => st.id === s.id);
            console.log(state);
            if (!state) return;
            const neighbor = state.state === 0 ? s.minus.node : s.plus.node; // SwitchState.MINUS

            let neighborNode: RailNode | undefined;

            neighborNode = [...this.switches, ...this.waypoints].find(
                (n) => n.id == neighbor
            );

            if (!neighborNode || !neighborNode.position || !s.position) return;

            const { x: x1, y: y1 } = s.position;
            const { x: x2, y: y2 } = neighborNode.position;

            const line = this.canvas
                ?.line(
                    x1 * SIZE_FACTOR,
                    y1 * SIZE_FACTOR,
                    (x2 * SIZE_FACTOR) / 2 + (x1 * SIZE_FACTOR) / 2, // Line halving
                    (y2 * SIZE_FACTOR) / 2 + (y1 * SIZE_FACTOR) / 2 // Line halving
                )
                .stroke({
                    color: state.state === 2 ? this.errorColor : this.wayColor, // SwitchState.UNKNOWN
                    width: POINT_SIZE + 0.1,
                    linecap: "round",
                })
                .attr("onclick", "alert('ss')");

            this.canvas
                ?.circle(POINT_SIZE)
                .fill(state.state === 2 ? this.errorColor : this.wayColor)
                .move(
                    s.position.x * SIZE_FACTOR - POINT_SIZE / 2,
                    s.position.y * SIZE_FACTOR - POINT_SIZE / 2
                )
                .attr("onclick", "alert('s')");

            if (line) {
                this.statusNodes.push(line);
            }
        });
        this.updatePaths(this.currPaths);
    }

    async updatePaths(paths: LinkedListItem[][]) {
        this.pathNodes.forEach((n) => n.remove());
        this.pathNodes = [];
        this.currPaths = paths;
        paths.forEach((path) => {
            path.forEach((step, i) => {
                const node = [...this.switches, ...this.waypoints].find(
                    (n) => n.id === Number(step.source)
                );

                const nextNode = [...this.switches, ...this.waypoints].find(
                    (n) => n.id === Number(step.target)
                );

                if (!node || !node.position || !nextNode || !nextNode.position)
                    return;

                const { x: x1, y: y1 } = node.position;
                const { x: x2, y: y2 } = nextNode.position;

                const line = this.canvas
                    ?.line(
                        x1 * SIZE_FACTOR,
                        y1 * SIZE_FACTOR,
                        x2 * SIZE_FACTOR, // Line halving
                        y2 * SIZE_FACTOR // Line halving
                    )
                    .stroke({
                        color: this.pathColor,
                        width: POINT_SIZE + 0.1,
                        linecap: "round",
                    });

                if (line) {
                    this.pathNodes.push(line);
                }
            });
        });
    }
}

export default StationPanel;
