/**
 * Liquid Gradient — WebGL port of the Framer "Liquid Gradient" hero background.
 *
 * Usage: <canvas data-liquid-gradient></canvas>
 * The parameters below mirror the Framer component's controls.
 */
(() => {
  const SETTINGS = {
    colors: ['#000000', '#d3ef9d', '#000000', '#000000', '#d3ef9d'],
    colorsLight: ['#f4f4ef', '#c3e57e', '#f4f4ef', '#f4f4ef', '#c3e57e'], // "jour" theme
    seed: 648,
    speed: 1.6,      // Framer: 1.12
    scale: 0.29,
    amplitude: 0.42, // Framer: 0.6 (fewer folds)
    frequency: 0.1,
    definition: 7,   // warp iterations
    bands: 1.6,
    noise: 'smooth', // 'smooth' | 'none'
    amount: 0.05,    // grain amount
  };

  const VERTEX = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;

  const fragment = ({ colors, definition }) => `
  precision highp float;

  #define COLOR_COUNT ${colors.length}
  #define ITERATIONS ${definition}

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSeed;
  uniform float uScale;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uBands;
  uniform float uGrain;
  uniform vec3 uColors[COLOR_COUNT];

  vec3 palette(float t) {
    float x = clamp(t, 0.0, 1.0) * float(COLOR_COUNT - 1);
    vec3 color = uColors[0];
    for (int i = 1; i < COLOR_COUNT; i++) {
      color = mix(color, uColors[i], smoothstep(0.0, 1.0, x - float(i - 1)));
    }
    return color;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    vec2 p = uv * uScale * 6.0;
    float t = uTime;
    float seed = uSeed * 0.01;
    float freq = uFrequency * 10.0;

    // Iterative sine warp: each pass folds the plane a little more ("definition").
    for (int i = 1; i <= ITERATIONS; i++) {
      float fi = float(i);
      p.x += uAmplitude / fi * sin(fi * freq * p.y + t + seed * fi);
      p.y += uAmplitude / fi * cos(fi * freq * p.x - t * 0.7 + seed);
    }

    // Bands: mirror-repeat the color ramp so it never shows a seam.
    float v = (0.5 + 0.5 * sin(p.x + p.y)) * uBands;
    v = 1.0 - abs(fract(v * 0.5) * 2.0 - 1.0);
    vec3 color = palette(v);

    // Film grain.
    color += (hash(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * uGrain;

    gl_FragColor = vec4(color, 1.0);
  }
  `;

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function init(canvas, settings = SETTINGS) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment(settings)));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-screen triangle.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const u = (name) => gl.getUniformLocation(program, name);
    gl.uniform1f(u('uSeed'), settings.seed);
    gl.uniform1f(u('uScale'), settings.scale);
    gl.uniform1f(u('uAmplitude'), settings.amplitude);
    gl.uniform1f(u('uFrequency'), settings.frequency);
    gl.uniform1f(u('uBands'), settings.bands);
    gl.uniform1f(u('uGrain'), settings.noise === 'none' ? 0 : settings.amount);
    const uColors = u('uColors');
    const setColors = () => {
      const light = document.documentElement.dataset.theme === 'light';
      gl.uniform3fv(uColors, (light ? settings.colorsLight : settings.colors).flatMap(hexToRgb));
    };
    setColors();
    const uTime = u('uTime');
    const uResolution = u('uResolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const draw = (now) => {
      elapsed += (now - last) / 1000;
      last = now;
      gl.uniform1f(uTime, elapsed * settings.speed * 0.1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('is-ready');
      frame = visible && !reducedMotion.matches ? requestAnimationFrame(draw) : 0;
    };

    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };

    new ResizeObserver(() => { resize(); if (!frame) start(); }).observe(canvas);

    // Only animate while the hero is on screen.
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(canvas);

    // Repaint with the other palette when the theme switches (see theme.js).
    // Paint the new palette immediately so the page transition captures it.
    document.addEventListener('themechange', () => {
      setColors();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      start();
    });

    resize();
    start();
  }

  document.querySelectorAll('canvas[data-liquid-gradient]').forEach((canvas) => {
    try {
      init(canvas);
    } catch (error) {
      // The static background image stays visible as a fallback.
      console.warn('Liquid gradient disabled:', error);
    }
  });
})();
