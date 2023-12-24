import { VertexBufferError } from '~/Renderer/errors';

export class VertexBuffer {
    private _buffer!: ArrayBuffer;
    private _dataView!: DataView;

    private readonly _attributeFormats: ParsedVertexFormat[];
    private readonly _vertexSizeBytes: number;
    private readonly _itemsInVertex: number;
    private _vertexCount!: number;

    public layout: GPUVertexBufferLayout;

    public get buffer(): ArrayBuffer {
        return this._buffer;
    }

    constructor(attributes: GPUVertexAttribute[]) {
        this._attributeFormats = VertexBuffer._parseAttributeFormats(attributes);

        [ this._vertexSizeBytes, this._itemsInVertex ] = VertexBuffer._processParsedVertexFormats(
            this._attributeFormats);

        this.layout = {
            stepMode: 'vertex',
            arrayStride: this._vertexSizeBytes,
            attributes,
        };
    }

    public initBuffer(vertexCount: number): void {
        this._buffer = new ArrayBuffer(this._vertexSizeBytes * vertexCount);
        this._dataView = new DataView(this._buffer);
        this._vertexCount = vertexCount;
    }

    public setData(data: number[]): void {
        if (!this._buffer || !this._dataView) {
            throw new VertexBufferError('The buffer was not initialized.');
        }

        const vertices = data.length / this._itemsInVertex;

        for (let v = 0; v < vertices; v++) {
            const partData = data.slice(v * this._vertexSizeBytes, (v + 1) * this._vertexSizeBytes);
            this.pushData(partData, v);
        }
    }

    public pushData(data: number[], vertexNumber: number): void {
        let offset = vertexNumber * this._vertexSizeBytes;
        let itemIndex = 0;
        for (const format of this._attributeFormats) {
            for (let n = 0; n < format.number; n++) {
                const item = data[itemIndex];

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

    private static _processParsedVertexFormats(parsedFormats: ParsedVertexFormat[]): [ number, number ] {
        let vertexSize = 0;
        let vertexItems = 0;

        parsedFormats.forEach((f) => {
            vertexSize += f.bytes * f.number;
            vertexItems += f.number;
        });

        return [
            vertexSize,
            vertexItems,
        ];
    }

    private static _parseAttributeFormats(attributes: GPUVertexAttribute[]): ParsedVertexFormat[] {
        return attributes.map((a) => {
            return VertexBuffer._parseVertexFormat(a.format);
        });
    }

    private static _parseVertexFormat(format: GPUVertexFormat): ParsedVertexFormat {
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
                type: matched[1] as VertexFormatType,
                bytes: +matched[2] / 8,
                number: +matched[3],
            };
        } else {
            return {
                type: matched[4] as VertexFormatType,
                bytes: +matched[5] / 8,
                number: 1,
            };
        }
    }
}

type VertexFormatType = 'uint' | 'sint' | 'unorm' | 'snorm' | 'float';

type ParsedVertexFormat = {
    type: VertexFormatType,
    bytes: number,
    number: number,
}