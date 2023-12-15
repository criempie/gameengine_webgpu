import { Renderer } from '~/Renderer';

async function start() {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in your browser.');
    }

    const renderer = new Renderer();
    await renderer.init(navigator.gpu);
}

start();