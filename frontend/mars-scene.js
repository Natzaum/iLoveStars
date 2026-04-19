import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const container = document.getElementById('mars-scene');

if (container) {
    initMarsScene(container);
}

async function initMarsScene(containerElement) {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerElement.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.1, 4.8);

    const ambientLight = new THREE.HemisphereLight(0xffe2c4, 0x10192d, 1.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffc38a, 2.7);
    sunLight.position.set(4.5, 1.8, 5.2);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x8db0ff, 0.72);
    fillLight.position.set(-4.2, -1.5, -2.8);
    scene.add(fillLight);

    const textureBundle = await loadMarsTextures();

    const mars = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 128, 128),
        new THREE.MeshStandardMaterial({
            map: textureBundle.color,
            bumpMap: textureBundle.bump,
            bumpScale: 0.06,
            roughnessMap: textureBundle.roughness,
            roughness: 0.98,
            metalness: 0
        })
    );
    mars.rotation.z = -0.08;
    scene.add(mars);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.58, 64, 64),
        new THREE.MeshPhongMaterial({
            color: 0xffb38a,
            transparent: true,
            opacity: 0.1,
            shininess: 18,
            side: THREE.BackSide
        })
    );
    scene.add(atmosphere);

    const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: buildGlowTexture(),
            color: 0xff9a66,
            transparent: true,
            opacity: 0.26,
            depthWrite: false
        })
    );
    glow.scale.set(4.8, 4.8, 1);
    glow.position.set(-0.05, 0.03, -0.2);
    scene.add(glow);

    const dustRing = new THREE.Mesh(
        new THREE.RingGeometry(1.9, 2.45, 128),
        new THREE.MeshBasicMaterial({
            map: buildDustRingTexture(),
            transparent: true,
            opacity: 0.14,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    dustRing.rotation.x = Math.PI / 2.4;
    dustRing.rotation.z = -0.2;
    scene.add(dustRing);

    const stars = buildStars();
    scene.add(stars);

    const pointer = { x: 0, y: 0 };
    let idleRotation = 0;

    function resize() {
        const { clientWidth, clientHeight } = containerElement;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
    }

    function handlePointerMove(event) {
        const rect = containerElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function animate() {
        idleRotation += 0.0021;

        mars.rotation.y += 0.0033;
        mars.rotation.x += ((pointer.y * 0.14) - mars.rotation.x) * 0.025;
        mars.rotation.y += ((pointer.x * 0.16) - 0.02) * 0.01;

        atmosphere.rotation.y = mars.rotation.y * 0.985;
        atmosphere.rotation.x = mars.rotation.x * 0.7;

        dustRing.rotation.z += 0.0013;
        glow.material.opacity = 0.23 + Math.sin(idleRotation * 1.3) * 0.03;

        stars.rotation.y += 0.00018;
        stars.rotation.x = pointer.y * 0.025;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    containerElement.addEventListener('pointermove', handlePointerMove);
    containerElement.addEventListener('pointerleave', () => {
        pointer.x = 0;
        pointer.y = 0;
    });

    resize();
    animate();
}

async function loadMarsTextures() {
    const loader = new THREE.TextureLoader();

    try {
        const colorTexture = await loader.loadAsync('../images/mars-texture.jpg');
        prepareTexture(colorTexture);

        return {
            color: colorTexture,
            bump: buildHeightTextureFromImage(colorTexture.image),
            roughness: buildRoughnessTextureFromImage(colorTexture.image)
        };
    } catch (error) {
        console.warn('Mars texture could not be loaded, using procedural fallback.', error);
        return buildFallbackMarsTextures();
    }
}

function prepareTexture(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
}

function buildHeightTextureFromImage(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        const luminance = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        const adjusted = Math.max(58, Math.min(210, luminance * 0.88 + 22));
        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
        data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

function buildRoughnessTextureFromImage(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        const luminance = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        const roughness = Math.max(170, Math.min(248, 255 - luminance * 0.35));
        data[i] = roughness;
        data[i + 1] = roughness;
        data[i + 2] = roughness;
        data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

function buildFallbackMarsTextures() {
    const width = 2048;
    const height = 1024;

    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bumpCtx = bumpCanvas.getContext('2d');

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = width;
    roughCanvas.height = height;
    const roughCtx = roughCanvas.getContext('2d');

    const base = colorCtx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#5c271d');
    base.addColorStop(0.2, '#8c3f27');
    base.addColorStop(0.45, '#b65533');
    base.addColorStop(0.72, '#9b452b');
    base.addColorStop(1, '#65261d');
    colorCtx.fillStyle = base;
    colorCtx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, width, height);

    roughCtx.fillStyle = '#d8d8d8';
    roughCtx.fillRect(0, 0, width, height);

    for (let i = 0; i < 2600; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 8 + Math.random() * 52;
        const alpha = 0.04 + Math.random() * 0.16;
        const dust = colorCtx.createRadialGradient(x, y, 0, x, y, radius);
        const hue = Math.random() > 0.7 ? '255, 195, 156' : '96, 40, 26';
        dust.addColorStop(0, `rgba(${hue}, ${alpha})`);
        dust.addColorStop(1, `rgba(${hue}, 0)`);
        colorCtx.fillStyle = dust;
        colorCtx.beginPath();
        colorCtx.arc(x, y, radius, 0, Math.PI * 2);
        colorCtx.fill();
    }

    for (let i = 0; i < 40; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 40 + Math.random() * 130;

        const craterColor = colorCtx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
        craterColor.addColorStop(0, 'rgba(72, 26, 18, 0.52)');
        craterColor.addColorStop(0.45, 'rgba(121, 52, 33, 0.2)');
        craterColor.addColorStop(1, 'rgba(121, 52, 33, 0)');
        colorCtx.fillStyle = craterColor;
        colorCtx.beginPath();
        colorCtx.arc(x, y, radius, 0, Math.PI * 2);
        colorCtx.fill();

        const craterBump = bumpCtx.createRadialGradient(x, y, radius * 0.18, x, y, radius);
        craterBump.addColorStop(0, 'rgba(70, 70, 70, 0.65)');
        craterBump.addColorStop(0.58, 'rgba(178, 178, 178, 0.2)');
        craterBump.addColorStop(1, 'rgba(128, 128, 128, 0)');
        bumpCtx.fillStyle = craterBump;
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
    }

    colorCtx.strokeStyle = 'rgba(255, 196, 149, 0.14)';
    bumpCtx.strokeStyle = 'rgba(196, 196, 196, 0.18)';
    roughCtx.strokeStyle = 'rgba(110, 110, 110, 0.16)';

    for (let i = 0; i < 34; i += 1) {
        const points = randomCurve(width, height);
        const widthLine = 12 + Math.random() * 18;

        colorCtx.lineWidth = widthLine;
        colorCtx.beginPath();
        colorCtx.moveTo(points[0], points[1]);
        colorCtx.bezierCurveTo(points[2], points[3], points[4], points[5], points[6], points[7]);
        colorCtx.stroke();

        bumpCtx.lineWidth = widthLine * 0.9;
        bumpCtx.beginPath();
        bumpCtx.moveTo(points[0], points[1]);
        bumpCtx.bezierCurveTo(points[2], points[3], points[4], points[5], points[6], points[7]);
        bumpCtx.stroke();

        roughCtx.lineWidth = widthLine * 1.1;
        roughCtx.beginPath();
        roughCtx.moveTo(points[0], points[1]);
        roughCtx.bezierCurveTo(points[2], points[3], points[4], points[5], points[6], points[7]);
        roughCtx.stroke();
    }

    paintPolarCap(colorCtx, bumpCtx, width, height, 0.11);
    paintPolarCap(colorCtx, bumpCtx, width, height, 0.89);

    const color = new THREE.CanvasTexture(colorCanvas);
    const bump = new THREE.CanvasTexture(bumpCanvas);
    const roughness = new THREE.CanvasTexture(roughCanvas);

    color.colorSpace = THREE.SRGBColorSpace;
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.ClampToEdgeWrapping;
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.ClampToEdgeWrapping;
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.ClampToEdgeWrapping;

    return { color, bump, roughness };
}

function paintPolarCap(colorCtx, bumpCtx, width, height, centerYRatio) {
    const centerY = height * centerYRatio;
    const gradient = colorCtx.createRadialGradient(width * 0.5, centerY, 0, width * 0.5, centerY, width * 0.36);
    gradient.addColorStop(0, 'rgba(247, 222, 207, 0.72)');
    gradient.addColorStop(0.5, 'rgba(238, 181, 151, 0.12)');
    gradient.addColorStop(1, 'rgba(238, 181, 151, 0)');
    colorCtx.fillStyle = gradient;
    colorCtx.fillRect(0, centerY - width * 0.2, width, width * 0.4);

    const bumpGradient = bumpCtx.createRadialGradient(width * 0.5, centerY, 0, width * 0.5, centerY, width * 0.32);
    bumpGradient.addColorStop(0, 'rgba(188, 188, 188, 0.45)');
    bumpGradient.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bumpCtx.fillStyle = bumpGradient;
    bumpCtx.fillRect(0, centerY - width * 0.18, width, width * 0.36);
}

function randomCurve(width, height) {
    return [
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
    ];
}

function buildGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(255, 214, 184, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 171, 117, 0.58)');
    gradient.addColorStop(0.6, 'rgba(201, 106, 61, 0.18)');
    gradient.addColorStop(1, 'rgba(201, 106, 61, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(canvas);
}

function buildDustRingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(255, 212, 183, 0.32)');
    gradient.addColorStop(0.5, 'rgba(255, 165, 111, 0.5)');
    gradient.addColorStop(0.8, 'rgba(255, 212, 183, 0.32)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 128);

    for (let i = 0; i < 220; i += 1) {
        ctx.fillStyle = `rgba(255, 220, 196, ${Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 128, Math.random() * 2.2 + 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function buildStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 1400; i += 1) {
        const radius = 5.8 + Math.random() * 4.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const tint = Math.random();
        if (tint > 0.82) {
            colors.push(1, 0.88, 0.75);
        } else if (tint < 0.14) {
            colors.push(0.72, 0.82, 1);
        } else {
            colors.push(1, 1, 1);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.028,
            transparent: true,
            opacity: 0.9,
            vertexColors: true,
            depthWrite: false
        })
    );
}