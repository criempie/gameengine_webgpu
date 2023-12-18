import { Renderer } from '~/Renderer';
import { RectFigure } from '~/Renderer/figures/Rect.figure';

async function start() {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in your browser.');
    }

    const appElement = document.querySelector('#app')!;
    const canvas = document.createElement('canvas');
    appElement.append(canvas);

    canvas.style.width = '800px';
    canvas.style.height = '600px';
    canvas.style.border = '1px solid white';

    canvas.width = 800;
    canvas.height = 600;

    const renderer = new Renderer();
    await renderer.init(navigator.gpu, canvas.getContext('webgpu')!);

    const square = new RectFigure(100, 100, 150, 100);
    const square2 = new RectFigure(650, 50, 100, 200);
    const square3 = new RectFigure(50, 400, 700, 50);
    const square4 = new RectFigure(10, 10, 780, 580);

    await renderer.draw([ square, square2, square3, ]);
}

start();