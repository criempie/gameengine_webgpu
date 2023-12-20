import { Shader, ShaderOptions } from '~/Renderer/Shader';

export class BaseShader extends Shader {
    public static filePath: string = '/src/Renderer/shaders/base.wgsl?raw';

    public name: string = 'Base';

    public vertexBufferLayout: GPUVertexBufferLayout = {
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
                buffers: [ this.vertexBufferLayout ],
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
    }
}