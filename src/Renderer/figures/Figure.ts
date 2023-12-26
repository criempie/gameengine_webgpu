import { Position, Size } from '~/types';

export abstract class Figure {
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;

    // The number of values that compose one vertex.
    protected abstract _itemsInVertex: number;
    protected abstract _itemInVertexByteSize: number;

    protected abstract _verticesItems: Float32Array;
    protected abstract _verticesCount: number;
    protected abstract _vertexByteSize: number;

    protected abstract _indices: Uint16Array;
    protected abstract _indexByteSize: number;

    public get verticesItems(): Float32Array {
        return this._verticesItems;
    }

    public get verticesCount(): number {
        return this._verticesCount;
    }

    public get indices(): Uint16Array {
        return this._indices;
    }

    protected constructor(options: Position & Size) {
        this._x = options.x;
        this._y = options.y;
        this._width = options.width;
        this._height = options.height;
    }

    public getVertices(): Array<Float32Array> {
        const vertices = new Array(this._verticesCount);
        let vertexIndex = 0;

        for (let i = 0; i < this._verticesItems.length; i += this._itemsInVertex) {
            const vertex = new Float32Array(this._itemsInVertex);

            for (let j = 0; j < this._itemsInVertex; j++) {
                vertex[j] = this._verticesItems[i + j];
            }

            vertices[vertexIndex] = vertex;
            vertexIndex++;
        }

        return vertices;
    }
}