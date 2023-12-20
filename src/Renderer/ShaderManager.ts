import { InheritedShaderConstructor, Shader, ShaderOptions } from '~/Renderer/Shader';
import { BaseShader } from '~/Renderer/shaders/Base.shader';

export class ShaderManager {
    private static _shaders: Map<string, Shader> = new Map();

    private static availableShaders: InheritedShaderConstructor[] = [
        BaseShader,
    ];

    public static async load(device: GPUDevice, options: ShaderOptions) {
        const unloaded_shaders = ShaderManager
        .availableShaders
        .map((s) => {
            return new s(device, options);
        });

        await Promise.all(
            unloaded_shaders.map((shader) => {
                return shader.load()
                .then(() => {
                    this._shaders.set(shader.name, shader);
                });
            })
        );
    }

    public static getShader(name: string): Shader | undefined {
        return ShaderManager._shaders.get(name);
    }
}