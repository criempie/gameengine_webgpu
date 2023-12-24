import { Position, Size } from '~/types';

export abstract class Figure {
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;

    // The number of values that compose one vertex.
    protected abstract _vertexConsists: number;

    protected abstract _vertices: Float32Array;
    protected abstract _indices: number[];

    public get verticesCount(): number {
        const count = this._vertices.length / this._vertexConsists;

        // If the number is not an integer, then the problem is in the declaration of variables.
        if (count % 1 !== 0) {
            throw new Error('vertices length contradicts vertexConsists');
        }

        return count;
    }

    public get verticesTotalSize(): number {
        return this.verticesCount * this.vertexSize;
    }

    public get vertexSize(): number {
        return this._vertexConsists * this.vertexItemSize;
    }

    public get vertexItemCount(): number {
        return this._vertexConsists;
    }

    public get vertexItemSize(): number {
        return Float32Array.BYTES_PER_ELEMENT;
    }

    public get indicesCount(): number {
        return this._indices.length;
    }

    public get indicesTotalSize(): number {
        return this.indexSize * this.indicesCount;
    }

    public get indexSize(): number {
        return Uint16Array.BYTES_PER_ELEMENT;
    }

    protected constructor(options: Position & Size) {
        this._x = options.x;
        this._y = options.y;
        this._width = options.width;
        this._height = options.height;
    }

    public getVertices(): Float32Array {
        return this._vertices;
    }

    public getIndices(offset: number = 0): Uint16Array {
        return new Uint16Array(this._indices.map((i) => i + offset));
    }
}