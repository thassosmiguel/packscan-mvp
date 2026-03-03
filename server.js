const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

app.post('/orcamento', (req, res) => {
    const { largura, altura, profundidade, material } = req.body;

    if (!largura || !altura || !profundidade || !material) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const volume = largura * altura * profundidade;
    const volumeFinal = volume * 1.1; // Margem de 10%

    let precoPorCm3;
    switch (material.toLowerCase()) {
        case 'papelão': precoPorCm3 = 0.0005; break;
        case 'kraft': precoPorCm3 = 0.0007; break;
        case 'premium': precoPorCm3 = 0.001; break;
        default: return res.status(400).json({ erro: 'Material inválido.' });
    }

    const precoFinal = volumeFinal * precoPorCm3;

    res.json({
        material,
        volumeCalculado: volumeFinal.toFixed(2) + " cm³",
        precoEstimado: "R$ " + precoFinal.toFixed(2)
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});