let scene, camera, renderer, box, controls, streamGlobal;

// 1. GATILHO DA CÂMERA
async function iniciarScan() {
    const video = document.getElementById('webcam');
    const line = document.getElementById('scan-line');
    const overlay = document.getElementById('camera-overlay');
    const btnStop = document.getElementById('btn-parar');

    try {
        streamGlobal = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = streamGlobal;
        line.style.display = 'block';
        overlay.style.display = 'none';
        btnStop.style.display = 'block';
    } catch (err) {
        alert("Erro ao acessar câmera.");
    }
}

// 2. PARAR CÂMERA
function pararScan() {
    if (streamGlobal) {
        streamGlobal.getTracks().forEach(track => track.stop());
        document.getElementById('webcam').srcObject = null;
        document.getElementById('scan-line').style.display = 'none';
        document.getElementById('camera-overlay').style.display = 'flex';
        document.getElementById('btn-parar').style.display = 'none';
    }
}

// 3. FUNÇÃO 3D (COM AJUSTE DE CONTAINER)
function init3D(l, a, p, logoUrl) {
    const container = document.getElementById('canvas-3d');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    // Usa explicitamente a altura e largura do CSS
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const geometry = new THREE.BoxGeometry(l/10, a/10, p/10);
    let material;

    if (logoUrl) {
        const texture = new THREE.TextureLoader().load(logoUrl);
        material = new THREE.MeshBasicMaterial({ map: texture });
    } else {
        material = new THREE.MeshNormalMaterial();
    }

    box = new THREE.Mesh(geometry, material);
    scene.add(box);
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// 4. LÓGICA DE NEGÓCIO
async function calcularEGerar() {
    const file = document.getElementById('logoInput').files[0];
    const logoUrl = file ? URL.createObjectURL(file) : null;

    const dados = {
        largura: document.getElementById('largura').value,
        altura: document.getElementById('altura').value,
        profundidade: document.getElementById('profundidade').value,
        material: document.getElementById('material').value
    };

    const response = await fetch('/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    const res = await response.json();
    document.getElementById('resultado').innerHTML = `
        <div style="background:#e0e7ff; padding:15px; border-radius:12px; margin-bottom:15px;">
            <strong>Preço Estimado: ${res.precoEstimado}</strong><br>
            <small>Volume: ${res.volumeCalculado}</small>
        </div>
    `;

    init3D(dados.largura, dados.altura, dados.profundidade, logoUrl);
}

// 5. RESPONSIVIDADE CORRIGIDA (Redimensiona baseado no novo container estrito)
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const container = document.getElementById('canvas-3d');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
});