import { mat4 } from 'gl-matrix';
import { Camera } from '~/Renderer/Camera';
import { Rectangle } from '~/Renderer/elements/rectangle';
import { RendererError } from '~/Renderer/errors';
import { Figure } from '~/Renderer/figures/Figure';
import { RectFigure } from '~/Renderer/figures/Rect.figure';
import { ShaderManager } from '~/Renderer/ShaderManager';

export class Renderer {
    private _gpu!: GPU;
    private _device!: GPUDevice;
    private _canvasContext!: GPUCanvasContext;

    private _clearColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };
    private _shaderModule!: GPUShaderModule;
    private _camera!: Camera;

    private _vertexBufferLayout: GPUVertexBufferLayout = {
        attributes: [
            {
                shaderLocation: 0,
                offset: 0,
                format: 'float32x2',
            }
        ],
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
        stepMode: 'vertex',
    };

    private _pipelineDescriptor!: GPURenderPipelineDescriptor;

    private _projectionMatrixBingGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor = {
        entries: [
            {
                binding: 0,
                buffer: { type: 'uniform' },
                visibility: GPUShaderStage.VERTEX,
            }
        ]
    };

    private _renderPassDescriptor!: GPURenderPassDescriptor;

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

        this._shaderModule = ShaderManager.getShader('base')!.shaderModule;

        this._camera = new Camera({
            x: 0,
            y: 0,
            width: this._canvasContext.canvas.width,
            height: this._canvasContext.canvas.height,
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
    }

    public async draw(figures: Figure[]) {
        if (figures.length === 0) return;

        // TODO: Сделать сортировку по разных фигурам? У них могут отличаться размеры буферов.
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

        const projectionBingGroupLayout = this._device.createBindGroupLayout(
            this._projectionMatrixBingGroupLayoutDescriptor
        );

        const pipelineLayout = this._device.createPipelineLayout({
            bindGroupLayouts: [
                projectionBingGroupLayout,
            ]
        });

        const uniformBuffer = this._device.createBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: this._camera.projectionMatrix.length * Float32Array.BYTES_PER_ELEMENT,
        });

        this._device.queue.writeBuffer(uniformBuffer, 0, this._camera.projectionMatrix as Float32Array);

        const projectionBindGroup = this._device.createBindGroup({
            layout: projectionBingGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: uniformBuffer,
                    },
                }
            ]
        });

        this._pipelineDescriptor = {
            vertex: {
                module: this._shaderModule,
                entryPoint: 'vs',
                buffers: [ this._vertexBufferLayout ],
            },
            fragment: {
                module: this._shaderModule,
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
            layout: pipelineLayout,
        };

        const pipeline = this._device.createRenderPipeline(this._pipelineDescriptor);
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