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

  // Flame stays in the trench. Hard ceiling so it never climbs the stack.
  let trench = mix(vec2f(0.50, 0.84), vec2f(0.50, 0.88), phone);
  let ground = smoothstep(0.74, 0.80, uv.y) * (1.0 - smoothstep(0.94, 0.99, uv.y));
  let vaporUv = uv * vec2f(2.1, 2.4) + vec2f(t * 0.014, t * 0.006);
  let vapor = fbm(vaporUv);
  let vaporMask = ground * (1.0 - 0.55 * smoothstep(0.0, 0.07, abs(uv.x - mix(0.49, 0.52, phone))));
  let vaporCol = vec3f(0.90, 0.88, 0.82) * vapor * vaporMask * 0.16;

  let flameP = (uv - trench) * vec2f(0.78, 4.6);
  let breath = 0.58 + 0.22 * sin(t * 1.35);
  let lick = 0.05 * sin(t * 2.4 + uv.x * 14.0);
  let flame = exp(-length(flameP) * (5.6 - lick)) * breath * ground;
  let flameCol = vec3f(1.0, 0.55, 0.18) * flame * 0.48
    + vec3f(1.0, 0.82, 0.40) * flame * flame * 0.22;

  // Pad / TE fixture twinkles. Never a bloom on the white tank.
  var spark = 0.0;
  let l0 = mix(vec2f(0.545, 0.28), vec2f(0.38, 0.28), phone);
  let l1 = mix(vec2f(0.556, 0.38), vec2f(0.36, 0.40), phone);
  let l2 = mix(vec2f(0.542, 0.48), vec2f(0.375, 0.52), phone);
  let l3 = mix(vec2f(0.18, 0.74), vec2f(0.22, 0.82), phone);
  let l4 = mix(vec2f(0.32, 0.80), vec2f(0.30, 0.86), phone);
  let l5 = mix(vec2f(0.62, 0.76), vec2f(0.62, 0.84), phone);
  let l6 = mix(vec2f(0.70, 0.72), vec2f(0.12, 0.70), phone);
  let l7 = mix(vec2f(0.08, 0.68), vec2f(0.72, 0.78), phone);
  let lights = array<vec2f, 8>(l0, l1, l2, l3, l4, l5, l6, l7);
  for (var i = 0; i < 8; i++) {
    let d = length((uv - lights[i]) * vec2f(2.1, 1.15));
    let tw = 0.28 + 0.72 * sin(t * (2.05 + f32(i) * 0.39) + f32(i) * 1.6);
    spark += exp(-d * 140.0) * tw;
  }
  let sparkCol = vec3f(1.0, 0.90, 0.62) * spark * 0.85;

  return vec4f(vaporCol + flameCol + sparkCol, 1.0);
}
