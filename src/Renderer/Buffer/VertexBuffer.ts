import { Buffer } from '~/Renderer/Buffer/Buffer';

export class VertexBuffer extends Buffer {
    protected GPU_BUFFER_USAGE: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    public layout: GPUVertexBufferLayout;

    public get verticesCount(): number {
        return this._fragmentsCount;
    }

    constructor(attributes: GPUVertexAttribute[]) {
        const formats = attributes.map((att) => att.format);

        super(formats);

        this.layout = {
            stepMode: 'vertex',
            arrayStride: this._fragmentByteSize,
            attributes,
        };
    }

    public setVertices(data: Float32Array): void {
        this.pushMultipleFragmentData(data, [ 0, data.length ]);
    }
}