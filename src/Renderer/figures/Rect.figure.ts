import { Figure } from '~/Renderer/figures/Figure';

export class RectFigure extends Figure {
    protected _vertices: Float32Array;
    protected _indices: number[];
    protected _vertexConsists: number;

    constructor(x: number, y: number, width: number, height: number) {
        super({
            x, y, width, height,
        });

        this._vertices = new Float32Array([
            x, y, // top left
            x + width, y, // top right
            x + width, y + height, //bottom right
            x, y + height, // bottom left
        ]);

        this._vertexConsists = 2;

        this._indices = [
            0, 1, 2, 2, 3, 0,
        ];
    }
}