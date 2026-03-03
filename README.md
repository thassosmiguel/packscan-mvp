# 📦 PackScan - MVP (Prova de Conceito)

> **Aviso de Transparência:** Não escrevi as linhas de código deste projeto manualmente. Todo o código (Node.js, HTML, JavaScript e Three.js) foi 100% gerado por Inteligência Artificial sob a minha direção. 

### 🎯 O Objetivo deste Repositório
Meu objetivo com este projeto é demonstrar a minha capacidade de **identificar um problema real de negócios e orquestrar a tecnologia para resolvê-lo**. 

Atuei no papel de Arquiteto de Soluções e Product Owner: idealizei o fluxo do usuário, defini as regras de negócio matemáticas e guiei a IA como uma ferramenta para construir um Produto Mínimo Viável (MVP) funcional de ponta a ponta, validando a viabilidade técnica da ideia.

### 🚨 O Problema
Empresas de embalagens personalizadas perdem vendas e geram atrito porque o cliente final não sabe calcular o tamanho exato e o volume da caixa que precisa para o seu produto. Isso gera orçamentos errados, desperdício de material de papelão e lentidão no atendimento.

### 💡 A Solução (O que o app faz)
O PackScan é um protótipo web que demonstra como automatizar e facilitar essa jornada para o cliente. O MVP construído conta com:
1. **Simulador de Scanner:** Uma interface que acessa a câmera para simular a captura das medidas do objeto.
2. **Motor de Cálculo Backend:** Um servidor em Node.js que recebe as dimensões, calcula o volume com uma margem de segurança de 10% e precifica automaticamente com base no tipo de material escolhido (Papelão, Kraft ou Premium).
3. **Visualização 3D em Tempo Real:** Uso da biblioteca Three.js para desenhar a caixa na tela exatamente com as proporções calculadas, permitindo ao usuário girar o modelo em 3D e aplicar sua própria logomarca na embalagem.

### 🚀 Visão de Futuro (Próximos Passos)
Para transformar este protótipo em um aplicativo pronto para o mercado, a evolução técnica exigiria:
* Migração do front-end para um framework mobile (como React Native).
* Substituição do "scanner simulado" por uma integração real com motores de Realidade Aumentada, como **ARCore** (Android) e **ARKit** (iOS), utilizando sensores do aparelho para leitura real de profundidade.
