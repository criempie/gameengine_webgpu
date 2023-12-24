import { IndexBuffer } from '~/Renderer/Buffer/IndexBuffer';
import { ShaderError } from '~/Renderer/errors';
import { VertexBuffer } from '~/Renderer/Buffer/VertexBuffer';

export abstract class Shader {
    protected readonly _filePath: string;
    protected readonly _device: GPUDevice;
    protected readonly _textureFormat: GPUTextureFormat;
    protected _shaderModule!: GPUShaderModule;

    protected _bindGroupLayouts!: GPUBindGroupLayout[];

    public abstract name: string;

    public abstract vertexBuffer: VertexBuffer;
    public abstract indexBuffer: IndexBuffer;

    public abstract bindingGroupLayoutDescriptors: GPUBindGroupLayoutDescriptor[];

    public abstract createRenderPipelineDescriptor(): GPURenderPipelineDescriptor;

    public abstract createPipelineLayoutDescriptor(): GPUPipelineLayoutDescriptor;

    protected constructor(filePath: string, device: GPUDevice, options: ShaderOptions) {
        this._filePath = filePath;
        this._device = device;
        this._textureFormat = options.textureFormat;
    }

    public get shaderModule(): GPUShaderModule {
        if (!this._shaderModule) {
            throw new ShaderError('The shader module is not defined. The load function must be called.');
        }

        return this._shaderModule;
    }

    public get bindGroupLayouts(): GPUBindGroupLayout[] {
        if (!this._bindGroupLayouts) {
            this._bindGroupLayouts = this.bindingGroupLayoutDescriptors.map((desc) => {
                return this._device.createBindGroupLayout(desc);
            });
        }

        return this._bindGroupLayouts;
    }

    public async load(): Promise<void> {
        const { default: code } = await import(/* @vite-ignore */ this._filePath);

        this._shaderModule = this._device.createShaderModule({
            code,
            label: `shader ${ this._filePath }`,
        });

        this._bindGroupLayouts = this._createBindGroupLayouts();
    }

    public getBindGroupLayoutByLabel(label: string): GPUBindGroupLayout | undefined {
        return this.bindGroupLayouts.find((bg) => bg.label === label);
    }

    protected _createBindGroupLayouts(): GPUBindGroupLayout[] {
        return this.bindingGroupLayoutDescriptors.map((desc) => {
            return this._device.createBindGroupLayout(desc);
        });
    }

    protected _createPipelineLayout(): GPUPipelineLayout {
        return this._device.createPipelineLayout({
            bindGroupLayouts: this.bindGroupLayouts,
        });
    }
}

export type ShaderOptions = {
    textureFormat: GPUTextureFormat,
}

export type InheritedShaderConstructor = new (device: GPUDevice, options: ShaderOptions) => Shader;