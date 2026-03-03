let scene, camera, renderer, box, controls, streamGlobal;
let isFrontCamera = false; // Começa sempre com a câmera traseira do celular, ou a frontal padrão do PC.

async function iniciarScan() {
    const video = document.getElementById('webcam');
    const line = document.getElementById('scan-line');
    const overlay = document.getElementById('camera-overlay');
    const btnStop = document.getElementById('btn-parar');
    const btnVirar = document.getElementById('btn-virar');

    // Desliga a câmera atual para carregar a nova configuração sem problemas de lentidão
    if (streamGlobal) {
        streamGlobal.getTracks().forEach(track => track.stop());
    }

    const facingMode = isFrontCamera ? "user" : "environment"; // Define se será frontal ou traseira

    try {
        streamGlobal = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
        });
        
        video.srcObject = streamGlobal;
        line.style.display = 'block';
        overlay.style.display = 'none';
        btnStop.style.display = 'block';
        btnVirar.style.display = 'block'; // Ativa o botão de virar

    } catch (err) {
        alert("Erro ao acessar câmera. Verifique as permissões de vídeo.");
    }
}

// Virar a Câmera e reiniciar a função de scan com os novos parâmetros (frente e verso)
function virarCamera() {
    isFrontCamera = !isFrontCamera;
    iniciarScan();
}

function pararScan() {
    if (streamGlobal) {
        streamGlobal.getTracks().forEach(track => track.stop());
        document.getElementById('webcam').srcObject = null;
        document.getElementById('scan-line').style.display = 'none';
        document.getElementById('camera-overlay').style.display = 'flex';
        document.getElementById('btn-parar').style.display = 'none';
        document.getElementById('btn-virar').style.display = 'none';
    }
}

function init3D(l, a, p, logoUrl) {
    const container = document.getElementById('canvas-3d');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

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

async function calcularEGerar() {
    const file = document.getElementById('logoInput').files[0];
    const logoUrl = file ? URL.createObjectURL(file) : null;

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
            return;
        }

        document.getElementById('resultado').innerHTML = `
            <div style="background:#e0e7ff; padding:15px; border-radius:12px; margin-bottom:15px;">
                <strong>Preço Estimado: ${res.precoEstimado}</strong><br>
                <small>Volume: ${res.volumeCalculado}</small>
            </div>
        `;

        init3D(dados.largura, dados.altura, dados.profundidade, logoUrl);
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    }
}

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