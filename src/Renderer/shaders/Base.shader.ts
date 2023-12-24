import { IndexBuffer } from '~/Renderer/Buffer/IndexBuffer';
import { Shader, ShaderOptions } from '~/Renderer/Shader';
import { VertexBuffer } from '~/Renderer/Buffer/VertexBuffer';

export class BaseShader extends Shader {
    public static filePath: string = '/src/Renderer/shaders/base.wgsl?raw';

    public name: string = 'Base';

    public vertexBuffer: VertexBuffer;
    public indexBuffer: IndexBuffer;

    public bindingGroupLayoutDescriptors: GPUBindGroupLayoutDescriptor[] = [
        {
            entries: [
                {
                    binding: 0,
                    buffer: { type: 'uniform' },
                    visibility: GPUShaderStage.VERTEX,
                }
            ],
            label: 'projectionMatrix',
        }
    ];

    public createPipelineLayoutDescriptor(): GPUPipelineLayoutDescriptor {
        return {
            bindGroupLayouts: this.bindGroupLayouts,
        };
    }

    public createRenderPipelineDescriptor(): GPURenderPipelineDescriptor {
        return {
            vertex: {
                module: this._shaderModule,
                entryPoint: 'vs',
                buffers: [ this.vertexBuffer.layout ],
            },
            fragment: {
                module: this._shaderModule,
                entryPoint: 'fs',
                targets: [
                    {
                        format: this._textureFormat,
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: this._createPipelineLayout(),
        };
    }

    constructor(device: GPUDevice, options: ShaderOptions) {
        super(BaseShader.filePath, device, options);

        this.vertexBuffer = new VertexBuffer([
            {
                shaderLocation: 0,
                offset: 0,
                format: 'float32x2',
            }
        ]);

        this.indexBuffer = new IndexBuffer('uint16');
    }
}