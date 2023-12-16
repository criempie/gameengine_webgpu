import { ShaderError } from '~/Renderer/errors';

export class Shader {
    protected readonly _filePath!: string;
    protected readonly _device: GPUDevice;
    protected _code: string | undefined;
    protected _shaderModule: GPUShaderModule | undefined;

    public get code(): string {
        if (!this._code) {
            throw new ShaderError('The shader code is not defined. The load function must be called.');
        }

        return this._code;
    }

    public get shaderModule(): GPUShaderModule {
        if (!this._shaderModule) {
            throw new ShaderError('The shader module is not defined. The load function must be called.');
        }

        return this._shaderModule;
    }

    constructor(filePath: string, device: GPUDevice) {
        this._filePath = filePath;
        this._device = device;
    }

    public async load(): Promise<void> {
        const { default: code } = await import(/* @vite-ignore */ this._filePath);

        this._code = code;
        this._shaderModule = this._device.createShaderModule({
            code: this._code!,
            label: `shader ${ this._filePath }`,
        });
    }
}