let scene, camera, renderer, cube;

function init3D(l, a, p) {
    const container = document.getElementById('canvas-3d');
    container.innerHTML = ''; // Limpa o 3D anterior

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    // Cria a caixa com as dimensões proporcionais
    const geometry = new THREE.BoxGeometry(l/10, a/10, p/10);
    const material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

async function calcularOrcamento() {
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

        const resultado = await response.json();

        if (resultado.erro) {
            alert(resultado.erro);
        } else {
            document.getElementById('resultado').innerHTML = `
                <p><strong>Volume Final:</strong> ${resultado.volumeCalculado}</p>
                <p><strong>Preço Estimado:</strong> ${resultado.precoEstimado}</p>
            `;
            // Inicia o 3D com as medidas
            init3D(dados.largura, dados.altura, dados.profundidade);
        }
    } catch (error) {
        console.error('Erro na chamada:', error);
        alert('Erro ao conectar com o servidor.');
    }
}