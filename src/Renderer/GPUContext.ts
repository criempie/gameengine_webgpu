export class GPUContext {
    public static gpu: GPU;
    public static device: GPUDevice;

    public static canvasContext: GPUCanvasContext;
    public static canvasFormat: GPUTextureFormat;
    public static clearColor: GPUColorDict;

    public static init(options: GPUContextInit): void {
        GPUContext.gpu = options.gpu;
        GPUContext.device = options.device;
        GPUContext.canvasContext = options.canvasContext;
        GPUContext.canvasFormat = options.gpu.getPreferredCanvasFormat();
        GPUContext.clearColor = options.clearColor;

        GPUContext.canvasContext.configure({
            device: GPUContext.device,
            format: GPUContext.canvasFormat,
            alphaMode: 'premultiplied',
        });
    }
}

export type GPUContextInit = {
    gpu: GPU,
    device: GPUDevice,
    canvasContext: GPUCanvasContext,
    clearColor: GPUColorDict,
}