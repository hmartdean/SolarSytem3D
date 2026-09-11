# 🪐 Solar System 3D — Real-Time Orbital Explorer

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel)](https://solar-sytem3-d.vercel.app)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite)](https://vitejs.dev/)
[![AI-Assisted](https://img.shields.io/badge/Workflow-Astra%20%2F%20AI--Directed-blueviolet)](https://github.com/hmartdean/SolarSytem3D)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Interactive, physically-scaled 3D orbital mechanics simulation of the Solar System built with Three.js, Vite, and custom GLSL simplex noise shaders.

🌐 **Live Demo:** [solar-sytem3-d.vercel.app](https://solar-sytem3-d.vercel.app)

---

## 🔬 AI-Assisted Workflow & Architecture

This project was built using an **AI-directed engineering approach**, exploring the capabilities and limits of LLMs (specifically **Astra**) for complex graphics engineering.

* **AI Generation & Prompt Engineering:** Advanced mathematical constraints, Keplerian approximations, and custom WebGL shaders (plasma corona flow, procedural sunspots) were architected and generated via targeted prompt loops using Astra.
* **Human Curation & Integration:** Hand-crafted project scaffolding, Vite environment orchestration, Three.js render pipeline profiling, and Vercel CI/CD configuration.
* **Goal:** Demonstrating rapid prototyping of compute-heavy 3D web applications by pairing strict engineering constraints with state-of-the-art AI code generation.

---

## ✨ Features

* **Procedural Solar Dynamics:** Custom GLSL simplex noise vertex/fragment shaders generating solar corona turbulence and real-time plasma flow.
* **Cinematic Post-Processing:** Multi-pass rendering pipeline powered by Three.js `EffectComposer`, utilizing `UnrealBloomPass` for solar atmospheric glare and ACES Filmic Tone Mapping.
* **Accurate Keplerian Kinematics:** Scaled orbital trajectories and elliptical mechanics across all planetary bodies and moons.
* **Smooth View Transitions:** Dynamic camera transitions driven by `@tweenjs/tween.js` for focused celestial inspections.
* **Hardware-Adaptive Rendering:** Dynamic DPR scaling and shadow map presets designed for 60 FPS performance across desktop and mobile browsers.

---

## 🛠️ Tech Stack

* **Graphics Core:** [Three.js](https://threejs.org/) (r128)
* **Shaders:** Custom WebGL GLSL (Solar Corona, Noise Displacements)
* **Bundler & Build Tool:** [Vite](https://vitejs.dev/)
* **Animation Pipeline:** [@tweenjs/tween.js](https://github.com/tweenjs/tween.js/)
* **AI Tooling:** Astra (Code synthesis & mathematical logic)
* **Hosting & CI/CD:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started Locally

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation & Run

1. Clone the repository:

```bash
git clone https://github.com/hmartdean/SolarSytem3D.git
cd SolarSytem3D
```

2. Install dependencies:

```bash
npm install
```

3. Launch the local development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
