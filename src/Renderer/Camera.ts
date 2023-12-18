import { mat4 } from 'gl-matrix';
import { Position, Size } from '~/types';

export class Camera {
    public projectionMatrix: mat4;

    private _view: mat4;
    private _projection: mat4;

    constructor({ x, y, width, height }: Position & Size) {
        this.projectionMatrix = mat4.create();

        this._projection = mat4.ortho(mat4.create(), x, x + width, y + height, y, -1, 1);
        this._view = mat4.lookAt(mat4.create(), [ 0, 0, 1 ], [ 0, 0, 0 ], [ 0, 1, 0 ]);

        mat4.multiply(this.projectionMatrix, this._projection, this._view);
    }


}