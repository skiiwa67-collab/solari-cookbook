struct Params {
  time: f32,
  pad: f32,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.xyx) * 0.1031);
  p3 = p3 + vec3f(dot(p3, p3.yzx + 33.33));
  return fract((p3.x + p3.y) * p3.z);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p: vec2f) -> f32 {
  var v = 0.0;
  var a = 0.5;
  var q = p;
  for (var i = 0; i < 4; i++) {
    v += a * noise(q);
    q = q * 2.03;
    a = a * 0.5;
  }
  return v;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time;
  let phone = params.pad;

  let trench = mix(vec2f(0.48, 0.74), vec2f(0.46, 0.80), phone);
  let vaporUv = uv * vec2f(2.3, 1.55) + vec2f(t * 0.016, -t * 0.011);
  let vapor = fbm(vaporUv);
  let vaporMask = smoothstep(0.40, 0.78, uv.y) * (1.0 - smoothstep(0.93, 1.0, uv.y));
  let vaporCol = vec3f(0.96, 0.88, 0.72) * vapor * vaporMask * 0.20;

  let flameP = uv - trench;
  let flameR = length(flameP * vec2f(1.2, 1.6));
  let breath = 0.70 + 0.30 * sin(t * 1.65);
  let lick = 0.10 * sin(t * 2.9 + uv.x * 16.0);
  let flame = exp(-flameR * (4.1 - lick)) * breath;
  let flameCol = vec3f(1.0, 0.52, 0.16) * flame * 0.82
    + vec3f(1.0, 0.84, 0.38) * flame * flame * 0.42;

  var spark = 0.0;
  let l0 = mix(vec2f(0.46, 0.26), vec2f(0.38, 0.30), phone);
  let l1 = mix(vec2f(0.48, 0.38), vec2f(0.42, 0.42), phone);
  let l2 = mix(vec2f(0.45, 0.48), vec2f(0.40, 0.52), phone);
  let l3 = mix(vec2f(0.51, 0.32), vec2f(0.52, 0.36), phone);
  let l4 = mix(vec2f(0.42, 0.34), vec2f(0.34, 0.38), phone);
  let l5 = mix(vec2f(0.50, 0.58), vec2f(0.48, 0.62), phone);
  let l6 = mix(vec2f(0.18, 0.72), vec2f(0.22, 0.78), phone);
  let l7 = mix(vec2f(0.62, 0.70), vec2f(0.58, 0.76), phone);
  let lights = array<vec2f, 8>(l0, l1, l2, l3, l4, l5, l6, l7);
  for (var i = 0; i < 8; i++) {
    let d = length((uv - lights[i]) * vec2f(1.75, 1.0));
    let tw = 0.32 + 0.68 * sin(t * (2.05 + f32(i) * 0.39) + f32(i) * 1.6);
    spark += exp(-d * 88.0) * tw;
  }
  let sparkCol = vec3f(1.0, 0.90, 0.60) * spark;

  return vec4f(vaporCol + flameCol + sparkCol, 1.0);
}
