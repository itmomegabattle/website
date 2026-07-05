import { useEffect, useRef, useState } from "react";

const MODEL_URL = "/models/moving-head-beam-high-poly.glb";
const START_BODY_YAW = 1.05;
const FACE_BODY_YAW = 0.72;
const START_HEAD_TILT = -0.08;
const FACE_HEAD_TILT = 0.12;

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export default function MovingHeadScene() {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    let renderer;
    let scene;
    let camera;
    let model;
    let headNode;
    let keyLight;
    let lensGlow;
    let resizeObserver;

    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const [THREE, { GLTFLoader }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
      ]);

      if (disposed) return;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.52, 4.15);
      camera.lookAt(0, 0.04, 0);

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
      model.scale.setScalar(1.9 / maxDimension);
      model.position.y = -0.42;
      model.rotation.set(-0.03, START_BODY_YAW, 0.015);

      model.traverse((node) => {
        const nodeName = node.name?.toLowerCase?.() || "";
        if (nodeName.includes("head")) headNode = node;
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

      if (headNode) headNode.rotation.x = START_HEAD_TILT;

      scene.add(model);

      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xdde7ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      lensGlow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 16), glowMaterial);
      lensGlow.position.set(0, 0.08, 0.78);
      scene.add(lensGlow);

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
      setIsReady(true);

      const render = (now) => {
        if (disposed) return;
        const t = Math.min(1, (now - startedAt) / 3000);
        const turn = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.08) / 0.48)));
        const flash = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.50) / 0.18)));
        const settle = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.66) / 0.22)));

        model.rotation.y = START_BODY_YAW + (FACE_BODY_YAW - START_BODY_YAW) * turn;
        model.rotation.x = -0.03 + 0.03 * turn;
        model.rotation.z = 0.015 * (1 - turn);
        model.position.y = -0.42 + Math.sin(now / 700) * 0.01;

        if (headNode) {
          headNode.rotation.x = START_HEAD_TILT + (FACE_HEAD_TILT - START_HEAD_TILT) * turn;
        }

        const modelOpacity = Math.min(1, t / 0.16) * (1 - settle * 0.9);
        model.traverse((node) => {
          if (!node.isMesh || !node.material) return;
          node.material.transparent = modelOpacity < 1;
          node.material.opacity = modelOpacity;
        });

        keyLight.intensity = 0.85 + flash * 7.2 - settle * 4.5;
        keyLight.angle = THREE.MathUtils.lerp(Math.PI / 10, Math.PI / 4.5, flash);
        keyLight.target.position.set(0, 0.25, -1.8);

        lensGlow.material.opacity = Math.max(0, flash * 0.95 - settle * 0.65);
        lensGlow.scale.setScalar(1 + flash * 4.5);

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };

      frameId = requestAnimationFrame(render);
    }

    init().catch(() => {
      if (!disposed) setIsReady(false);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`site-preloader__model${isReady ? " site-preloader__model--ready" : ""}`}
      aria-hidden="true"
    />
  );
}
