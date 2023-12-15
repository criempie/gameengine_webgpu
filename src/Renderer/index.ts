import { RendererError } from '~/Renderer/errors';

export class Renderer {
    private _device!: GPUDevice;

    constructor() {}

    public async init(gpu: GPU): Promise<void> {
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance',
        });

        if (!adapter) {
            throw new RendererError('Couldn\'t request WebGPU adapter.');
        }

        this._device = await adapter.requestDevice();
    }
}