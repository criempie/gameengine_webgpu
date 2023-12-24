import { Buffer } from '~/Renderer/Buffer/Buffer';

export class IndexBuffer extends Buffer {
    protected readonly GPU_BUFFER_USAGE: GPUFlagsConstant = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;

    constructor(format: GPUIndexFormat) {
        super([ format ]);
    }
}