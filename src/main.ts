import { Renderer } from '~/Renderer';

async function start() {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in your browser.');
    }

    const appElement = document.querySelector('#app')!;
    const canvas = document.createElement('canvas');
    appElement.append(canvas);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new Renderer();
    await renderer.init(navigator.gpu, canvas.getContext('webgpu')!);
    await renderer.drawSquare();
}

start();