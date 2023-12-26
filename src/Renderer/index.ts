import { Camera } from '~/Renderer/Camera';
import { RendererError } from '~/Renderer/errors';
import { Figure } from '~/Renderer/figures/Figure';
import { GPUContext } from '~/Renderer/GPUContext';
import { Shader } from '~/Renderer/Shader';
import { ShaderManager } from '~/Renderer/ShaderManager';

export class Renderer {
    private _shader!: Shader;
    private _camera!: Camera;

    private _renderPassDescriptor!: GPURenderPassDescriptor;

    public async init(gpu: GPU, canvasContext: GPUCanvasContext): Promise<void> {
        await this._initMainThing(gpu, canvasContext);

        this._renderPassDescriptor = {
            colorAttachments: [
                {
                    clearValue: GPUContext.clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: GPUContext.canvasContext.getCurrentTexture().createView(),
                },
            ],
        };

        await ShaderManager.load({
            textureFormat: GPUContext.canvasFormat,
        });

        this._shader = ShaderManager.getShader('Base')!;

        if (!this._shader) {
            throw new RendererError(`The shader Base is not loaded.`);
        }

        this._camera = new Camera({
            x: 0,
            y: 0,
            width: GPUContext.canvasContext.canvas.width,
            height: GPUContext.canvasContext.canvas.height,
        });
    }

    public async draw(figures: Figure[]) {
        if (figures.length === 0) return;

        this._shader.vertexBuffer.initBuffer(figures.reduce((acc, f) => acc + f.verticesItems.length, 0));
        this._shader.indexBuffer.initBuffer(figures.reduce((acc, f) => acc + f.indices.length, 0));

        let indicesOffset = 0;
        for (let figureNumber = 0; figureNumber < figures.length; figureNumber++) {
            const verticesCreated = this._shader.vertexBuffer.setVertices(figures[figureNumber].verticesItems);

            const indices = figures[figureNumber].indices.slice();
            for (let i = 0; i < indices.length; i++) {
                indices[i] += indicesOffset;
            }

            indicesOffset += figures[figureNumber].verticesCount;

            this._shader.indexBuffer.pushIndices(indices);
        }

        this._shader.vertexBuffer.updateGPUBuffer();
        this._shader.indexBuffer.updateGPUBuffer();

        const projectionUniformBuffer = this._createUniformBuffer(
            this._camera.projectionMatrix.length * Float32Array.BYTES_PER_ELEMENT,
        );

        GPUContext.device.queue.writeBuffer(projectionUniformBuffer, 0, this._camera.projectionMatrix as Float32Array);

        const projectionBindGroup = GPUContext.device.createBindGroup({
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

        const pipeline = GPUContext.device.createRenderPipeline(this._shader.createRenderPipelineDescriptor());
        const commandEncoder = GPUContext.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(this._renderPassDescriptor);

        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, this._shader.vertexBuffer.GPUBuffer);
        passEncoder.setIndexBuffer(this._shader.indexBuffer.GPUBuffer, 'uint16');
        passEncoder.setBindGroup(0, projectionBindGroup);
        passEncoder.drawIndexed(this._shader.indexBuffer.indicesCount);
        passEncoder.end();

        GPUContext.device.queue.submit([ commandEncoder.finish() ]);
    }

    private async _initMainThing(gpu: GPU, canvasContext: GPUCanvasContext): Promise<void> {
        const adapter = await gpu.requestAdapter({
            powerPreference: 'high-performance',
        });

        if (!adapter) {
            throw new RendererError('Couldn\'t request WebGPU adapter.');
        }

        const device = await adapter.requestDevice();

        GPUContext.init({
            gpu,
            device,
            canvasContext,
            clearColor: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        });
    }

    private _createUniformBuffer(size: number): GPUBuffer {
        return GPUContext.device.createBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size,
        });
    }

    private _createVertexBuffer(size: number): GPUBuffer {
        return GPUContext.device.createBuffer({
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            size,
        });
    }

    private _createIndexBuffer(size: number): GPUBuffer {
        return GPUContext.device.createBuffer({
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            size,
        });
    }
}