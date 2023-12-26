import { Buffer } from '~/Renderer/Buffer/Buffer';

export class IndexBuffer extends Buffer {
    protected readonly GPU_BUFFER_USAGE: GPUFlagsConstant = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;

    public get indicesCount(): number {
        return this._itemsCount;
    }

    constructor(format: GPUIndexFormat) {
        super([ format ]);
    }

    public pushIndices(data: Uint16Array): void {
        this.pushMultipleFragmentData(data, [ 0, data.length ]);
    }
}