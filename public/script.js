let cena, camera, renderizador, caixaAtual, controles;
let texturaLogo = null;
let streamCamera = null;

// --- LÓGICA DO 3D ---
function iniciar3D() {
    const container = document.getElementById('canvas-container');
    container.style.display = 'block';
    container.innerHTML = '';

    cena = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderizador.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true; 

    const luz = new THREE.DirectionalLight(0xffffff, 1);
    luz.position.set(5, 5, 5).normalize();
    cena.add(luz);
    cena.add(new THREE.AmbientLight(0x606060));

    function animar() {
        requestAnimationFrame(animar);
        controles.update();
        renderizador.render(cena, camera);
    }
    animar();
}

function criarCaixa3D(l, a, p, materialNome) {
    if (!cena) iniciar3D();
    if (caixaAtual) cena.remove(caixaAtual);

    let corCaixa = 0xd2b48c;
    if (materialNome.toLowerCase() === 'kraft') corCaixa = 0x8b5a2b;
    if (materialNome.toLowerCase() === 'premium') corCaixa = 0xffffff;

    const geometria = new THREE.BoxGeometry(l, a, p);
    const materialPadrao = new THREE.MeshStandardMaterial({ color: corCaixa });
    const materialFrente = new THREE.MeshStandardMaterial({ color: corCaixa, map: texturaLogo || null });
    const materiais = [ materialPadrao, materialPadrao, materialPadrao, materialPadrao, materialFrente, materialPadrao ];

    caixaAtual = new THREE.Mesh(geometria, materiais);
    cena.add(caixaAtual);

    camera.position.z = Math.max(l, a, p) * 1.8;
    controles.target.set(0, 0, 0);
    controles.update();
}

// --- LÓGICA DA CÂMERA (SCANNER) ---
document.getElementById('btnAbrirScanner').addEventListener('click', async () => {
    const video = document.getElementById('camera');
    const containerScanner = document.getElementById('scanner-container');
    const btnAbrir = document.getElementById('btnAbrirScanner');

    try {
        // Pede permissão e abre a câmera traseira (se estiver no celular) ou a webcam
        streamCamera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = streamCamera;
        
        containerScanner.style.display = 'block';
        btnAbrir.style.display = 'none';
        
        // Esconde o 3D se já estiver aberto
        document.getElementById('canvas-container').style.display = 'none';
        document.getElementById('resultado').style.display = 'none';
    } catch (erro) {
        alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
});

document.getElementById('btnCapturar').addEventListener('click', () => {
    // Para a câmera
    if (streamCamera) {
        streamCamera.getTracks().forEach(track => track.stop());
    }
    
    // Esconde o scanner e volta o botão
    document.getElementById('scanner-container').style.display = 'none';
    document.getElementById('btnAbrirScanner').style.display = 'block';

    // Gera medidas aleatórias (simulando a leitura da IA) entre 5 e 30 cm
    const gerarMedida = () => Math.floor(Math.random() * 25) + 5;
    
    document.getElementById('largura').value = gerarMedida();
    document.getElementById('altura').value = gerarMedida();
    document.getElementById('profundidade').value = gerarMedida();

    // Clica no botão de calcular automaticamente
    document.getElementById('btnCalcular').click();
});

// --- LÓGICA DE UPLOAD E CÁLCULO ---
document.getElementById('logoUpload').addEventListener('change', function(evento) {
    const arquivo = evento.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            new THREE.TextureLoader().load(e.target.result, function(textura) {
                texturaLogo = textura;
                if (caixaAtual) document.getElementById('btnCalcular').click();
            });
        };
        leitor.readAsDataURL(arquivo);
    }
});

document.getElementById('btnCalcular').addEventListener('click', async () => {
    const largura = Number(document.getElementById('largura').value);
    const altura = Number(document.getElementById('altura').value);
    const profundidade = Number(document.getElementById('profundidade').value);
    const material = document.getElementById('material').value;
    const quantidade = Number(document.getElementById('quantidade').value) || 1;

    if (!largura || !altura || !profundidade) {
        alert("Abra a câmera para escanear ou digite as dimensões.");
        return;
    }

    try {
        const resposta = await fetch('/orcamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ largura, altura, profundidade, material })
        });

        const dados = await resposta.json();
        if (dados.erro) return alert(dados.erro);

        const precoTotal = (parseFloat(dados.precoEstimado.replace('R$ ', '')) * quantidade).toFixed(2);
        
        const divResultado = document.getElementById('resultado');
        divResultado.style.display = 'block';
        divResultado.innerHTML = `
            <strong>Dimensões:</strong> ${dados.dimensoesProduto.largura}x${dados.dimensoesProduto.altura}x${dados.dimensoesProduto.profundidade} cm <br>
            <strong>Material:</strong> ${dados.material} <br>
            <strong>Preço Total (${quantidade} un.):</strong> R$ ${precoTotal}
        `;

        criarCaixa3D(dados.dimensoesProduto.largura, dados.dimensoesProduto.altura, dados.dimensoesProduto.profundidade, dados.material);
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
});