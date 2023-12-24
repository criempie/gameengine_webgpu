import { Buffer } from '~/Renderer/Buffer/Buffer';

export class VertexBuffer extends Buffer {
    protected GPU_BUFFER_USAGE: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    public layout: GPUVertexBufferLayout;

    constructor(attributes: GPUVertexAttribute[]) {
        const formats = attributes.map((att) => att.format);

        super(formats);

        this.layout = {
            stepMode: 'vertex',
            arrayStride: this._fragmentByteSize,
            attributes,
        };
    }
}