import { VertexBufferError } from '~/Renderer/errors';
import { GPUContext } from '~/Renderer/GPUContext';

export abstract class Buffer {
    protected _fragmentByteSize: number;
    protected _itemsInFragment: number;
    protected _fragmentFormats: ParsedBufferDataFormat[];

    protected _buffer!: ArrayBuffer;
    protected _dataView!: DataView;
    protected _gpuBuffer!: GPUBuffer;
    protected _count!: number;

    protected abstract readonly GPU_BUFFER_USAGE: GPUFlagsConstant;

    public get buffer(): ArrayBuffer {
        return this._buffer;
    }

    public get GPUBuffer(): GPUBuffer {
        return this._gpuBuffer;
    }

    protected constructor(formats: (GPUVertexFormat | GPUIndexFormat)[]) {
        this._fragmentFormats = formats.map(Buffer._parseBufferFormat);
        [ this._fragmentByteSize, this._itemsInFragment ] = Buffer._processBufferFormats(this._fragmentFormats);
    }

    public initBuffer(count: number): void {
        this._buffer = new ArrayBuffer(this._fragmentByteSize * count);
        this._dataView = new DataView(this._buffer);

        this._count = count;

        this._gpuBuffer = GPUContext.device.createBuffer({
            usage: this.GPU_BUFFER_USAGE,
            size: this._buffer.byteLength,
        });
    }

    public updateGPUBuffer(): void {
        GPUContext.device.queue.writeBuffer(this._gpuBuffer, 0, this._buffer);
    }

    public pushData(data: number[], fragmentNumber: number): void {
        let offset = fragmentNumber * this._fragmentByteSize;
        let itemIndex = 0;
        for (const format of this._fragmentFormats) {
            for (let n = 0; n < format.number; n++) {
                const item = data[itemIndex];

                // I have no idea how to do this without this heresy.
                switch (format.type) {
                    case 'float': {
                        if (format.bytes === 4) {
                            this._dataView.setFloat32(offset, item, true);
                        } else if (format.bytes === 8) {
                            this._dataView.setFloat64(offset, item, true);
                        }

                        break;
                    }

                    case 'sint' || 'snorm': {
                        if (format.bytes === 1) {
                            this._dataView.setInt8(offset, item);
                        } else if (format.bytes === 2) {
                            this._dataView.setInt16(offset, item, true);
                        } else if (format.bytes === 4) {
                            this._dataView.setInt32(offset, item, true);
                        }

                        break;
                    }

                    case 'uint' || 'unorm': {
                        if (format.bytes === 1) {
                            this._dataView.setUint8(offset, item);
                        } else if (format.bytes === 2) {
                            this._dataView.setUint16(offset, item, true);
                        } else if (format.bytes === 4) {
                            this._dataView.setUint32(offset, item, true);
                        }

                        break;
                    }

                    default: {
                        throw new VertexBufferError(
                            'The attribute type defined inside the buffer is not supported.');
                    }
                }

                itemIndex++;
                offset += format.bytes;
            }
        }
    }

    // Returns [ fragmentBySize: number, itemsInFragment: number ].
    protected static _processBufferFormats(formats: ParsedBufferDataFormat[]): [ number, number ] {
        let fragmentByteSize = 0;
        let itemsInFragment = 0;

        formats.forEach((f) => {
            fragmentByteSize += f.bytes * f.number;
            itemsInFragment += f.number;
        });

        return [
            fragmentByteSize,
            itemsInFragment,
        ];
    }

    protected static _parseBufferFormat(format: GPUVertexFormat | GPUIndexFormat): ParsedBufferDataFormat {
        const regex = /([a-z]+)([0-9]+)x([0-9]+)|([a-z]+)([0-9]+)/g;
        const matched = regex.exec(format);

        if (!matched) throw new Error(`Fail to parse: ${ format }`);

        /**
         * If the format is of type float32x4 then the array will be:
         * [ 'float32x4', 'float', '32', '4', undefined, undefined ].
         *
         * else if format is of type float32 (without x count) then:
         * [ 'float32', undefined, undefined, undefined, 'float', '32' ].
         */

        if (matched[1]) {
            return {
                type: matched[1] as BufferDataFormat,
                bytes: +matched[2] / 8,
                number: +matched[3],
            };
        } else {
            return {
                type: matched[4] as BufferDataFormat,
                bytes: +matched[5] / 8,
                number: 1,
            };
        }
    }
}

export type BufferDataFormat = 'uint' | 'sint' | 'unorm' | 'snorm' | 'float';

export type ParsedBufferDataFormat = {
    type: BufferDataFormat,
    bytes: number,
    number: number,
}