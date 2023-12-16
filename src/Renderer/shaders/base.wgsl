struct VIn {
	@location(0) position: vec2f,
}

struct VOut {
	@builtin(position) position : vec4f,
	@location(0) color: vec4f,
}

@vertex
fn vs(vin: VIn) -> VOut {
	var output: VOut;

	output.position = vec4f(vin.position, 0.0, 1.0);
	output.color = vec4f(vin.position, 0.5, 1.0);

	return output;
}

@fragment
fn fs(vout: VOut) -> @location(0) vec4f {
	return vout.color;
}