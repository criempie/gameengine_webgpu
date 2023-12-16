import { Shader } from '~/Renderer/Shader';

export class ShaderManager {
    private static _shaders: Map<string, Shader> = new Map();

    public static async load(device: GPUDevice) {
        const base_shader = new Shader('/src/Renderer/shaders/base.wgsl?raw', device);
        await base_shader.load();

        this._shaders.set('base', base_shader);
    }

    public static getShader(name: string): Shader | undefined {
        return ShaderManager._shaders.get(name);
    }
}