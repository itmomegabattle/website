import { useEffect, useRef, useState } from "react";

const MODEL_URL = "/models/moving-head-beam-high-poly.glb";
const BODY_YAW = -0.05;
const CLIP_START = 0.15;
const CLIP_FACE_CAMERA = 2.91;

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export default function MovingHeadScene({ onReady }) {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    let renderer;
    let scene;
    let camera;
    let model;
    let mixer;
    let clip;
    let headNode;
    let beamCore;
    let beamHalo;
    let keyLight;
    let lensGlow;
    let floorShadow;
    let resizeObserver;

    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const [THREE, { GLTFLoader }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
      ]);

      if (disposed) return;

      const isCompactViewport = window.matchMedia?.("(max-width: 680px)")?.matches;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isCompactViewport,
        canvas,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompactViewport ? 1.25 : 2));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0.42, 4.85);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.HemisphereLight(0xe7edff, 0x08090d, 2.1));

      const fillLight = new THREE.DirectionalLight(0xffffff, 3.2);
      fillLight.position.set(-2.4, 3.2, 3.4);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x8ba5ff, 2.4);
      rimLight.position.set(2.6, 1.2, -2);
      scene.add(rimLight);

      keyLight = new THREE.SpotLight(0xdce7ff, 0.8, 10, Math.PI / 8, 0.85, 1.2);
      keyLight.position.set(0.9, 1.35, 2.6);
      scene.add(keyLight);
      scene.add(keyLight.target);

      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(MODEL_URL);
      if (disposed) return;

      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar((isCompactViewport ? 0.92 : 1.18) / maxDimension);
      model.position.y = isCompactViewport ? -0.42 : -0.52;
      model.rotation.set(-0.03, BODY_YAW, 0.015);

      model.traverse((node) => {
        const nodeName = node.name?.toLowerCase?.() || "";
        if (nodeName.includes("head") && !nodeName.includes("_0")) headNode = node;
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = false;
        if (node.material) {
          node.material = node.material.clone();
          if (node.material.color) {
            node.material.color.lerp(new THREE.Color(0x6f7480), 0.35);
          }
          node.material.metalness = Math.min(node.material.metalness ?? 0.6, 0.9);
          node.material.roughness = Math.max(node.material.roughness ?? 0.35, 0.24);
          if ("emissive" in node.material) {
            node.material.emissive = new THREE.Color(0x101522);
            node.material.emissiveIntensity = 0.32;
          }
        }
      });

      clip = gltf.animations?.[0];
      if (clip) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.play();
        mixer.setTime(CLIP_START);
      }

      scene.add(model);

      const createBeamMaterial = ({ color, opacity, length }) =>
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: {
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: opacity },
            uLength: { value: length },
          },
          vertexShader: `
            varying float vBeamY;

            void main() {
              vBeamY = position.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uLength;
            varying float vBeamY;

            void main() {
              float normalizedY = clamp((vBeamY / uLength) + 0.5, 0.0, 1.0);
              float fadeIn = smoothstep(0.0, 0.07, normalizedY);
              float fadeOut = 1.0 - smoothstep(0.46, 1.0, normalizedY);
              float alpha = uOpacity * fadeIn * fadeOut;
              gl_FragColor = vec4(uColor, alpha);
            }
          `,
        });

      const beamGroup = new THREE.Group();
      beamGroup.name = "MegabattleVolumetricBeam";
      beamGroup.position.set(0, 0.012, 0.105);
      beamGroup.rotation.x = Math.PI / 2;

      const beamCoreMaterial = createBeamMaterial({
        color: 0xf5f8ff,
        opacity: 0.16,
        length: 7.2,
      });
      beamCore = new THREE.Mesh(
        new THREE.CylinderGeometry(1.18, 0.052, 7.2, 72, 1, true),
        beamCoreMaterial,
      );
      beamCore.position.y = 3.58;

      const beamHaloMaterial = createBeamMaterial({
        color: 0x8fa8ff,
        opacity: 0.09,
        length: 9.4,
      });
      beamHalo = new THREE.Mesh(
        new THREE.CylinderGeometry(2.35, 0.085, 9.4, 96, 1, true),
        beamHaloMaterial,
      );
      beamHalo.position.y = 4.68;

      beamGroup.add(beamHalo, beamCore);
      (headNode || model).add(beamGroup);

      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xdde7ff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      lensGlow = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12), glowMaterial);
      lensGlow.position.set(0, 0.012, 0.095);
      (headNode || model).add(lensGlow);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const shadowContext = shadowCanvas.getContext("2d");
      const shadowGradient = shadowContext.createRadialGradient(128, 128, 10, 128, 128, 118);
      shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.36)");
      shadowGradient.addColorStop(0.48, "rgba(0, 0, 0, 0.18)");
      shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowContext.fillStyle = shadowGradient;
      shadowContext.fillRect(0, 0, 256, 256);

      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      floorShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.55, 0.72),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          opacity: isCompactViewport ? 0.36 : 0.42,
          depthWrite: false,
        }),
      );
      floorShadow.position.set(0, isCompactViewport ? -0.86 : -0.94, 0.03);
      floorShadow.rotation.x = -Math.PI / 2;
      floorShadow.rotation.z = 0.04;
      scene.add(floorShadow);

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const startedAt = performance.now();
      const debugProgress = import.meta.env.DEV
        ? Number.parseFloat(new URLSearchParams(window.location.search).get("preloaderT") || "")
        : Number.NaN;
      setIsReady(true);
      onReady?.();

      const render = (now) => {
        if (disposed) return;
        const t = Number.isFinite(debugProgress)
          ? Math.min(1, Math.max(0, debugProgress))
          : Math.min(1, (now - startedAt) / 3000);
        const turn = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.08) / 0.72)));
        const flash = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.72) / 0.18)));
        const settle = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.86) / 0.14)));

        model.rotation.y = BODY_YAW;
        model.rotation.x = -0.03 + 0.03 * turn;
        model.rotation.z = 0.015 * (1 - turn);
        model.position.y = (isCompactViewport ? -0.42 : -0.52) + Math.sin(now / 700) * 0.005;

        if (mixer && clip) {
          const clipTime = THREE.MathUtils.lerp(CLIP_START, Math.min(CLIP_FACE_CAMERA, clip.duration), turn);
          mixer.setTime(clipTime);
        }

        const modelOpacity = Math.min(1, t / 0.16) * (1 - settle * 0.9);
        model.traverse((node) => {
          if (!node.isMesh || !node.material) return;
          node.material.transparent = modelOpacity < 1;
          node.material.opacity = modelOpacity;
        });

        keyLight.intensity = 1.05 + flash * 7.2 - settle * 4.5;
        keyLight.angle = THREE.MathUtils.lerp(Math.PI / 10, Math.PI / 4.5, flash);
        keyLight.target.position.set(0, 0.25, -1.8);

        const beamPulse = 0.75 + Math.sin(now / 180) * 0.08;
        if (beamCore?.material) {
          beamCore.material.uniforms.uOpacity.value = Math.max(0.1, (0.14 + flash * 0.42 - settle * 0.18) * beamPulse);
          beamCore.scale.setScalar(1 + flash * 0.36);
        }
        if (beamHalo?.material) {
          beamHalo.material.uniforms.uOpacity.value = Math.max(0.055, (0.08 + flash * 0.2 - settle * 0.08) * beamPulse);
          beamHalo.scale.setScalar(1 + flash * 0.5);
        }

        lensGlow.material.opacity = Math.max(0.14, flash * 0.42 - settle * 0.32);
        lensGlow.scale.setScalar(0.78 + flash * 1.85);

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };

      frameId = requestAnimationFrame(render);
    }

    init().catch(() => {
      if (!disposed) {
        setIsReady(false);
        onReady?.();
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (scene) {
        scene.traverse((node) => {
          if (!node.isMesh) return;
          node.geometry?.dispose?.();
          if (Array.isArray(node.material)) {
            node.material.forEach((material) => material.dispose?.());
          } else {
            node.material?.dispose?.();
          }
        });
      }
      renderer?.dispose?.();
    };
  }, [onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={`site-preloader__model${isReady ? " site-preloader__model--ready" : ""}`}
      aria-hidden="true"
    />
  );
}
