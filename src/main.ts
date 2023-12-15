async function init() {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in your browser.');
    }

    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
    })

    if (!adapter) {
        throw new Error('Couldn\'t request WebGPU adapter.')
    }

    const device = await adapter.requestDevice();

    console.log(device);
}

init();