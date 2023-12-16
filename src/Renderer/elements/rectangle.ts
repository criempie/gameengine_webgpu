import { ShaderManager } from '~/Renderer/ShaderManager';

export class Rectangle {
    public static readonly vertices = new Float32Array([
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
        1.0, -1.0,
    ]);

    public static readonly indices = new Uint16Array([
        0, 1, 2, 2, 3, 0,
    ]);

    public static readonly vertexBufferLayout: GPUVertexBufferLayout = {
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

    public shaderModule: GPUShaderModule;

    constructor() {
        this.shaderModule = ShaderManager.getShader('base')?.shaderModule!;
    }

    public createBuffers(device: GPUDevice) {
        const vertexBuffer = device.createBuffer({
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            size: Float32Array.BYTES_PER_ELEMENT * 8,
        });

        device.queue.writeBuffer(vertexBuffer, 0, Rectangle.vertices);

        const indicesBuffer = device.createBuffer({
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            size: Uint16Array.BYTES_PER_ELEMENT * 6,
        });

        device.queue.writeBuffer(indicesBuffer, 0, Rectangle.indices);

        return {
            vertexBuffer, indicesBuffer,
        };
    }
}