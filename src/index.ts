import { FaceEngine } from "@geenee/bodyprocessors";
import { Snapshoter } from "@geenee/armature";
import { HatRenderer } from "./hatrenderer";
import "./index.css";

// Engine
const urlParams = new URLSearchParams(window.location.search);
let rear = urlParams.has("rear");
const engine = new FaceEngine();

async function main() {
    // Renderer
    const container = document.getElementById("root");
    if (!container)
        return;
    const renderer = new HatRenderer(container, "crop");
    // Camera switch
    const cameraSwitch = document.getElementById(
        "camera-switch") as HTMLButtonElement | null;
    if (cameraSwitch) {
        cameraSwitch.onclick = async () => {
            cameraSwitch.disabled = true;
            rear = !rear;
            await engine.setup({ size: { width: 1920, height: 1080 }, rear });
            await engine.start();
            renderer.setMirror(!rear);
            cameraSwitch.disabled = false;
        }
    }
    // Snapshot
    const snapshoter = new Snapshoter(renderer);
    const snapshotButton = document.getElementById(
        "snapshot") as HTMLButtonElement | null;
    if (snapshotButton)
        snapshotButton.onclick = async () => {
            const image = await snapshoter.snapshot();
            if (!image)
                return;
            const canvas = document.createElement("canvas");
            canvas.id = "engeenee.snapshot";
            canvas.hidden = true;
            const context = canvas.getContext("2d", { alpha: true });
            if (!context) {
                canvas.remove();
                return;
            }
            canvas.width = image.width;
            canvas.height = image.height;
            context.putImageData(image, 0, 0);
            const url = canvas.toDataURL();
            const link = document.createElement("a");
            link.hidden = true;
            link.href = canvas.toDataURL();
            link.download = "snapshot.png";
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            canvas.remove();
        };
    // Initialization
    await Promise.all([
        engine.addRenderer(renderer),
        engine.init({ transform: true, metric: true })]);
    await engine.setup({ size: { width: 1920, height: 1080 }, rear });
    await engine.start();
    document.getElementById("dots")?.remove();
}
main();
