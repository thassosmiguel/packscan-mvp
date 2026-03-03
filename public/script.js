let scene, camera, renderer, box, controls;

// 1. GATILHO DA CÂMERA: Só liga quando o usuário clica
async function iniciarScan() {
    const video = document.getElementById('webcam');
    const line = document.getElementById('scan-line');
    const overlay = document.getElementById('camera-overlay');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        line.style.display = 'block'; // Ativa a linha de animação
        overlay.style.display = 'none'; // Remove o botão de início
    } catch (err) {
        alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
}

// 2. FUNÇÃO 3D: Cria a caixa e permite que o usuário mexa nela
function init3D(l, a, p, logoUrl) {
    const container = document.getElementById('canvas-3d');
    container.innerHTML = ''; // Limpa o 3D anterior

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // CONTROLES ORBITAIS: Permite girar e dar zoom com o mouse/dedo
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const geometry = new THREE.BoxGeometry(l/10, a/10, p/10);
    
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
        controls.update(); // Necessário para o movimento manual funcionar
        renderer.render(scene, camera);
    }
    animate();
}

// 3. LÓGICA DE NEGÓCIO: Envia para o servidor e mostra o preço
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

    try {
        const response = await fetch('/orcamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.erro) {
            alert(res.erro);
        } else {
            document.getElementById('resultado').innerHTML = `
                <div style="background:#e0e7ff; padding:15px; border-radius:8px; margin-bottom:15px; border-left: 5px solid #6366f1;">
                    <strong>Material:</strong> ${res.material.toUpperCase()}<br>
                    <strong>Volume:</strong> ${res.volumeCalculado}<br>
                    <strong>Preço Estimado:</strong> <span style="font-size:1.2em; color:#4f46e5;">${res.precoEstimado}</span>
                </div>
            `;
            init3D(dados.largura, dados.altura, dados.profundidade, logoUrl);
        }
    } catch (error) {
        console.error("Erro no fetch:", error);
        alert("Erro ao conectar com o servidor.");
    }
}

// 4. RESPONSIVIDADE: Ajusta o 3D se a tela mudar de tamanho
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const container = document.getElementById('canvas-3d');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});