import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

const Phone3D = forwardRef(function Phone3D(props, ref) {
    const {
        initialRotZ = -0.18,
        initialRotY = -0.24,
        initialRotX = -0.06,
        showControls = true,
        showBadge = true,
        autoBreath = true,
        className = "",
        heightClass = "h-[580px] sm:h-[620px] md:h-[650px] lg:h-[680px] xl:h-[700px]",
        onRotate,
    } = props;

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const threeRefs = useRef({ camera: null, renderer: null, phone: null });
    const [isSpinning, setIsSpinning] = useState(false);

    // Interaction & Animation state
    const stateRef = useRef({
        isSpinning: false,
        dragging: false,
        lastX: 0,
        lastY: 0,
        velocityX: 0,
        velocityY: 0,
        targetRotX: initialRotX,
        targetRotY: initialRotY,
        baseRotZ: initialRotZ,
        autoBreath: autoBreath,
    });

    // Update state when initial props change
    useEffect(() => {
        stateRef.current.baseRotZ = initialRotZ;
        stateRef.current.targetRotY = initialRotY;
        stateRef.current.targetRotX = initialRotX;
        stateRef.current.autoBreath = autoBreath;
    }, [initialRotZ, initialRotY, initialRotX, autoBreath]);

    const resetPosition = useCallback(() => {
        setIsSpinning(false);
        stateRef.current.isSpinning = false;
        stateRef.current.targetRotX = initialRotX;
        stateRef.current.targetRotY = initialRotY;
        stateRef.current.baseRotZ = initialRotZ;
        stateRef.current.velocityX = 0;
        stateRef.current.velocityY = 0;
    }, [initialRotX, initialRotY, initialRotZ]);

    const toggleSpin = useCallback(() => {
        setIsSpinning((prev) => {
            const next = !prev;
            stateRef.current.isSpinning = next;
            return next;
        });
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        setTargetRotation: (x, y, z) => {
            if (x !== undefined && x !== null) stateRef.current.targetRotX = x;
            if (y !== undefined && y !== null) stateRef.current.targetRotY = y;
            if (z !== undefined && z !== null) stateRef.current.baseRotZ = z;
        },
        reset: resetPosition,
        toggleSpin: toggleSpin,
        getState: () => ({ ...stateRef.current }),
        getAnchorCoords: () => {
            const { camera, renderer, phone } = threeRefs.current;
            if (!camera || !renderer || !phone) return null;
            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();

            // Local coordinates on the phone's outer titanium bezel:
            // x = -1.68 for left bezel, x = 1.68 for right bezel
            const pins = {
                pin1: new THREE.Vector3(-1.68, 2.3, 0.15), // Left Bezel (Dynamic Notch level)
                pin2: new THREE.Vector3(-1.68, 0.9, 0.15), // Left Bezel (90-Day Protocol level)
                pin3: new THREE.Vector3(1.68, -0.4, 0.15), // Right Bezel (Habit Grid level)
                pin4: new THREE.Vector3(1.68, -1.8, 0.15), // Right Bezel (ADA Standard level)
            };

            phone.updateMatrixWorld(true);
            const result = {};
            for (const [key, vec] of Object.entries(pins)) {
                const worldVec = vec.clone().applyMatrix4(phone.matrixWorld);
                worldVec.project(camera);
                result[key] = {
                    clientX: rect.left + (worldVec.x * 0.5 + 0.5) * rect.width,
                    clientY: rect.top + (-(worldVec.y * 0.5) + 0.5) * rect.height,
                };
            }
            return result;
        },
    }), [resetPosition, toggleSpin]);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // ── 1. Create Scene & Camera ─────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);

        // ── 2. Create Renderer with 100% Alpha Transparency ─────────
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
            });
        } catch {
            return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0); // 100% transparent!
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        // ── 3. Helper Functions for Curved Geometries ────────────────
        function roundedShape(w, h, r) {
            const x = -w / 2, y = -h / 2;
            const s = new THREE.Shape();
            s.moveTo(x + r, y);
            s.lineTo(x + w - r, y);
            s.quadraticCurveTo(x + w, y, x + w, y + r);
            s.lineTo(x + w, y + h - r);
            s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            s.lineTo(x + r, y + h);
            s.quadraticCurveTo(x, y + h, x, y + h - r);
            s.lineTo(x, y + r);
            s.quadraticCurveTo(x, y, x + r, y);
            return s;
        }

        function extruded(shape, depth, bevel, material) {
            const g = new THREE.ExtrudeGeometry(shape, {
                depth,
                bevelEnabled: true,
                bevelThickness: bevel,
                bevelSize: bevel,
                bevelSegments: 3,
                curveSegments: 12,
            });
            g.translate(0, 0, -depth / 2);
            g.computeVertexNormals();
            return new THREE.Mesh(g, material);
        }

        // ── 4. Materials (Natural Titanium & Glossy Glass) ───────────
        const titaniumFrameMat = new THREE.MeshStandardMaterial({
            color: 0x8e98a0,
            metalness: 0.95,
            roughness: 0.22,
        });
        const titaniumEdgeMat = new THREE.MeshStandardMaterial({
            color: 0xd6dde0,
            metalness: 0.92,
            roughness: 0.16,
        });
        const glassBlackMat = new THREE.MeshPhysicalMaterial({
            color: 0x050709,
            metalness: 0.2,
            roughness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
        });
        const backGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xc8ced1,
            metalness: 0.12,
            roughness: 0.48,
            clearcoat: 0.35,
        });
        const lensGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0x070a0e,
            metalness: 0.4,
            roughness: 0.08,
            clearcoat: 1.0,
        });
        const blueGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a3c66,
            metalness: 0.1,
            roughness: 0.08,
            clearcoat: 1.0,
        });

        // ── 5. Phone Assembly ────────────────────────────────────────
        const phone = new THREE.Group();

        // A. Titanium Outer Frame & Body
        const body = extruded(roundedShape(3.35, 6.72, 0.48), 0.36, 0.09, titaniumFrameMat);
        body.castShadow = true;
        body.receiveShadow = true;
        phone.add(body);

        // B. Slim Front Bezel Rim
        const frontRim = extruded(roundedShape(3.18, 6.54, 0.42), 0.02, 0.02, glassBlackMat);
        frontRim.position.z = 0.245;
        phone.add(frontRim);

        // C. High-Resolution GluCare Canvas Texture (720 x 1520)
        function createGluCareScreenCanvas() {
            const c = document.createElement("canvas");
            c.width = 720;
            c.height = 1520;
            const ctx = c.getContext("2d");

            function drawRoundRect(x, y, w, h, r, fill, stroke, strokeW) {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                if (fill) {
                    ctx.fillStyle = fill;
                    ctx.fill();
                }
                if (stroke) {
                    ctx.lineWidth = strokeW || 1.5;
                    ctx.strokeStyle = stroke;
                    ctx.stroke();
                }
            }

            // Screen Background
            ctx.fillStyle = "#F8FAFC";
            ctx.fillRect(0, 0, 720, 1520);

            // ── Top Status Bar (Flanking Dynamic Island) ───────────────
            // Left: Clock "9:41"
            ctx.fillStyle = "#0F172A";
            ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
            ctx.fillText("9:41", 82, 88);

            // Right: Cellular Bars, Wifi, Battery
            ctx.fillRect(560, 68, 4, 18);
            ctx.fillRect(568, 62, 4, 24);
            ctx.fillRect(576, 56, 4, 30);
            ctx.fillRect(584, 50, 4, 36);

            // WiFi Icon
            ctx.beginPath();
            ctx.arc(618, 80, 15, Math.PI * 1.25, Math.PI * 1.75);
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#0F172A";
            ctx.stroke();

            // Battery Capsule
            drawRoundRect(646, 60, 44, 24, 7, null, "#0F172A", 3);
            drawRoundRect(651, 65, 30, 14, 4, "#0F172A");
            ctx.fillRect(692, 67, 3, 10);

            // ── App Header ───────────────────────────────────────────
            // Back Chevron
            ctx.beginPath();
            ctx.moveTo(82, 188);
            ctx.lineTo(64, 204);
            ctx.lineTo(82, 220);
            ctx.lineWidth = 4.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#334155";
            ctx.stroke();

            // GluCare Logo Badge
            drawRoundRect(275, 178, 52, 52, 26, "#00A896");
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "28px sans-serif";
            ctx.fillText("🌱", 286, 214);

            ctx.fillStyle = "#0F172A";
            ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";
            ctx.fillText("GluCare", 338, 216);
            ctx.fillStyle = "#00A896";
            ctx.fillText(".", 502, 216);

            // Notification Bell with Red Indicator
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#334155";
            ctx.beginPath();
            ctx.arc(655, 198, 14, Math.PI, 0);
            ctx.lineTo(673, 216);
            ctx.lineTo(637, 216);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "#EF4444";
            ctx.beginPath();
            ctx.arc(669, 188, 7, 0, Math.PI * 2);
            ctx.fill();

            // ── Greeting Section ───────────────────────────────────────
            ctx.fillStyle = "#112340";
            ctx.font = "bold 50px -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";
            ctx.fillText("Halo, Dina!", 60, 316);
            ctx.fillStyle = "#64748B";
            ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Yuk, lanjutkan perjalanan hidup sehatmu hari ini! ✨", 60, 360);

            // ── Card: Program 90 Hari ──────────────────────────────────
            drawRoundRect(52, 404, 616, 204, 32, "#FFFFFF", "#DBEAFE", 2.5);
            drawRoundRect(80, 432, 88, 88, 26, "#2563EB");
            ctx.fillStyle = "#FBBF24";
            ctx.font = "bold 44px sans-serif";
            ctx.fillText("★", 106, 492);

            ctx.fillStyle = "#1E293B";
            ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Program 90 Hari", 188, 470);
            ctx.fillStyle = "#64748B";
            ctx.font = "500 23px sans-serif";
            ctx.fillText("Hari ke-12 dari 90", 188, 508);

            // Progress Bar
            drawRoundRect(80, 546, 480, 22, 11, "#EFF6FF", "#BFDBFE", 1.5);
            drawRoundRect(80, 546, 120, 22, 11, "#2563EB");
            ctx.fillStyle = "#2563EB";
            ctx.font = "bold 24px sans-serif";
            ctx.fillText("13%", 578, 566);

            // ── 2x2 Grid Bio-Habit Tracking Cards ─────────────────────
            // Card 1: Aktivitas Harian
            drawRoundRect(52, 642, 296, 226, 28, "#FFFFFF", "#F1F5F9", 2);
            drawRoundRect(74, 664, 76, 76, 22, "#E0F2FE");
            ctx.fillStyle = "#0284C7";
            ctx.fillRect(88, 712, 48, 14);
            ctx.beginPath();
            ctx.moveTo(92, 712);
            ctx.lineTo(104, 688);
            ctx.lineTo(124, 696);
            ctx.lineTo(136, 712);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#1E293B";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Aktivitas Harian", 74, 786);
            ctx.fillStyle = "#64748B";
            ctx.font = "500 22px sans-serif";
            ctx.fillText("7.420 langkah", 74, 824);

            // Card 2: Asupan Makanan
            drawRoundRect(372, 642, 296, 226, 28, "#FFFFFF", "#F1F5F9", 2);
            drawRoundRect(394, 664, 76, 76, 22, "#FFEDD5");
            ctx.strokeStyle = "#EA580C";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(422, 684); ctx.lineTo(422, 720);
            ctx.moveTo(414, 684); ctx.lineTo(414, 704);
            ctx.moveTo(430, 684); ctx.lineTo(430, 704);
            ctx.stroke();

            ctx.fillStyle = "#1E293B";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Asupan Makanan", 394, 786);
            ctx.fillStyle = "#64748B";
            ctx.font = "500 22px sans-serif";
            ctx.fillText("Pola Sehat", 394, 824);

            // Card 3: Tidur
            drawRoundRect(52, 894, 296, 226, 28, "#FFFFFF", "#F1F5F9", 2);
            drawRoundRect(74, 916, 76, 76, 22, "#F3E8FF");
            ctx.fillStyle = "#9333EA";
            ctx.beginPath();
            ctx.arc(114, 954, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#F3E8FF";
            ctx.beginPath();
            ctx.arc(122, 946, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#1E293B";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Tidur Cukup", 74, 1038);
            ctx.fillStyle = "#64748B";
            ctx.font = "500 22px sans-serif";
            ctx.fillText("7 jam 45 mnt", 74, 1076);

            // Card 4: Insight AI
            drawRoundRect(372, 894, 296, 226, 28, "#FFFFFF", "#F1F5F9", 2);
            drawRoundRect(394, 916, 76, 76, 22, "#D1FAE5");
            ctx.fillStyle = "#10B981";
            ctx.fillRect(412, 956, 10, 20);
            ctx.fillRect(426, 942, 10, 34);
            ctx.fillRect(440, 928, 10, 48);

            ctx.fillStyle = "#1E293B";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("Insight AI", 394, 1038);
            ctx.fillStyle = "#059669";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("Risiko Rendah", 394, 1076);

            // ── Bottom App Tab Bar ─────────────────────────────────────
            const tby = 1350;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, tby, 720, 170);
            ctx.strokeStyle = "#F1F5F9";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, tby);
            ctx.lineTo(720, tby);
            ctx.stroke();

            const tabs = [
                { label: "Beranda", active: true, x: 90 },
                { label: "Program", active: false, x: 270 },
                { label: "Insight", active: false, x: 450 },
                { label: "Profil", active: false, x: 630 },
            ];
            tabs.forEach((tab) => {
                ctx.fillStyle = tab.active ? "#2563EB" : "#94A3B8";
                ctx.font = (tab.active ? "bold" : "500") + " 22px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(tab.label, tab.x, tby + 86);
                ctx.beginPath();
                ctx.arc(tab.x, tby + 46, 10, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.textAlign = "left";

            // Home Indicator Bar
            drawRoundRect(240, 1488, 240, 10, 5, "#0F172A");

            return c;
        }

        const screenCanvas = createGluCareScreenCanvas();
        const screenTexture = new THREE.CanvasTexture(screenCanvas);
        screenTexture.colorSpace = THREE.SRGBColorSpace;

        // D. Precision Rounded Screen Geometry (Matching Bezel Radius)
        const screenWidth = 3.06;
        const screenHeight = 6.42;
        const screenRadius = 0.38;
        const screenShape = roundedShape(screenWidth, screenHeight, screenRadius);
        const screenGeom = new THREE.ShapeGeometry(screenShape);

        // Normalize UVs to map the 720x1520 texture across the rounded screen
        const pos = screenGeom.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            const px = pos.getX(i);
            const py = pos.getY(i);
            uvs[i * 2] = (px + screenWidth / 2) / screenWidth;
            uvs[i * 2 + 1] = (py + screenHeight / 2) / screenHeight;
        }
        screenGeom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

        const screenMesh = new THREE.Mesh(
            screenGeom,
            new THREE.MeshBasicMaterial({ map: screenTexture })
        );
        screenMesh.position.z = 0.282;
        phone.add(screenMesh);

        // E. Dynamic Island Pill (Positioned Accurately at Top Notch Area)
        const islandShape = roundedShape(0.88, 0.26, 0.13);
        const islandMesh = extruded(islandShape, 0.02, 0.012, glassBlackMat);
        islandMesh.position.set(0, 2.87, 0.292); // Precise top status bar height!
        phone.add(islandMesh);

        // Front Camera Lens inside Dynamic Island
        const frontLens = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), blueGlassMat);
        frontLens.scale.z = 0.3;
        frontLens.position.set(0.26, 2.87, 0.312);
        phone.add(frontLens);

        // F. Back Chassis & Triple Camera Module
        const back = extruded(roundedShape(3.15, 6.52, 0.42), 0.018, 0.02, backGlassMat);
        back.position.z = -0.248;
        back.rotation.y = Math.PI;
        phone.add(back);

        const cameraBump = extruded(roundedShape(1.46, 1.5, 0.26), 0.12, 0.035, backGlassMat);
        cameraBump.position.set(-0.67, 1.98, -0.34);
        cameraBump.rotation.y = Math.PI;
        phone.add(cameraBump);

        function addCameraLens(x, y) {
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.105, 24), titaniumEdgeMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(x, y, -0.44);
            phone.add(ring);

            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.27, 0.118, 24), lensGlassMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(x, y, -0.475);
            phone.add(lens);

            const glass = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), blueGlassMat);
            glass.rotation.y = Math.PI;
            glass.position.set(x - 0.045, y + 0.04, -0.54);
            phone.add(glass);
        }
        addCameraLens(-0.96, 2.28);
        addCameraLens(-0.39, 2.03);
        addCameraLens(-0.96, 1.68);

        // Flash & LiDAR
        const flashMat = new THREE.MeshPhysicalMaterial({ color: 0xfff4cf, emissive: 0xffd06b, emissiveIntensity: 0.2, roughness: 0.2 });
        const flash = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), flashMat);
        flash.rotation.y = Math.PI;
        flash.position.set(-0.36, 2.42, -0.43);
        phone.add(flash);

        const lidar = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), lensGlassMat);
        lidar.rotation.y = Math.PI;
        lidar.position.set(-0.37, 1.63, -0.43);
        phone.add(lidar);

        // Physical Buttons
        function addSideButton(x, y, h) {
            const btn = extruded(roundedShape(0.1, h, 0.05), 0.12, 0.025, titaniumEdgeMat);
            btn.rotation.y = Math.PI / 2;
            btn.position.set(x, y, 0);
            phone.add(btn);
        }
        addSideButton(-1.77, 1.72, 0.42);  // Action Button
        addSideButton(-1.78, 0.83, 0.68);  // Volume Up
        addSideButton(-1.78, -0.05, 0.68); // Volume Down
        addSideButton(1.78, 0.72, 1.03);   // Power Button

        // Back Logo Emblem
        const logo = new THREE.Mesh(
            new THREE.CircleGeometry(0.24, 24),
            new THREE.MeshStandardMaterial({ color: 0x758087, metalness: 0.5, roughness: 0.35 })
        );
        logo.rotation.y = Math.PI;
        logo.scale.y = 1.15;
        logo.position.set(0, -0.22, -0.263);
        phone.add(logo);

        // Initial Pose
        phone.rotation.set(stateRef.current.targetRotX, stateRef.current.targetRotY, stateRef.current.baseRotZ);
        phone.position.set(0, -0.15, 0);
        scene.add(phone);

        // ── 6. Studio Lighting Setup ─────────────────────────────────
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 2.2);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
        keyLight.position.set(-5, 7, 7);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x9bdde8, 2.2);
        rimLight.position.set(6, 2, -5);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
        fillLight.position.set(-5, -3, 2);
        scene.add(fillLight);

        // Soft Ground Shadow
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(2.1, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.y = 0.35;
        shadow.position.set(0, -3.6, -0.3);
        scene.add(shadow);

        // ── 7. Resize Handler ────────────────────────────────────────
        function handleResize() {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);

            const baseZ = width < 420 ? 14.5 : width < 640 ? 13.8 : 13.2;
            camera.position.set(0, -0.15, baseZ);
        }

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        handleResize();

        // ── 8. Pointer Event Handlers for 360 Drag ───────────────────
        const state = stateRef.current;

        const onPointerDown = (e) => {
            state.dragging = true;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
            state.velocityX = 0;
            state.velocityY = 0;
            canvas.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e) => {
            if (!state.dragging) return;
            const dx = e.clientX - state.lastX;
            const dy = e.clientY - state.lastY;
            state.velocityY = dx * 0.009;
            state.velocityX = dy * 0.006;
            state.targetRotY += state.velocityY;
            state.targetRotX = Math.max(-0.55, Math.min(0.48, state.targetRotX + state.velocityX));
            state.lastX = e.clientX;
            state.lastY = e.clientY;
            if (onRotate) onRotate(phone.rotation);
        };

        const onPointerUp = (e) => {
            state.dragging = false;
            try {
                if (canvas.hasPointerCapture(e.pointerId)) {
                    canvas.releasePointerCapture(e.pointerId);
                }
            } catch {
                // Ignore pointer capture errors
            }
        };

        const onDblClick = () => {
            resetPosition();
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);
        canvas.addEventListener("dblclick", onDblClick);

        // ── 9. Animation Loop ────────────────────────────────────────
        let animationFrameId;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (state.isSpinning && !state.dragging) {
                state.targetRotY += 0.0055;
            }

            if (!state.dragging && !state.isSpinning) {
                state.targetRotY += state.velocityY;
                state.targetRotX = Math.max(-0.55, Math.min(0.48, state.targetRotX + state.velocityX));
                state.velocityY *= 0.92;
                state.velocityX *= 0.9;
            }

            // Smooth interpolation towards targets
            phone.rotation.y += (state.targetRotY - phone.rotation.y) * 0.12;
            phone.rotation.x += (state.targetRotX - phone.rotation.x) * 0.12;

            // Idle breathing float and smooth Z rotation when not dragging
            if (!state.dragging) {
                const t = Date.now() * 0.0016;
                const targetZ = state.baseRotZ + (state.autoBreath ? Math.sin(t) * 0.012 : 0);
                phone.rotation.z += (targetZ - phone.rotation.z) * 0.15;
                const targetPosY = -0.15 + (state.autoBreath ? Math.cos(t * 0.9) * 0.025 : 0);
                phone.position.y += (targetPosY - phone.position.y) * 0.12;
            }

            shadow.scale.x = 1 + Math.abs(Math.sin(phone.rotation.y)) * 0.12;
            renderer.render(scene, camera);
        };

        threeRefs.current = { camera, renderer, phone };
        animate();

        // ── 10. Clean Cleanup on Unmount ─────────────────────────────
        return () => {
            threeRefs.current = { camera: null, renderer: null, phone: null };
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            canvas.removeEventListener("dblclick", onDblClick);

            renderer.dispose();
            screenTexture.dispose();
            scene.clear();
        };
    }, [initialRotX, initialRotY, initialRotZ, onRotate, resetPosition]);

    return (
        <div className={`relative flex flex-col items-center w-full max-w-[440px] sm:max-w-[460px] mx-auto select-none ${className}`}>
            
            {/* ── Cheerful Radiating Signal Arcs ── */}
            {showBadge && (
                <div className="absolute -top-3 right-6 sm:right-8 pointer-events-none select-none z-0 text-[#00A896] opacity-90 animate-pulse">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-6" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                        <path d="M14 10C21 14 26 21 28 30" />
                        <path d="M22 8C29 13 34 20 36 29" strokeWidth="2.6" />
                    </svg>
                </div>
            )}

            {/* ── Native 3D WebGL Canvas Container ── */}
            <div
                ref={containerRef}
                className={`relative w-full ${heightClass} flex items-center justify-center`}
            >
                {/* Soft ambient glow to blend seamlessly with background */}
                <div className="absolute inset-x-6 inset-y-12 bg-gradient-to-tr from-teal-400/20 via-sky-300/15 to-emerald-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

                <canvas
                    ref={canvasRef}
                    className="w-full h-full bg-transparent border-0 cursor-grab active:cursor-grabbing relative z-10 touch-none"
                    style={{ background: "transparent" }}
                />
            </div>

            {/* ── Interactive 3D Turntable Control Pill ── */}
            {showControls && (
                <div className="relative -mt-6 sm:-mt-8 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/10 text-xs text-slate-700 transition-all hover:bg-white hover:shadow-xl">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>3D Interaktif</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">Geser untuk memutar</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <button
                        type="button"
                        onClick={toggleSpin}
                        className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                            isSpinning
                                ? "bg-teal-600 text-white font-semibold"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Putar otomatis ponsel"
                    >
                        {isSpinning ? "Jeda" : "Putar"}
                    </button>
                    <button
                        type="button"
                        onClick={resetPosition}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                        title="Atur ulang sudut awal"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
});

export default Phone3D;
