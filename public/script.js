let scene, camera, renderer, box;

// Ativa a câmera real do usuário
async function setupCamera() {
    const video = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.log("Câmera não disponível ou bloqueada.");
    }
}

setupCamera();

function init3D(l, a, p, logoUrl) {
    const container = document.getElementById('canvas-3d');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(l/10, a/10, p/10);
    
    // Se tiver logo, aplica como textura
    let material;
    if (logoUrl) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(logoUrl);
        material = new THREE.MeshBasicMaterial({ map: texture });
    } else {
        material = new THREE.MeshNormalMaterial();
    }

    box = new THREE.Mesh(geometry, material);
    scene.add(box);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        box.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

async function calcularEGerar() {
    const file = document.getElementById('logoInput').files[0];
    let logoUrl = null;
    if (file) logoUrl = URL.createObjectURL(file);

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
        <div style="background:#e0e7ff; padding:15px; border-radius:8px; margin-top:10px;">
            <strong>${res.material.toUpperCase()}</strong><br>
            Volume: ${res.volumeCalculado} | Preço: ${res.precoEstimado}
        </div>
    `;

    init3D(dados.largura, dados.altura, dados.profundidade, logoUrl);
}