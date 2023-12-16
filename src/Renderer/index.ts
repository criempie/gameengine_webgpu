import { Rectangle } from '~/Renderer/elements/rectangle';
import { RendererError } from '~/Renderer/errors';
import { ShaderManager } from '~/Renderer/ShaderManager';

export class Renderer {
    private _gpu!: GPU;
    private _device!: GPUDevice;
    private _canvasContext!: GPUCanvasContext;

    constructor() {}

    public async init(gpu: GPU, canvasContext: GPUCanvasContext): Promise<void> {
        this._gpu = gpu;
        this._canvasContext = canvasContext;

        const adapter = await this._gpu.requestAdapter({
            powerPreference: 'high-performance',
        });

        if (!adapter) {
            throw new RendererError('Couldn\'t request WebGPU adapter.');
        }

        this._device = await adapter.requestDevice();

        this._canvasContext.configure({
            device: this._device,
            format: this._gpu.getPreferredCanvasFormat(),
            alphaMode: 'premultiplied',
        });

        await ShaderManager.load(this._device);
    }

    public async drawSquare() {
        const square = new Rectangle();
        const buffers = square.createBuffers(this._device);

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: square.shaderModule,
                entryPoint: 'vs',
                buffers: [ Rectangle.vertexBufferLayout ],
            },
            fragment: {
                module: square.shaderModule,
                entryPoint: 'fs',
                targets: [
                    {
                        format: this._gpu.getPreferredCanvasFormat(),
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: 'auto',
        };

        const renderPipeline = this._device.createRenderPipeline(pipelineDescriptor);
        const commandEncoder = this._device.createCommandEncoder();

        const clearColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    clearValue: clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this._canvasContext.getCurrentTexture().createView(),
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setVertexBuffer(0, buffers.vertexBuffer);
        passEncoder.setIndexBuffer(buffers.indicesBuffer, 'uint16');
        passEncoder.drawIndexed(buffers.indicesBuffer.size / 2);
        passEncoder.end();

        this._device.queue.submit([ commandEncoder.finish() ]);
    }
}