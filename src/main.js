
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

import { Group, Tween, Easing } from '@tweenjs/tween.js';



// ============================================================================

// CONFIGURACIÓN. Distancias/tamaños visuales; periodos relativos astronómicos.

// ============================================================================

const TAU = Math.PI * 2;

const DEG = Math.PI / 180;

const CONFIG = Object.freeze({

  earthOrbitRate: 0.025,

  solarIntensity: 22000,

  ambientIntensity: 0.065,

  bloomStrength: 0.32,

  bloomRadius: 0.38,

  bloomThreshold: 1.8,

  earthCloudRotation: 0.106,

  useEarthCDN: true,

  textureTimeout: 12000,

  starCount: 6500

});



const QUALITY = {

  low: { dpr: 1, pixels: 1600000, bloom: false },

  balanced: { dpr: 1.35, pixels: 2800000, bloom: true },

  high: { dpr: 1.75, pixels: 4600000, bloom: true }

};



const SUN_DATA = {

  id: 'sun', name: 'El Sol', type: 'Estrella · G2 V', mode: 'sun',

  radius: 24, distance: 0, au: 0, years: Infinity, eccentricity: 0,

  inclination: 0, node: 0, tilt: 7.25, spin: 0.008, phase: 0,

  diameter: '1.392.700 km', period: 'Centro del sistema',

  description: 'Estrella que concentra aproximadamente el 99,86 % de la masa del Sistema Solar. Su fotosfera y corona se representan mediante plasma procedural.',

  exposure: 0.88

};



const PLANET_DATA = [

  {

    id: 'mercury', name: 'Mercurio', type: 'Planeta rocoso', mode: 'rock',

    radius: 2.4, distance: 45, au: 0.387, years: 0.240846,

    eccentricity: 0.2056, inclination: 7, node: 48.3, tilt: 0.034,

    spin: 0.0015, phase: 0.7, seed: 11,

    base: '#a29b91', detail: '#494846',

    diameter: '4.879 km', period: '88 días',

    description: 'Planeta rocoso más próximo al Sol, repleto de cráteres de impacto. Su órbita es notablemente excéntrica.',

    exposure: 1.05

  },

  {

    id: 'venus', name: 'Venus', type: 'Planeta rocoso · atmósfera densa',

    mode: 'venus', radius: 4, distance: 70, au: 0.723, years: 0.615198,

    eccentricity: 0.0068, inclination: 3.39, node: 76.7, tilt: 177.4,

    spin: 0.0004, phase: 2.2, seed: 22,

    base: '#e5d4ac', detail: '#a58c64',

    atmosphere: '#dfbb83', atmosphereStrength: 0.13,

    diameter: '12.104 km', period: '225 días',

    description: 'Un manto de nubes oculta su superficie. Su atmósfera produce un efecto invernadero extremo y su rotación es retrógrada.',

    exposure: 1.12

  },

  {

    id: 'earth', name: 'La Tierra', type: 'Planeta rocoso · mundo oceánico',

    mode: 'earth', radius: 4.4, distance: 105, au: 1, years: 1,

    eccentricity: 0.0167, inclination: 0, node: 0, tilt: 23.44,

    spin: 0.09, phase: 3.6, seed: 33,

    base: '#477a49', detail: '#173b69',

    atmosphere: '#428dff', atmosphereStrength: 0.3,

    diameter: '12.742 km', period: '365,26 días',

    description: 'Nuestro mundo, con biosfera activa y agua superficial. La superficie, las nubes y la atmósfera son capas independientes.',

    exposure: 1.35

  },

  {

    id: 'mars', name: 'Marte', type: 'Planeta rocoso',

    mode: 'rock', radius: 3, distance: 145, au: 1.524, years: 1.8808,

    eccentricity: 0.0934, inclination: 1.85, node: 49.6, tilt: 25.19,

    spin: 0.087, phase: 5, seed: 44,

    base: '#c78057', detail: '#643d30',

    atmosphere: '#cf7952', atmosphereStrength: 0.07,

    diameter: '6.779 km', period: '687 días',

    description: 'El planeta rojo está cubierto de regolito rico en óxidos de hierro. Conserva casquetes polares y una atmósfera muy tenue.',

    exposure: 1.65

  },

  {

    id: 'jupiter', name: 'Júpiter', type: 'Gigante gaseoso',

    mode: 'gas', radius: 12, distance: 215, au: 5.203, years: 11.862,

    eccentricity: 0.0489, inclination: 1.3, node: 100.5, tilt: 3.13,

    spin: 0.218, phase: 0.25, seed: 55,

    base: '#e3ceac', detail: '#92745e',

    diameter: '139.820 km', period: '11,86 años',

    description: 'El mayor planeta del sistema. Sus bandas atmosféricas y tormentas se generan proceduralmente; no representan meteorología en tiempo real.',

    exposure: 2.3

  },

  {

    id: 'saturn', name: 'Saturno', type: 'Gigante gaseoso · anillos',

    mode: 'gas', radius: 9.8, distance: 290, au: 9.537, years: 29.457,

    eccentricity: 0.0565, inclination: 2.49, node: 113.7, tilt: 26.73,

    spin: 0.202, phase: 1.75, seed: 66,

    base: '#e8d7ae', detail: '#ad9672', rings: true,

    diameter: '116.460 km', period: '29,46 años',

    description: 'Sus anillos están formados principalmente por partículas de hielo. Comparten el plano ecuatorial y reciben y proyectan sombras analíticas.',

    exposure: 2.8

  },

  {

    id: 'uranus', name: 'Urano', type: 'Gigante de hielo',

    mode: 'ice', radius: 6.2, distance: 350, au: 19.191, years: 84.017,

    eccentricity: 0.0457, inclination: 0.77, node: 74, tilt: 97.77,

    spin: 0.125, phase: 3.9, seed: 77,

    base: '#a3dce1', detail: '#70b6c6',

    atmosphere: '#76cde9', atmosphereStrength: 0.13,

    diameter: '50.724 km', period: '84,02 años',

    description: 'Gigante de hielo cuyo eje de rotación está casi tumbado respecto a su plano orbital. Su color procede de la absorción atmosférica.',

    exposure: 3.4

  },

  {

    id: 'neptune', name: 'Neptuno', type: 'Gigante de hielo',

    mode: 'ice', radius: 6, distance: 410, au: 30.07, years: 164.79,

    eccentricity: 0.0113, inclination: 1.77, node: 131.8, tilt: 28.32,

    spin: 0.134, phase: 5.3, seed: 88,

    base: '#619ae5', detail: '#315da4',

    atmosphere: '#467df0', atmosphereStrength: 0.18,

    diameter: '49.244 km', period: '164,79 años',

    description: 'Mundo azulado con una atmósfera dinámica y vientos extremos. La exposición de inspección compensa parcialmente su menor iluminación.',

    exposure: 3.8

  }

];



// ============================================================================

// UTILIDADES PROCEDURALES DETERMINISTAS

// ============================================================================

function makeCanvas(width, height) {

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  return canvas;

}



function randomGenerator(seed) {

  return () => {

    seed |= 0;

    seed = (seed + 0x6D2B79F5) | 0;

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

  };

}



function hash3(x, y, z, seed) {

  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263)

    ^ Math.imul(z, 2147483647) ^ seed;

  h = Math.imul(h ^ (h >>> 13), 1274126177);

  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;

}



function noise3(x, y, z, seed) {

  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);

  x -= ix; y -= iy; z -= iz;

  x = x * x * (3 - 2 * x);

  y = y * y * (3 - 2 * y);

  z = z * z * (3 - 2 * z);

  const a = hash3(ix, iy, iz, seed);

  const b = hash3(ix + 1, iy, iz, seed);

  const c = hash3(ix, iy + 1, iz, seed);

  const d = hash3(ix + 1, iy + 1, iz, seed);

  const e = hash3(ix, iy, iz + 1, seed);

  const f = hash3(ix + 1, iy, iz + 1, seed);

  const g = hash3(ix, iy + 1, iz + 1, seed);

  const h = hash3(ix + 1, iy + 1, iz + 1, seed);

  const lo = (a + (b - a) * x) * (1 - y) + (c + (d - c) * x) * y;

  const hi = (e + (f - e) * x) * (1 - y) + (g + (h - g) * x) * y;

  return lo + (hi - lo) * z;

}



function fbmCPU(x, y, z, seed) {

  let value = 0, amplitude = 0.5;

  for (let i = 0; i < 4; i++) {

    value += amplitude * noise3(x, y, z, seed + i * 101);

    x = x * 2.03 + 11.7;

    y = y * 2.03 + 7.3;

    z = z * 2.03 + 4.9;

    amplitude *= 0.5;

  }

  return value / 0.9375;

}



function smooth(a, b, x) {

  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);

  return t * t * (3 - 2 * t);

}



function rgb(hex) {

  const n = parseInt(hex.slice(1), 16);

  return [n >> 16, (n >> 8) & 255, n & 255];

}



function addCraters(colorCanvas, heightCanvas, seed, count) {

  const random = randomGenerator(seed);

  const color = colorCanvas.getContext('2d');

  const height = heightCanvas.getContext('2d');

  const w = colorCanvas.width, h = colorCanvas.height;



  for (let i = 0; i < count; i++) {

    const x = random() * w;

    const y = h * (0.13 + random() * 0.74);

    const radius = 2 + Math.pow(random(), 2) * 15;



    for (const shift of [-w, 0, w]) {

      const px = x + shift;

      const cg = color.createRadialGradient(px, y, 0, px, y, radius);

      cg.addColorStop(0, 'rgba(15,12,10,.22)');

      cg.addColorStop(0.65, 'rgba(15,12,10,.16)');

      cg.addColorStop(0.8, 'rgba(230,220,205,.18)');

      cg.addColorStop(1, 'rgba(230,220,205,0)');

      color.fillStyle = cg;

      color.fillRect(px - radius, y - radius, radius * 2, radius * 2);



      const hg = height.createRadialGradient(px, y, 0, px, y, radius);

      hg.addColorStop(0, 'rgba(35,35,35,.8)');

      hg.addColorStop(0.62, 'rgba(65,65,65,.75)');

      hg.addColorStop(0.82, 'rgba(220,220,220,.75)');

      hg.addColorStop(1, 'rgba(128,128,128,0)');

      height.fillStyle = hg;

      height.fillRect(px - radius, y - radius, radius * 2, radius * 2);

    }

  }

}



function normalCanvasFromHeight(canvas, strength = 4) {

  const w = canvas.width, h = canvas.height;

  const source = canvas.getContext('2d').getImageData(0, 0, w, h).data;

  const result = makeCanvas(w, h);

  const ctx = result.getContext('2d');

  const image = ctx.createImageData(w, h);

  const out = image.data;



  for (let y = 0; y < h; y++) {

    const up = Math.max(0, y - 1), down = Math.min(h - 1, y + 1);

    for (let x = 0; x < w; x++) {

      const left = (x + w - 1) % w, right = (x + 1) % w;

      let nx = -(source[(y * w + right) * 4] - source[(y * w + left) * 4]) * strength / 255;

      let ny = (source[(down * w + x) * 4] - source[(up * w + x) * 4]) * strength / 255;

      const invLength = 1 / Math.sqrt(nx * nx + ny * ny + 1);

      nx *= invLength; ny *= invLength;

      const k = (y * w + x) * 4;

      out[k] = (nx * 0.5 + 0.5) * 255;

      out[k + 1] = (ny * 0.5 + 0.5) * 255;

      out[k + 2] = (invLength * 0.5 + 0.5) * 255;

      out[k + 3] = 255;

    }

  }

  ctx.putImageData(image, 0, 0);

  return result;

}



function makeSurfaceMaps(data, texture) {

  const earth = data.mode === 'earth';

  const rocky = earth || data.mode === 'rock';

  const w = earth ? 1024 : 512, h = w / 2;

  const canvas = makeCanvas(w, h);

  const ctx = canvas.getContext('2d');

  const image = ctx.createImageData(w, h);

  const pixels = image.data;

  const heightCanvas = rocky ? makeCanvas(w, h) : null;

  const roughCanvas = rocky ? makeCanvas(w, h) : null;

  const heightCtx = heightCanvas?.getContext('2d');

  const roughCtx = roughCanvas?.getContext('2d');

  const heights = heightCtx?.createImageData(w, h);

  const roughness = roughCtx?.createImageData(w, h);

  const base = rgb(data.base), detail = rgb(data.detail);

  const cos = new Float32Array(w), sin = new Float32Array(w);



  for (let x = 0; x < w; x++) {

    cos[x] = Math.cos(x / w * TAU);

    sin[x] = Math.sin(x / w * TAU);

  }



  for (let y = 0; y < h; y++) {

    const v = y / (h - 1);

    const latitude = (0.5 - v) * Math.PI;

    const sy = Math.sin(latitude), radial = Math.cos(latitude);

    for (let x = 0; x < w; x++) {

      const sx = cos[x] * radial, sz = sin[x] * radial;

      const n = fbmCPU(sx * 4.5, sy * 4.5, sz * 4.5, data.seed);

      const fine = noise3(sx * 58, sy * 58, sz * 58, data.seed + 29);

      let r, g, b, elevation = n, rough = 0.92;



      if (earth) {

        const continent = fbmCPU(sx * 2.4 + 3, sy * 2.4, sz * 2.4 - 5, 943);

        const land = continent > 0.505;

        const coast = smooth(0.505, 0.54, continent);

        const polar = smooth(0.84, 0.96, Math.abs(sy) + (n - 0.5) * 0.08);

        const desert = smooth(0.52, 0.7, n) * (1 - Math.abs(sy));



        if (land) {

          r = 47 + coast * 24 + desert * 70;

          g = 74 + coast * 32 + desert * 44;

          b = 43 + coast * 17 + desert * 34;

          elevation = 0.48 + coast * n * 0.28;

          rough = 0.86 + fine * 0.1;

        } else {

          r = 12 + n * 8;

          g = 35 + n * 18;

          b = 66 + n * 29;

          elevation = 0.46;

          rough = 0.2;

        }



        r += (226 - r) * polar;

        g += (234 - g) * polar;

        b += (237 - b) * polar;

        elevation += polar * 0.035;

        rough += (0.82 - rough) * polar;

      } else {

        let blend = THREE.MathUtils.clamp((n - 0.25) * 1.7, 0, 1);



        if (data.mode === 'gas' || data.mode === 'ice') {

          const band = 0.5 + 0.5 * Math.sin((v + (n - 0.5) * 0.035) * Math.PI * 27);

          const thin = 0.5 + 0.5 * Math.sin(v * Math.PI * 116 + n * 7);

          blend = data.mode === 'ice'

            ? 0.55 + (band - 0.5) * 0.14 + (n - 0.5) * 0.22

            : 0.18 + band * 0.55 + thin * 0.12 + n * 0.1;

        } else if (data.mode === 'venus') {

          blend = 0.48 + (n - 0.5) * 0.6

            + Math.sin(v * 25 + n * 5) * 0.055;

        }



        const grain = rocky ? (fine - 0.5) * 11 : (fine - 0.5) * 2;

        r = detail[0] + (base[0] - detail[0]) * blend + grain;

        g = detail[1] + (base[1] - detail[1]) * blend + grain;

        b = detail[2] + (base[2] - detail[2]) * blend + grain;



        if (data.id === 'mars') {

          const ice = smooth(0.94, 0.985, Math.abs(sy) + (n - 0.5) * 0.035);

          r += (216 - r) * ice;

          g += (209 - g) * ice;

          b += (198 - b) * ice;

        }

        rough = 0.82 + n * 0.16;

      }



      const k = (y * w + x) * 4;

      pixels[k] = r; pixels[k + 1] = g; pixels[k + 2] = b; pixels[k + 3] = 255;



      if (rocky) {

        const height = THREE.MathUtils.clamp(elevation, 0, 1) * 255;

        heights.data[k] = heights.data[k + 1] = heights.data[k + 2] = height;

        heights.data[k + 3] = 255;

        roughness.data[k] = roughness.data[k + 1] = roughness.data[k + 2] = rough * 255;

        roughness.data[k + 3] = 255;

      }

    }

  }



  ctx.putImageData(image, 0, 0);

  if (rocky) {

    heightCtx.putImageData(heights, 0, 0);

    roughCtx.putImageData(roughness, 0, 0);

  }



  if (data.id === 'mercury' || data.id === 'mars') {

    addCraters(canvas, heightCanvas, data.seed, data.id === 'mercury' ? 105 : 36);

  }



  if (data.id === 'jupiter') {

    ctx.save();

    ctx.translate(w * 0.73, h * 0.62);

    ctx.scale(2.15, 1);

    const storm = ctx.createRadialGradient(0, 0, 1, 0, 0, 13);

    storm.addColorStop(0, 'rgba(149,81,53,.9)');

    storm.addColorStop(0.5, 'rgba(188,118,77,.85)');

    storm.addColorStop(0.8, 'rgba(216,168,123,.65)');

    storm.addColorStop(1, 'rgba(216,168,123,0)');

    ctx.fillStyle = storm;

    ctx.fillRect(-14, -14, 28, 28);

    ctx.restore();

  }



  return {

    map: texture(canvas, true),

    roughnessMap: rocky ? texture(roughCanvas, false) : null,

    normalMap: rocky ? texture(normalCanvasFromHeight(heightCanvas, earth ? 3 : 4), false) : null

  };

}



function makeCloudTexture(texture) {

  const w = 1024, h = 512;

  const canvas = makeCanvas(w, h), ctx = canvas.getContext('2d');

  const image = ctx.createImageData(w, h);

  const cos = new Float32Array(w), sin = new Float32Array(w);



  for (let x = 0; x < w; x++) {

    cos[x] = Math.cos(x / w * TAU);

    sin[x] = Math.sin(x / w * TAU);

  }



  for (let y = 0; y < h; y++) {

    const latitude = (0.5 - y / (h - 1)) * Math.PI;

    const sy = Math.sin(latitude), radial = Math.cos(latitude);

    for (let x = 0; x < w; x++) {

      const sx = cos[x] * radial, sz = sin[x] * radial;

      const weather = fbmCPU(sx * 6 + sy * 1.4, sy * 8, sz * 6, 119);

      const detail = noise3(sx * 38, sy * 38, sz * 38, 201);

      const density = smooth(0.47, 0.7, weather + (detail - 0.5) * 0.12);

      const k = (y * w + x) * 4;

      image.data[k] = 245;

      image.data[k + 1] = 248;

      image.data[k + 2] = 255;

      image.data[k + 3] = density * 215;

    }

  }

  ctx.putImageData(image, 0, 0);

  return texture(canvas, true);

}



function makeRingTexture(texture) {

  const width = 1024, canvas = makeCanvas(width, 4);

  const ctx = canvas.getContext('2d');

  const image = ctx.createImageData(width, 4);

  const alpha = new Float32Array(width);

  const random = randomGenerator(704);



  for (let x = 0; x < width; x++) {

    const u = x / (width - 1);

    const radius = 1.35 + u * 0.95;

    const micro = 0.5 + 0.5 * Math.sin(u * 1720 + Math.sin(u * 390) * 2);

    const broad = 0.5 + 0.5 * Math.sin(u * 41 + Math.sin(u * 17));

    let opacity = 0.36 + broad * 0.38 + micro * 0.16 + random() * 0.07;

    opacity *= smooth(0, 0.025, u) * (1 - smooth(0.975, 1, u));

    const cassini = smooth(2.015, 2.025, radius) * (1 - smooth(2.075, 2.085, radius));

    const encke = smooth(2.215, 2.22, radius) * (1 - smooth(2.229, 2.234, radius));

    opacity *= (1 - cassini * 0.97) * (1 - encke * 0.82);

    if (radius < 1.55) opacity *= 0.48;

    alpha[x] = opacity;



    const brightness = 0.65 + broad * 0.23 + micro * 0.12;

    for (let y = 0; y < 4; y++) {

      const k = (y * width + x) * 4;

      image.data[k] = 221 * brightness;

      image.data[k + 1] = 204 * brightness;

      image.data[k + 2] = 170 * brightness;

      image.data[k + 3] = opacity * 255;

    }

  }



  ctx.putImageData(image, 0, 0);

  const map = texture(canvas, true);

  map.wrapS = THREE.ClampToEdgeWrapping;

  map.wrapT = THREE.ClampToEdgeWrapping;

  return { map, alpha };

}



// ============================================================================

// GLSL. Los materiales escriben en HDR lineal; OutputPass convierte una vez.

// ============================================================================

const NOISE_GLSL = `

float hashNoise(vec3 p) {

  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));

  p *= 17.0;

  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));

}

float noise3D(vec3 p) {

  vec3 i = floor(p), f = fract(p);

  f = f * f * (3.0 - 2.0 * f);

  return mix(

    mix(mix(hashNoise(i), hashNoise(i + vec3(1,0,0)), f.x),

        mix(hashNoise(i + vec3(0,1,0)), hashNoise(i + vec3(1,1,0)), f.x), f.y),

    mix(mix(hashNoise(i + vec3(0,0,1)), hashNoise(i + vec3(1,0,1)), f.x),

        mix(hashNoise(i + vec3(0,1,1)), hashNoise(i + vec3(1,1,1)), f.x), f.y),

    f.z

  );

}

float fbm(vec3 p) {

  float value = 0.0, amplitude = 0.5;

  for (int i = 0; i < 4; i++) {

    value += amplitude * noise3D(p);

    p = p * 2.03 + vec3(7.1, 3.7, 9.2);

    amplitude *= 0.5;

  }

  return value / 0.9375;

}

`;



const SUN_VERTEX = `

uniform float uTime;

varying vec3 vLocal;

varying vec3 vNormalView;

varying vec3 vToCamera;

${NOISE_GLSL}

void main() {

  vLocal = position;

  float turbulence = noise3D(position * 9.0 + vec3(0.0, uTime * 0.13, 0.0));

  vec3 displaced = position * (1.0 + (turbulence - 0.5) * 0.009);

  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

  vNormalView = normalize(normalMatrix * normal);

  vToCamera = -mv.xyz;

  gl_Position = projectionMatrix * mv;

}

`;



const SUN_FRAGMENT = `

uniform float uTime;

varying vec3 vLocal;

varying vec3 vNormalView;

varying vec3 vToCamera;

${NOISE_GLSL}

void main() {

  vec3 p = normalize(vLocal);

  vec3 drift = vec3(uTime * 0.045, -uTime * 0.07, uTime * 0.028);

  float flow = fbm(p * 4.7 + drift);

  float convection = noise3D(p * 48.0 + flow * 5.0 - drift * 2.1);

  float filament = noise3D(p * 19.0 + flow * 7.0 + drift * 1.7);

  float ridge = 1.0 - abs(filament * 2.0 - 1.0);

  float heat = smoothstep(0.28, 0.83,

    flow * 0.54 + convection * 0.28 + ridge * ridge * ridge * 0.22);

  vec3 color = mix(vec3(0.85, 0.045, 0.004), vec3(4.2, 1.1, 0.12), heat);

  color = mix(color, vec3(7.2, 4.8, 1.65), smoothstep(0.76, 0.98, heat));

  float mu = max(dot(normalize(vNormalView), normalize(vToCamera)), 0.0);

  color *= 0.5 + 0.5 * pow(mu, 0.4);

  color *= 0.84 + convection * 0.24;

  gl_FragColor = vec4(color, 1.0);

}

`;



const SHELL_VERTEX = `

varying vec3 vWorld;

varying vec3 vWorldNormal;

varying vec3 vLocal;

void main() {

  vec4 world = modelMatrix * vec4(position, 1.0);

  vWorld = world.xyz;

  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  vLocal = position;

  gl_Position = projectionMatrix * viewMatrix * world;

}

`;



const CORONA_FRAGMENT = `

uniform float uTime;

varying vec3 vWorld;

varying vec3 vWorldNormal;

varying vec3 vLocal;

${NOISE_GLSL}

void main() {

  vec3 viewDirection = normalize(cameraPosition - vWorld);

  float facing = abs(dot(normalize(vWorldNormal), viewDirection));

  float fresnel = pow(clamp(1.0 - facing, 0.0, 1.0), 2.2);

  float strands = noise3D(normalize(vLocal) * 23.0

    + vec3(uTime * 0.06, -uTime * 0.1, 0.0));

  float alpha = fresnel * (0.12 + strands * 0.21);

  vec3 emission = mix(vec3(2.5, 0.32, 0.025), vec3(3.2, 0.8, 0.12), strands);

  gl_FragColor = vec4(emission, alpha);

}

`;



const ATMOSPHERE_FRAGMENT = `

uniform vec3 uColor;

uniform float uStrength;

varying vec3 vWorld;

varying vec3 vWorldNormal;

varying vec3 vLocal;

void main() {

  vec3 n = normalize(vWorldNormal);

  vec3 viewDirection = normalize(cameraPosition - vWorld);

  vec3 lightDirection = normalize(-vWorld);

  float facing = abs(dot(n, viewDirection));

  float rim = pow(clamp(1.0 - facing, 0.0, 1.0), 2.5);

  float day = smoothstep(-0.24, 0.42, dot(n, lightDirection));

  float forward = pow(max(dot(viewDirection, -lightDirection), 0.0), 6.0);

  float alpha = rim * uStrength * (0.045 + day * 0.955);

  vec3 scattering = uColor * (0.8 + day * 0.65 + forward * 0.18);

  gl_FragColor = vec4(scattering, alpha);

}

`;



// ============================================================================

// APLICACIÓN Y CICLO DE VIDA

// ============================================================================

function createApp() {

  const canvas = document.querySelector('#webgl');

  if (!(canvas instanceof HTMLCanvasElement)) {

    throw new Error('No se encuentra el canvas #webgl del index.html.');

  }



  const resources = new Set();

  const events = new AbortController();

  let renderer, composer, controls, ui, tweenGroup;

  let alive = true;



  const own = resource => {

    resources.add(resource);

    return resource;

  };



  const release = resource => {

    if (!resource) return;

    resources.delete(resource);

    resource.dispose();

  };



  const listen = (target, event, callback, options = {}) => {

    target.addEventListener(event, callback, { ...options, signal: events.signal });

  };



  function dispose() {

    if (!alive) return;

    alive = false;

    renderer?.setAnimationLoop(null);

    events.abort();

    tweenGroup?.removeAll();

    controls?.dispose();

    if (composer) {

      for (const pass of composer.passes) pass.dispose?.();

      composer.dispose();

    }

    for (const resource of resources) resource.dispose();

    resources.clear();

    renderer?.dispose();

    ui?.remove();

    canvas.style.cursor = '';

  }



  try {

    // ------------------------------------------------------------------------

    // Renderer, escena, cámara y pipeline HDR.

    // FXAA final evita MSAA costoso en todos los render targets del compositor.

    // ------------------------------------------------------------------------

    renderer = new THREE.WebGLRenderer({

      canvas, antialias: false, alpha: false,

      powerPreference: 'high-performance'

    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.setClearColor(0x010206, 1);



    const hdrAvailable = renderer.extensions.has('EXT_color_buffer_float');

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, 1, 0.08, 18000);

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



    controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true;

    controls.dampingFactor = 0.075;

    controls.rotateSpeed = 0.55;

    controls.zoomSpeed = 0.85;

    controls.panSpeed = 0.65;

    controls.minPolarAngle = 0.025;

    controls.maxPolarAngle = Math.PI - 0.025;

    controls.minDistance = 35;

    controls.screenSpacePanning = false;

    canvas.setAttribute('aria-label', 'Explorador tridimensional del Sistema Solar');

    canvas.tabIndex = 0;



    const target = new THREE.WebGLRenderTarget(1, 1, {

      type: hdrAvailable ? THREE.HalfFloatType : THREE.UnsignedByteType,

      format: THREE.RGBAFormat,

      depthBuffer: true,

      stencilBuffer: false

    });

    target.texture.colorSpace = THREE.NoColorSpace;



    composer = new EffectComposer(renderer, target);

    const renderPass = new RenderPass(scene, camera);

    const bloom = new UnrealBloomPass(

      new THREE.Vector2(1, 1),

      CONFIG.bloomStrength,

      CONFIG.bloomRadius,

      CONFIG.bloomThreshold

    );

    const output = new OutputPass();

    const fxaa = new ShaderPass(FXAAShader);

    fxaa.material.toneMapped = false;

    composer.addPass(renderPass);

    composer.addPass(bloom);

    composer.addPass(output);

    composer.addPass(fxaa);



    const sunlight = new THREE.PointLight(0xfff5e6, CONFIG.solarIntensity, 0, 2);

    scene.add(sunlight);

    scene.add(new THREE.AmbientLight(0x8ca1ba, CONFIG.ambientIntensity));



    let quality = 'balanced';

    let pixelRatio = 1;

    let paused = false;

    let simulationSpeed = 1;

    let simulationTime = 0;

    let elapsed = 0;

    let previousTimestamp = null;

    let contextLost = false;

    let showOrbits = true;



    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    function texture(canvasSource, color) {

      const map = own(new THREE.CanvasTexture(canvasSource));

      map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;

      map.wrapS = THREE.RepeatWrapping;

      map.wrapT = THREE.ClampToEdgeWrapping;

      map.anisotropy = anisotropy;

      return map;

    }



    const sphere = own(new THREE.SphereGeometry(1, 64, 40));

    const solarTime = { value: 0 };



    // ------------------------------------------------------------------------

    // Fondo estelar: puntos suaves, sin cubo de partículas ni parpadeo aleatorio.

    // Se centra en la cámara para representar fuentes prácticamente infinitas.

    // ------------------------------------------------------------------------

    const starRandom = randomGenerator(6201);

    const starPositions = new Float32Array(CONFIG.starCount * 3);

    const starColors = new Float32Array(CONFIG.starCount * 3);

    const starSizes = new Float32Array(CONFIG.starCount);

    const starColor = new THREE.Color();



    for (let i = 0; i < CONFIG.starCount; i++) {

      const azimuth = starRandom() * TAU;

      let y = starRandom() * 2 - 1;

      if (i > CONFIG.starCount * 0.72) {

        y = (starRandom() + starRandom() + starRandom() - 1.5) * 0.19;

      }

      const radial = Math.sqrt(Math.max(0, 1 - y * y));

      const distance = 5500 + starRandom() * 1700;

      const k = i * 3;

      starPositions[k] = Math.cos(azimuth) * radial * distance;

      starPositions[k + 1] = y * distance;

      starPositions[k + 2] = Math.sin(azimuth) * radial * distance;



      const choice = starRandom();

      starColor.set(choice < 0.16 ? 0xa8c6ff : choice > 0.84 ? 0xffd4a3 : 0xe5edff);

      starColor.multiplyScalar(0.25 + starRandom() * 0.65);

      starColors[k] = starColor.r;

      starColors[k + 1] = starColor.g;

      starColors[k + 2] = starColor.b;

      starSizes[i] = 0.85 + Math.pow(starRandom(), 5) * 2.5;

    }



    const starGeometry = own(new THREE.BufferGeometry());

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));

    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));



    const starMaterial = own(new THREE.ShaderMaterial({

      uniforms: { uPixelRatio: { value: 1 } },

      vertexShader: `

        attribute vec3 aColor;

        attribute float aSize;

        uniform float uPixelRatio;

        varying vec3 vColor;

        void main() {

          vColor = aColor;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

          gl_PointSize = max(1.0, aSize * uPixelRatio);

        }

      `,

      fragmentShader: `

        varying vec3 vColor;

        void main() {

          vec2 p = gl_PointCoord * 2.0 - 1.0;

          float r2 = dot(p, p);

          if (r2 > 1.0) discard;

          float alpha = exp(-r2 * 3.8) * (1.0 - smoothstep(0.65, 1.0, r2));

          gl_FragColor = vec4(vColor, alpha);

        }

      `,

      transparent: true,

      depthWrite: false

    }));



    const stars = new THREE.Points(starGeometry, starMaterial);

    stars.frustumCulled = false;

    stars.renderOrder = -20;

    stars.rotation.z = 0.43;

    scene.add(stars);



    // Una única geometría de órbita se escala y desplaza para cada elipse.

    const orbitVertices = new Float32Array(256 * 3);

    for (let i = 0; i < 256; i++) {

      const a = i / 256 * TAU;

      orbitVertices[i * 3] = Math.cos(a);

      orbitVertices[i * 3 + 2] = Math.sin(a);

    }

    const orbitGeometry = own(new THREE.BufferGeometry());

    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(orbitVertices, 3));



    // ------------------------------------------------------------------------

    // CelestialBody: marco orbital, eje, superficie y capas independientes.

    // ------------------------------------------------------------------------

    class CelestialBody {

      constructor(data) {

        this.data = data;

        this.world = new THREE.Vector3();

        this.extent = data.radius * (data.rings ? 2.3 : data.id === 'sun' ? 1.11 : 1.04);

        this.frame = new THREE.Group();

        this.frame.rotation.set(data.inclination * DEG, data.node * DEG, 0, 'YXZ');

        scene.add(this.frame);



        this.root = new THREE.Group();

        this.frame.add(this.root);

        this.axis = new THREE.Group();

        this.axis.rotation.z = data.tilt * DEG;

        this.axis.scale.setScalar(data.radius);

        this.root.add(this.axis);



        if (data.mode === 'sun') {

          this.material = own(new THREE.ShaderMaterial({

            uniforms: { uTime: solarTime },

            vertexShader: SUN_VERTEX,

            fragmentShader: SUN_FRAGMENT

          }));

        } else {

          const maps = makeSurfaceMaps(data, texture);

          const parameters = {

            ...maps, metalness: 0, roughness: maps.roughnessMap ? 1 : 0.96,

            normalScale: new THREE.Vector2(data.mode === 'earth' ? 0.6 : 0.42, data.mode === 'earth' ? 0.6 : 0.42)

          };

          this.material = own(data.mode === 'earth'

            ? new THREE.MeshPhysicalMaterial({ ...parameters, ior: 1.38 })

            : new THREE.MeshStandardMaterial(parameters));

        }



        this.surface = new THREE.Mesh(sphere, this.material);

        this.surface.userData.body = this;

        this.axis.add(this.surface);



        if (data.distance) {

          const orbitMaterial = own(new THREE.LineBasicMaterial({

            color: 0x456174, transparent: true, opacity: 0.23, depthWrite: false

          }));

          this.orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);

          this.orbit.scale.set(

            data.distance, 1,

            data.distance * Math.sqrt(1 - data.eccentricity ** 2)

          );

          this.orbit.position.x = -data.distance * data.eccentricity;

          this.frame.add(this.orbit);

        }



        if (data.mode === 'sun') {

          const coronaMaterial = own(new THREE.ShaderMaterial({

            uniforms: { uTime: solarTime },

            vertexShader: SHELL_VERTEX,

            fragmentShader: CORONA_FRAGMENT,

            side: THREE.BackSide,

            blending: THREE.AdditiveBlending,

            transparent: true,

            depthWrite: false

          }));

          this.corona = new THREE.Mesh(sphere, coronaMaterial);

          this.corona.scale.setScalar(1.11);

          this.corona.renderOrder = 3;

          this.axis.add(this.corona);

        }



        if (data.mode === 'earth') {

          const cloudMaterial = own(new THREE.MeshStandardMaterial({

            map: makeCloudTexture(texture),

            roughness: 1,

            metalness: 0,

            transparent: true,

            opacity: 0.87,

            alphaTest: 0.015,

            depthWrite: false

          }));

          this.clouds = new THREE.Mesh(sphere, cloudMaterial);

          this.clouds.scale.setScalar(1.012);

          this.clouds.rotation.y = 0.4;

          this.clouds.renderOrder = 2;

          this.axis.add(this.clouds);

        }



        if (data.atmosphere) {

          const atmosphereMaterial = own(new THREE.ShaderMaterial({

            uniforms: {

              uColor: { value: new THREE.Color(data.atmosphere) },

              uStrength: { value: data.atmosphereStrength }

            },

            vertexShader: SHELL_VERTEX,

            fragmentShader: ATMOSPHERE_FRAGMENT,

            side: THREE.BackSide,

            blending: THREE.AdditiveBlending,

            transparent: true,

            depthWrite: false

          }));

          this.atmosphere = new THREE.Mesh(sphere, atmosphereMaterial);

          this.atmosphere.scale.setScalar(data.mode === 'earth' ? 1.038 : 1.028);

          this.atmosphere.renderOrder = 3;

          this.axis.add(this.atmosphere);

        }



        if (data.rings) this.createRings();

        this.update(0, 0);

      }



      createRings() {

        const ring = makeRingTexture(texture);

        this.ringMap = ring.map;

        this.ringAlpha = ring.alpha;



        const geometry = own(new THREE.RingGeometry(1.35, 2.3, 192, 1));

        const positions = geometry.attributes.position;

        const uv = geometry.attributes.uv;



        for (let i = 0; i < positions.count; i++) {

          const x = positions.getX(i), y = positions.getY(i);

          uv.setXY(i, (Math.hypot(x, y) - 1.35) / 0.95, 0.5);

        }

        uv.needsUpdate = true;



        const material = own(new THREE.MeshStandardMaterial({

          map: ring.map,

          color: 0xffffff,

          side: THREE.DoubleSide,

          roughness: 0.98,

          metalness: 0,

          transparent: true,

          alphaTest: 0.035,

          depthWrite: false

        }));



        this.rings = new THREE.Mesh(geometry, material);

        this.rings.rotation.x = -Math.PI / 2;

        this.rings.userData.body = this;

        this.rings.userData.isRing = true;

        this.rings.renderOrder = 1;

        this.axis.add(this.rings);



        this.shadowUniforms = {

          uRingFrame: { value: new THREE.Matrix4() },

          uRingSun: { value: new THREE.Vector3() },

          uRingMap: { value: ring.map }

        };



        this.installAnalyticShadow(material, true);

        this.installAnalyticShadow(this.material, false);

      }



      installAnalyticShadow(material, isRing) {

        const uniforms = this.shadowUniforms;

        material.customProgramCacheKey = () => isRing ? 'solar-ring-shadow-v1' : 'solar-sphere-ring-shadow-v1';



        material.onBeforeCompile = shader => {

          Object.assign(shader.uniforms, uniforms);

          shader.vertexShader = `

            varying vec3 vSolarWorld;

            ${shader.vertexShader}

          `.replace(

            '#include <worldpos_vertex>',

            `#include <worldpos_vertex>

             vSolarWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`

          );



          const shadow = isRing ? `

            float projected = dot(localPoint, lightRay);

            float closest = sqrt(max(dot(localPoint, localPoint)

              - projected * projected, 0.0));

            float sphereOcclusion = (1.0 - smoothstep(0.975, 1.035, closest))

              * step(0.0, -projected);

            float solarVisibility = 1.0 - sphereOcclusion * 0.96;

          ` : `

            float solarVisibility = 1.0;

            if (abs(lightRay.y) > 0.0001) {

              float t = -localPoint.y / lightRay.y;

              vec2 planePoint = localPoint.xz + lightRay.xz * t;

              float radius = length(planePoint);

              if (t > 0.002 && radius > 1.35 && radius < 2.3) {

                float opacity = texture2D(uRingMap,

                  vec2((radius - 1.35) / 0.95, 0.5)).a;

                solarVisibility = 1.0 - opacity * 0.93;

              }

            }

          `;



          shader.fragmentShader = `

            varying vec3 vSolarWorld;

            uniform mat4 uRingFrame;

            uniform vec3 uRingSun;

            uniform sampler2D uRingMap;

            ${shader.fragmentShader}

          `.replace(

            '#include <lights_fragment_end>',

            `#include <lights_fragment_end>

             vec3 localPoint = (uRingFrame * vec4(vSolarWorld, 1.0)).xyz;

             vec3 lightRay = normalize(uRingSun - localPoint);

             ${shadow}

             reflectedLight.directDiffuse *= solarVisibility;

             reflectedLight.directSpecular *= solarVisibility;`

          );

        };

      }



      update(delta, time) {

        const d = this.data;

        if (d.distance) {

          const meanAnomaly = (d.phase + time * CONFIG.earthOrbitRate / d.years) % TAU;

          let eccentricAnomaly = meanAnomaly;

          for (let i = 0; i < 4; i++) {

            eccentricAnomaly -= (

              eccentricAnomaly - d.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly

            ) / (1 - d.eccentricity * Math.cos(eccentricAnomaly));

          }



          this.root.position.set(

            d.distance * (Math.cos(eccentricAnomaly) - d.eccentricity),

            0,

            d.distance * Math.sqrt(1 - d.eccentricity ** 2) * Math.sin(eccentricAnomaly)

          );

        }



        this.world.copy(this.root.position).applyQuaternion(this.frame.quaternion);

        this.surface.rotation.y = (this.surface.rotation.y + delta * d.spin) % TAU;

        if (this.clouds) {

          this.clouds.rotation.y = (

            this.clouds.rotation.y + delta * CONFIG.earthCloudRotation

          ) % TAU;

        }



        if (this.shadowUniforms) {

          this.axis.updateWorldMatrix(true, false);

          this.shadowUniforms.uRingFrame.value.copy(this.axis.matrixWorld).invert();

          this.shadowUniforms.uRingSun.value.set(0, 0, 0)

            .applyMatrix4(this.shadowUniforms.uRingFrame.value);

        }

      }



      setSelected(selected) {

        if (!this.orbit) return;

        this.orbit.material.color.set(selected ? 0x65c7ed : 0x456174);

        this.orbit.material.opacity = selected ? 0.65 : 0.23;

      }

    }



    const bodies = [SUN_DATA, ...PLANET_DATA].map(data => new CelestialBody(data));

    const earth = bodies.find(body => body.data.id === 'earth');



    // Marcador de selección 3D: no necesita proyectar coordenadas al DOM.

    const markerVertices = [];

    for (let quadrant = 0; quadrant < 4; quadrant++) {

      for (let i = 0; i < 12; i++) {

        const a = quadrant * Math.PI / 2 + 0.16 + i * 0.035;

        const b = a + 0.035;

        markerVertices.push(Math.cos(a), Math.sin(a), 0, Math.cos(b), Math.sin(b), 0);

      }

    }

    const markerGeometry = own(new THREE.BufferGeometry());

    markerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(markerVertices, 3));

    const markerMaterial = own(new THREE.LineBasicMaterial({

      color: 0x6bc5e9, transparent: true, opacity: 0.5,

      depthTest: false, depthWrite: false

    }));

    const marker = new THREE.LineSegments(markerGeometry, markerMaterial);

    marker.visible = false;

    marker.renderOrder = 20;

    scene.add(marker);



    // ------------------------------------------------------------------------

    // HUD aislado: no modifica ni depende de las clases del style.css existente.

    // ------------------------------------------------------------------------

    ui = document.createElement('div');

    ui.id = 'space-ui';

    ui.innerHTML = `

      <style>

        #space-ui {

          position:fixed; inset:0; z-index:30; pointer-events:none;

          color:#dce8f2; font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;

        }

        #space-ui * { box-sizing:border-box; }

        #space-ui .sx-panel {

          pointer-events:auto; background:rgba(6,13,23,.78);

          border:1px solid rgba(139,187,217,.2); border-radius:13px;

          backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px);

          box-shadow:0 14px 45px rgba(0,0,0,.24);

        }

        #space-ui h1,#space-ui h2,#space-ui p { margin:0; }

        #space-ui button,#space-ui select,#space-ui input { font:inherit; }

        #space-ui button,#space-ui select {

          color:#ccdce9; background:rgba(130,177,204,.055);

          border:1px solid rgba(137,181,208,.2); border-radius:7px;

          padding:7px 10px; cursor:pointer; transition:background .18s,border-color .18s;

        }

        #space-ui button:hover,#space-ui button[aria-pressed=true] {

          color:#e8f8ff; background:rgba(67,159,203,.18);

          border-color:rgba(100,202,247,.65);

        }

        #space-ui button:focus-visible,#space-ui select:focus-visible,

        #space-ui input:focus-visible { outline:2px solid #73ccee; outline-offset:3px; }

        #space-ui option { background:#0c1723; color:#e7f3ff; }

        #space-ui .sx-menu { position:absolute; top:20px; left:20px; width:210px; padding:16px; }

        #space-ui h1 { font-size:12px; letter-spacing:2px; color:#8ed6f4; }

        #space-ui .sx-subtitle { color:#8096aa; font-size:10px; margin-top:5px; }

        #space-ui nav { display:grid; gap:5px; margin-top:15px; }

        #space-ui nav button { text-align:left; }

        #space-ui #sx-body-select { display:none; width:100%; margin-top:12px; }

        #space-ui .sx-info {

          position:absolute; top:20px; right:20px; width:310px; padding:20px;

          max-height:calc(100vh - 180px); overflow:auto;

        }

        #space-ui [hidden] { display:none !important; }

        #space-ui h2 { font-size:24px; font-weight:500; letter-spacing:-.5px; }

        #space-ui #sx-type { display:block; color:#8ed6f4; margin:5px 0 18px; font-size:11px; }

        #space-ui .sx-row { display:flex; justify-content:space-between; gap:12px; margin:7px 0; color:#90a6b9; }

        #space-ui .sx-row strong { color:#dce8f2; font-weight:500; text-align:right; }

        #space-ui #sx-description {

          margin-top:15px; padding-top:14px; border-top:1px solid rgba(139,187,217,.15);

          color:#b1c2d0; line-height:1.65;

        }

        #space-ui #sx-refocus { width:100%; margin-top:16px; }

        #space-ui .sx-footer {

          position:absolute; bottom:20px; left:50%; transform:translateX(-50%);

          width:max-content; max-width:calc(100% - 40px); padding:12px 15px;

        }

        #space-ui .sx-controls { display:flex; align-items:center; justify-content:center; gap:13px; flex-wrap:wrap; }

        #space-ui label { display:flex; align-items:center; gap:7px; color:#a9bfd0; }

        #space-ui input { accent-color:#79c6e7; }

        #space-ui input[type=range] { width:95px; }

        #space-ui output { min-width:34px; color:#dce8f2; }

        #space-ui .sx-status {

          margin-top:9px; display:flex; justify-content:space-between; gap:18px;

          color:#8096aa; font-size:10px;

        }

        #space-ui #sx-mode { color:#80c6e4; }

        #space-ui .sx-help {

          position:absolute; left:22px; bottom:22px; max-width:220px;

          color:#6f879a; font-size:10px;

        }

        @media(max-width:1100px) {

          #space-ui .sx-help { display:none; }

          #space-ui .sx-footer { width:calc(100% - 40px); }

        }

        @media(max-width:740px) {

          #space-ui .sx-menu { top:12px; left:12px; width:calc(100% - 24px); padding:12px; }

          #space-ui .sx-menu nav { display:none; }

          #space-ui #sx-body-select { display:block; }

          #space-ui .sx-menu .sx-subtitle { display:none; }

          #space-ui .sx-info {

            top:auto; bottom:178px; right:12px; width:min(310px,calc(100% - 24px));

            max-height:32vh; padding:15px;

          }

          #space-ui h2 { font-size:20px; }

          #space-ui .sx-footer {

            bottom:12px; left:12px; transform:none; width:calc(100% - 24px);

            max-width:none; padding:10px;

          }

          #space-ui .sx-controls { gap:9px; }

          #space-ui .sx-status { flex-direction:column; gap:2px; }

          #space-ui input[type=range] { width:75px; }

        }

        @media(prefers-reduced-motion:reduce) {

          #space-ui button,#space-ui select { transition:none; }

        }

      </style>

      <section class="sx-panel sx-menu" aria-label="Navegación de cuerpos celestes">

        <h1>ORBITAL / EXPLORER</h1>

        <p class="sx-subtitle">Sistema Solar · exploración 3D</p>

        <nav id="sx-navigation" aria-label="Cuerpos celestes"></nav>

        <select id="sx-body-select" aria-label="Seleccionar cuerpo celeste">

          <option value="">Sistema completo</option>

        </select>

      </section>

      <section class="sx-panel sx-info" id="sx-info" aria-label="Información del cuerpo seleccionado" hidden>

        <h2 id="sx-name"></h2>

        <span id="sx-type"></span>

        <div class="sx-row"><span>Semieje real</span><strong id="sx-distance"></strong></div>

        <div class="sx-row"><span>Diámetro</span><strong id="sx-diameter"></strong></div>

        <div class="sx-row"><span>Periodo orbital</span><strong id="sx-period"></strong></div>

        <p id="sx-description"></p>

        <button id="sx-refocus" type="button">REENCADRAR CUERPO</button>

      </section>

      <section class="sx-panel sx-footer" aria-label="Controles de simulación">

        <div class="sx-controls">

          <button id="sx-home" type="button">VISTA GLOBAL</button>

          <button id="sx-pause" type="button" aria-pressed="false">PAUSAR</button>

          <label>Tiempo

            <input id="sx-speed" aria-label="Velocidad de simulación" type="range" min="0.1" max="8" step="0.1" value="1">

            <output id="sx-speed-value">1×</output>

          </label>

          <label><input id="sx-orbits" type="checkbox" checked>Órbitas</label>

          <label>GPU

            <select id="sx-quality" aria-label="Calidad gráfica">

              <option value="low">Ligera</option>

              <option value="balanced" selected>Equilibrada</option>

              <option value="high">Alta</option>

            </select>

          </label>

        </div>

        <div class="sx-status">

          <span id="sx-mode" role="status" aria-live="polite">Vista global</span>

          <span id="sx-assets">Texturas procedurales disponibles</span>

        </div>

        <div class="sx-status">

          <span>Escalas adaptadas · posiciones ilustrativas, no efemérides</span>

          <span id="sx-gpu">${hdrAvailable ? 'HDR · ACES · FXAA' : 'Modo compatible LDR · sin bloom HDR'}</span>

        </div>

      </section>

      <div class="sx-help">Arrastrar: orbitar<br>Rueda / pellizco: acercar<br>Click: seleccionar · Esc: sistema</div>

    `;

    document.body.appendChild(ui);

    const q = id => ui.querySelector(`#${id}`);

    const navButtons = new Map();



    // ------------------------------------------------------------------------

    // NavigationState y CameraController.

    // Un tween controla el progreso; destino y objetivo se recalculan en vuelo.

    // ------------------------------------------------------------------------

    const navigationState = { mode: 'global', target: null };

    tweenGroup = new Group();



    function minimumHalfFov() {

      const vertical = camera.fov * DEG * 0.5;

      return Math.min(vertical, Math.atan(Math.tan(vertical) * camera.aspect));

    }



    function homePosition(out) {

      const distance = 465 / Math.sin(minimumHalfFov()) * 1.1;

      return out.set(0, 0.6, 1).normalize().multiplyScalar(distance);

    }



    function syncNavigationHUD() {

      const selected = navigationState.target;

      q('sx-info').hidden = !selected;

      q('sx-body-select').value = selected?.data.id ?? '';



      for (const body of bodies) {

        const active = body === selected;

        body.setSelected(active);

        navButtons.get(body.data.id)?.setAttribute('aria-pressed', String(active));

      }



      if (selected) {

        const d = selected.data;

        q('sx-name').textContent = d.name;

        q('sx-type').textContent = d.type;

        q('sx-distance').textContent = d.au ? `${d.au.toLocaleString('es-ES')} UA` : 'Centro del sistema';

        q('sx-diameter').textContent = d.diameter;

        q('sx-period').textContent = d.period;

        q('sx-description').textContent = d.description;

      }



      q('sx-mode').textContent = navigationState.mode === 'transition'

        ? `En tránsito → ${selected?.data.name ?? 'sistema completo'}`

        : selected ? `Seguimiento orbital · ${selected.data.name}` : 'Vista global';

    }



    class CameraController {

      constructor() {

        this.state = navigationState;

        this.travel = null;

        this.lastCenter = new THREE.Vector3();

        this.end = new THREE.Vector3();

        this.center = new THREE.Vector3();

        this.delta = new THREE.Vector3();

        this.collision = new THREE.Vector3();

        this.up = new THREE.Vector3(0, 1, 0);

      }



      focus(body) {

        this.transition(body);

      }



      home() {

        this.transition(null);

      }



      transition(body) {

        tweenGroup.removeAll();

        const fromPosition = camera.position.clone();

        const fromTarget = controls.target.clone();



        // Vaciar la inercia acumulada sin modificar el encuadre de partida.

        controls.enableDamping = false;

        controls.update();

        camera.position.copy(fromPosition);

        controls.target.copy(fromTarget);

        controls.minDistance = 0.1;

        controls.enabled = false;

        controls.enablePan = false;

        controls.update();



        const offset = new THREE.Vector3();

        if (body) {

          if (body.data.id === 'sun') {

            offset.copy(camera.position).sub(body.world).normalize();

            if (offset.lengthSq() < 0.5) offset.set(0.5, 0.35, 1).normalize();

          } else {

            offset.copy(body.world).negate();

            offset.y = 0;

            offset.normalize().applyAxisAngle(this.up, 0.52);

            offset.y = 0.38;

            offset.normalize();

          }

          offset.multiplyScalar(body.extent / Math.sin(minimumHalfFov()) * 1.18);

          this.end.copy(body.world).add(offset);

        } else {

          homePosition(this.end);

        }



        const distance = fromPosition.distanceTo(this.end);

        const travel = {

          body, fromPosition, fromTarget, offset,

          startExposure: renderer.toneMappingExposure,

          endExposure: body?.data.exposure ?? 1.15,

          arc: Math.min(260, Math.max(12, distance * 0.24)),

          progress: { t: 0 }, done: false

        };



        this.travel = travel;

        this.state.target = body;

        this.state.mode = 'transition';

        marker.visible = !!body;

        syncNavigationHUD();



        new Tween(travel.progress, tweenGroup)

          .to({ t: 1 }, reducedMotion ? 650 : THREE.MathUtils.clamp(1350 + distance * 0.6, 1450, 2450))

          .easing(Easing.Quintic.InOut)

          .onComplete(() => { travel.done = true; })

          .start(elapsed * 1000);

      }



      preventIntersections() {

        for (const body of bodies) {

          this.collision.copy(camera.position).sub(body.world);

          const minimum = body.extent * 1.1;

          const length = this.collision.length();

          if (length < minimum) {

            if (length < 0.0001) this.collision.set(0, 1, 0);

            else this.collision.multiplyScalar(1 / length);

            camera.position.copy(body.world).addScaledVector(this.collision, minimum);

          }

        }

      }



      update(delta) {

        tweenGroup.update(elapsed * 1000);

        const travel = this.travel;



        if (travel) {

          const t = travel.progress.t;

          if (travel.body) {

            this.center.copy(travel.body.world);

            this.end.copy(this.center).add(travel.offset);

          } else {

            this.center.set(0, 0, 0);

            homePosition(this.end);

          }



          camera.position.lerpVectors(travel.fromPosition, this.end, t);

          camera.position.y += Math.sin(Math.PI * t) ** 2 * travel.arc;

          controls.target.lerpVectors(travel.fromTarget, this.center, t);

          renderer.toneMappingExposure = THREE.MathUtils.lerp(

            travel.startExposure, travel.endExposure, t

          );



          if (travel.done) {

            this.travel = null;

            this.state.mode = travel.body ? 'tracking' : 'global';

            this.lastCenter.copy(this.center);

            controls.enabled = true;

            controls.enableDamping = true;

            controls.enablePan = !travel.body;

            controls.minDistance = travel.body ? travel.body.extent * 1.16 : 35;

            syncNavigationHUD();

          }

        } else if (this.state.target) {

          this.center.copy(this.state.target.world);

          this.delta.copy(this.center).sub(this.lastCenter);

          camera.position.add(this.delta);

          controls.target.copy(this.center);

          this.lastCenter.copy(this.center);

        }



        controls.dampingFactor = 1 - Math.exp(-8 * Math.max(delta, 0.001));

        controls.update(delta);

        this.preventIntersections();

        camera.lookAt(controls.target);



        if (this.state.target) {

          marker.position.copy(this.state.target.world);

          marker.quaternion.copy(camera.quaternion);

          marker.scale.setScalar(this.state.target.extent * 1.16);

        }

      }

    }



    const cameraController = new CameraController();



    for (const body of bodies) {

      const button = document.createElement('button');

      button.type = 'button';

      button.textContent = body.data.name;

      button.setAttribute('aria-pressed', 'false');

      listen(button, 'click', () => cameraController.focus(body));

      navButtons.set(body.data.id, button);

      q('sx-navigation').appendChild(button);



      const option = document.createElement('option');

      option.value = body.data.id;

      option.textContent = body.data.name;

      q('sx-body-select').appendChild(option);

    }



    listen(q('sx-body-select'), 'change', event => {

      const body = bodies.find(item => item.data.id === event.target.value);

      body ? cameraController.focus(body) : cameraController.home();

    });

    listen(q('sx-home'), 'click', () => cameraController.home());

    listen(q('sx-refocus'), 'click', () => {

      if (navigationState.target) cameraController.focus(navigationState.target);

    });



    function togglePause() {

      paused = !paused;

      q('sx-pause').textContent = paused ? 'REANUDAR' : 'PAUSAR';

      q('sx-pause').setAttribute('aria-pressed', String(paused));

    }



    listen(q('sx-pause'), 'click', togglePause);

    listen(q('sx-speed'), 'input', event => {

      simulationSpeed = Number(event.target.value);

      q('sx-speed-value').textContent = `${simulationSpeed.toFixed(1).replace('.0', '')}×`;

    });

    listen(q('sx-orbits'), 'change', event => {

      showOrbits = event.target.checked;

      for (const body of bodies) if (body.orbit) body.orbit.visible = showOrbits;

    });

    listen(q('sx-quality'), 'change', event => {

      quality = event.target.value;

      resize();

    });



    listen(window, 'keydown', event => {

      if (event.repeat || event.target.closest('input,select,textarea,button,[contenteditable]')) return;

      if (event.code === 'Escape') cameraController.home();

      if (event.code === 'Space') {

        event.preventDefault();

        togglePause();

      }

    });



    // ------------------------------------------------------------------------

    // SelectionSystem: raycast sobre superficies reales y anillos con alpha.

    // Se distingue click de arrastre y se evitan selecciones durante multitouch.

    // ------------------------------------------------------------------------

    class SelectionSystem {

      constructor() {

        this.raycaster = new THREE.Raycaster();

        this.pointer = new THREE.Vector2();

        this.hits = [];

        this.targets = [];

        this.down = null;

        this.pointers = new Set();

        this.hovered = null;



        for (const body of bodies) {

          this.targets.push(body.surface);

          if (body.rings) this.targets.push(body.rings);

        }



        listen(canvas, 'pointerdown', event => {

          this.pointers.add(event.pointerId);

          if (this.pointers.size === 1 && event.button === 0) {

            this.down = {

              id: event.pointerId, x: event.clientX, y: event.clientY,

              time: performance.now(), moved: false

            };

          } else if (this.down) this.down.moved = true;

        });



        listen(canvas, 'pointermove', event => {

          if (this.down) {

            if (Math.hypot(event.clientX - this.down.x, event.clientY - this.down.y) > 6) {

              this.down.moved = true;

            }

            return;

          }

          if (event.pointerType === 'mouse') {

            const body = this.pick(event);

            if (body !== this.hovered) {

              this.hovered = body;

              canvas.style.cursor = body ? 'pointer' : 'grab';

            }

          }

        });



        listen(canvas, 'pointerup', event => {

          const down = this.down;

          this.pointers.delete(event.pointerId);

          if (down?.id === event.pointerId) {

            this.down = null;

            const distance = Math.hypot(event.clientX - down.x, event.clientY - down.y);

            if (!down.moved && distance <= 6 && performance.now() - down.time < 850) {

              const body = this.pick(event);

              if (body) cameraController.focus(body);

            }

          }

        });



        listen(canvas, 'pointercancel', event => {

          this.pointers.delete(event.pointerId);

          this.down = null;

        });



        listen(canvas, 'pointerleave', () => {

          this.hovered = null;

          canvas.style.cursor = 'grab';

        });

      }



      pick(event) {

        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) return null;

        this.pointer.set(

          (event.clientX - rect.left) / rect.width * 2 - 1,

          -(event.clientY - rect.top) / rect.height * 2 + 1

        );

        scene.updateMatrixWorld();

        camera.updateMatrixWorld();

        this.raycaster.setFromCamera(this.pointer, camera);

        this.hits.length = 0;

        this.raycaster.intersectObjects(this.targets, false, this.hits);



        for (const hit of this.hits) {

          const body = hit.object.userData.body;

          if (hit.object.userData.isRing && hit.uv) {

            const index = THREE.MathUtils.clamp(

              Math.round(hit.uv.x * (body.ringAlpha.length - 1)), 0, body.ringAlpha.length - 1

            );

            if (body.ringAlpha[index] < 0.12) continue;

          }

          return body;

        }

        return null;

      }

    }



    new SelectionSystem();



    // ------------------------------------------------------------------------

    // Assets opcionales: exclusivamente cartografía existente de Three r128.

    // La sustitución es atómica: no se mezclan continentes de mapas distintos.

    // ------------------------------------------------------------------------

    const textureLoader = new THREE.TextureLoader();

    textureLoader.setCrossOrigin('anonymous');

    const earthBaseURL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/';



    function loadEarthTexture(filename, color) {

      return new Promise(resolve => {

        let settled = false;

        let map;

        let timer;



        const abort = () => finish(null);

        function finish(value) {

          if (settled) {

            if (value) release(value);

            return;

          }

          settled = true;

          clearTimeout(timer);

          events.signal.removeEventListener('abort', abort);

          if (!value && map) release(map);

          resolve(value);

        }



        events.signal.addEventListener('abort', abort, { once: true });

        timer = window.setTimeout(() => finish(null), CONFIG.textureTimeout);



        try {

          map = own(textureLoader.load(

            earthBaseURL + filename,

            loaded => {

              if (!alive || settled) {

                release(loaded);

                if (!settled) finish(null);

                return;

              }

              loaded.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;

              loaded.anisotropy = anisotropy;

              loaded.wrapS = THREE.RepeatWrapping;

              finish(loaded);

            },

            undefined,

            () => finish(null)

          ));

        } catch {

          finish(null);

        }

      });

    }



    function roughnessFromSpecular(specular) {

      const canvas = makeCanvas(1024, 512);

      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      ctx.drawImage(specular.image, 0, 0, canvas.width, canvas.height);

      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);



      for (let i = 0; i < image.data.length; i += 4) {

        const reflectivity = image.data[i] / 255;

        const rough = 230 - reflectivity * 180;

        image.data[i] = image.data[i + 1] = image.data[i + 2] = rough;

        image.data[i + 3] = 255;

      }

      ctx.putImageData(image, 0, 0);

      return texture(canvas, false);

    }



    async function improveEarthAssets() {

      if (!CONFIG.useEarthCDN) {

        q('sx-assets').textContent = 'Assets 100 % procedurales · sin red';

        return;

      }



      q('sx-assets').textContent = 'Tierra: cargando cartografía 2K';

      const maps = await Promise.all([

        loadEarthTexture('earth_atmos_2048.jpg', true),

        loadEarthTexture('earth_normal_2048.jpg', false),

        loadEarthTexture('earth_specular_2048.jpg', false)

      ]);



      if (!alive) return;

      const [albedo, normal, specular] = maps;



      if (!albedo || !normal || !specular) {

        for (const map of maps) if (map) release(map);

        q('sx-assets').textContent = 'Modo local · respaldo procedural activo';

        return;

      }



      try {

        const roughness = roughnessFromSpecular(specular);

        const material = earth.material;

        const previous = [material.map, material.normalMap, material.roughnessMap];

        material.map = albedo;

        material.normalMap = normal;

        material.roughnessMap = roughness;

        material.normalScale.set(0.28, 0.28);

        material.needsUpdate = true;

        for (const map of previous) release(map);

        release(specular);

        q('sx-assets').textContent = 'Tierra 2K · resto procedural · Three r128';

      } catch {

        for (const map of maps) release(map);

        q('sx-assets').textContent = 'Modo local · respaldo procedural activo';

      }

    }



    // ------------------------------------------------------------------------

    // Resize, tiempo coherente, pérdida de contexto y liberación para Vite HMR.

    // ------------------------------------------------------------------------

    const homeVector = new THREE.Vector3();



    function resize() {

      const width = Math.max(1, window.innerWidth);

      const height = Math.max(1, window.innerHeight);

      const profile = QUALITY[quality];

      const pointerCap = coarsePointer ? 1.25 : Infinity;

      pixelRatio = Math.min(

        window.devicePixelRatio || 1,

        profile.dpr,

        pointerCap,

        Math.sqrt(profile.pixels / (width * height))

      );



      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      homePosition(homeVector);

      controls.maxDistance = Math.max(1800, homeVector.length() * 1.6);



      renderer.setPixelRatio(pixelRatio);

      renderer.setSize(width, height, false);

      composer.setPixelRatio(pixelRatio);

      composer.setSize(width, height);



      fxaa.uniforms.resolution.value.set(

        1 / Math.max(1, Math.floor(width * pixelRatio)),

        1 / Math.max(1, Math.floor(height * pixelRatio))

      );

      starMaterial.uniforms.uPixelRatio.value = pixelRatio;

      bloom.enabled = hdrAvailable && profile.bloom;



      q('sx-gpu').textContent = hdrAvailable

        ? `HDR · ACES · FXAA${bloom.enabled ? ' · bloom' : ''}`

        : 'Modo compatible LDR · sin bloom HDR';

    }



    function animate(timestamp) {

      if (!alive || contextLost || document.hidden) return;

      const delta = previousTimestamp === null

        ? 0

        : Math.min(0.1, Math.max(0, (timestamp - previousTimestamp) / 1000));

      previousTimestamp = timestamp;

      elapsed += delta;



      const simulationDelta = paused ? 0 : delta * simulationSpeed;

      simulationTime += simulationDelta;

      solarTime.value = simulationTime;



      for (const body of bodies) body.update(simulationDelta, simulationTime);

      cameraController.update(delta);

      stars.position.copy(camera.position);

      composer.render(delta);

    }



    listen(window, 'resize', resize);



    listen(document, 'visibilitychange', () => {

      previousTimestamp = null;

      if (document.hidden) renderer.setAnimationLoop(null);

      else if (!contextLost && alive) renderer.setAnimationLoop(animate);

    });



    listen(canvas, 'webglcontextlost', event => {

      event.preventDefault();

      contextLost = true;

      renderer.setAnimationLoop(null);

      q('sx-gpu').textContent = 'Contexto GPU perdido · esperando recuperación';

    });



    listen(canvas, 'webglcontextrestored', () => {

      if (!alive) return;

      contextLost = false;

      previousTimestamp = null;

      resize();

      if (!document.hidden) renderer.setAnimationLoop(animate);

    });



    resize();

    homePosition(camera.position);

    controls.target.set(0, 0, 0);

    controls.update();

    scene.updateMatrixWorld(true);

    syncNavigationHUD();

    canvas.style.cursor = 'grab';

    renderer.setAnimationLoop(animate);

    void improveEarthAssets();



    return dispose;

  } catch (error) {

    dispose();

    throw error;

  }

}



// ============================================================================

// ARRANQUE Y HMR

// ============================================================================

let stopApp;



try {

  stopApp = createApp();

} catch (error) {

  console.error('[Orbital Explorer]', error);

  const message = document.createElement('div');

  message.style.cssText = `

    position:fixed;inset:20px;z-index:9999;padding:24px;

    height:max-content;max-width:680px;background:#101a27;color:#e5eef7;

    border:1px solid #49627a;border-radius:12px;font:14px/1.6 monospace;

  `;

  message.textContent = `No se pudo iniciar el explorador. Se requiere un navegador con WebGL2 y aceleración gráfica activa. Detalle: ${error.message}`;

  document.body.appendChild(message);

  if (import.meta.hot) import.meta.hot.dispose(() => message.remove());

}



if (import.meta.hot) {

  import.meta.hot.dispose(() => stopApp?.());

}
