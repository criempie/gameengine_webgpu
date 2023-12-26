import { Figure } from '~/Renderer/figures/Figure';

export class RectFigure extends Figure {
    protected _indices: Uint16Array;
    protected _indexByteSize: number;

    protected _itemsInVertex: number;
    protected _itemInVertexByteSize: number;

    protected _verticesItems: Float32Array;
    protected _verticesCount: number;
    protected _vertexByteSize: number;

    constructor(x: number, y: number, width: number, height: number) {
        super({
            x, y, width, height,
        });

        this._verticesItems = new Float32Array([
            x, y, // top left
            x + width, y, // top right
            x + width, y + height, //bottom right
            x, y + height, // bottom left
        ]);

        this._itemInVertexByteSize = Float32Array.BYTES_PER_ELEMENT;
        this._itemsInVertex = 2;

        this._indices = new Uint16Array([
            0, 1, 2, 2, 3, 0,
        ]);

        this._indexByteSize = Uint16Array.BYTES_PER_ELEMENT;
        this._vertexByteSize = this._itemInVertexByteSize * this._itemsInVertex;

        this._verticesCount = this._verticesItems.length / this._itemsInVertex;
    }
}