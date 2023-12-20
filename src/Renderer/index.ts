import { Camera } from '~/Renderer/Camera';
import { RendererError } from '~/Renderer/errors';
import { Figure } from '~/Renderer/figures/Figure';
import { Shader } from '~/Renderer/Shader';
import { ShaderManager } from '~/Renderer/ShaderManager';

export class Renderer {
    private _gpu!: GPU;
    private _device!: GPUDevice;
    private _canvasContext!: GPUCanvasContext;

    private _preferredCanvasFormat!: GPUTextureFormat;
    private _shader!: Shader;

    private _clearColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };
    private _camera!: Camera;

    private _renderPassDescriptor!: GPURenderPassDescriptor;

    public async init(gpu: GPU, canvasContext: GPUCanvasContext): Promise<void> {
        await this._initMainThing(gpu, canvasContext);

        this._preferredCanvasFormat = this._gpu.getPreferredCanvasFormat();

        this._canvasContext.configure({
            device: this._device,
            format: this._preferredCanvasFormat,
            alphaMode: 'premultiplied',
        });

        this._renderPassDescriptor = {
            colorAttachments: [
                {
                    clearValue: this._clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this._canvasContext.getCurrentTexture().createView(),
                },
            ],
        };

        await ShaderManager.load(this._device, {
            textureFormat: this._preferredCanvasFormat,
        });

        this._shader = ShaderManager.getShader('Base')!;

        if (!this._shader) {
            throw new RendererError(`The shader Base is not loaded.`);
        }

        this._camera = new Camera({
            x: 0,
            y: 0,
            width: this._canvasContext.canvas.width,
            height: this._canvasContext.canvas.height,
        });
    }

    private async _initMainThing(gpu: GPU, canvasContext: GPUCanvasContext): Promise<void> {
        this._gpu = gpu;
        this._canvasContext = canvasContext;

        const adapter = await this._gpu.requestAdapter({
            powerPreference: 'high-performance',
        });

        if (!adapter) {
            throw new RendererError('Couldn\'t request WebGPU adapter.');
        }

        this._device = await adapter.requestDevice();
    }

    public async draw(figures: Figure[]) {
        if (figures.length === 0) return;

        // TODO: Сделать сортировку по разным фигурам? У них могут отличаться размеры буферов.
        const vertexBuffer = this._createVertexBuffer(figures.length * figures[0].verticesTotalSize);
        const indexBuffer = this._createIndexBuffer(figures.length * figures[0].indicesTotalSize);

        for (let i = 0; i < figures.length; i++) {
            const figure = figures[i];

            this._device.queue.writeBuffer(vertexBuffer, i * figure.verticesTotalSize, figure.getVertices());
            this._device.queue.writeBuffer(
                indexBuffer,
                i * figure.indicesTotalSize,
                figures[i].getIndices(i * figure.verticesCount),
            );
        }

        const projectionUniformBuffer = this._createUniformBuffer(
            this._camera.projectionMatrix.length * Float32Array.BYTES_PER_ELEMENT,
        );

        this._device.queue.writeBuffer(projectionUniformBuffer, 0, this._camera.projectionMatrix as Float32Array);

        const projectionBindGroup = this._device.createBindGroup({
            layout: this._shader.getBindGroupLayoutByLabel('projectionMatrix')!,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: projectionUniformBuffer,
                    },
                }
            ]
        });

        const pipeline = this._device.createRenderPipeline(this._shader.createRenderPipelineDescriptor());
        const commandEncoder = this._device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(this._renderPassDescriptor);

        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setIndexBuffer(indexBuffer, 'uint16');
        passEncoder.setBindGroup(0, projectionBindGroup);
        passEncoder.drawIndexed(figures.length * figures[0].indicesCount);
        passEncoder.end();

        this._device.queue.submit([ commandEncoder.finish() ]);
    }

    private _createUniformBuffer(size: number): GPUBuffer {
        return this._device.createBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size,
        });
    }

    private _createVertexBuffer(size: number): GPUBuffer {
        return this._device.createBuffer({
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            size,
        });
    }

    private _createIndexBuffer(size: number): GPUBuffer {
        return this._device.createBuffer({
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            size,
        });
    }
}