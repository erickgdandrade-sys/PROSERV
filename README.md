# Proserv Serviços — Landing page

Landing page institucional da **Proserv Serviços LTDA** (Criciúma – SC), construída com o brand kit oficial da marca.

Site estático (HTML + CSS + JavaScript), sem build: basta abrir o `index.html` ou publicar a pasta em qualquer hospedagem (GitHub Pages, Netlify, Vercel, Hostinger…).

## Estrutura

```
index.html          página única com todas as seções
css/style.css       estilos e responsividade
js/config.js        ✏️ dados de contato (WhatsApp, telefone, e-mail, endereço, CNPJ)
js/main.js          animações e interações
assets/img/         logo, ícone, símbolo e foto da fachada
```

## Antes de publicar — edite `js/config.js`

```js
window.PROSERV_CONFIG = {
  whatsapp: "5548999999999",          // DDI + DDD + número, só dígitos
  phoneDisplay: "(48) 99999-9999",
  email: "contato@seudominio.com.br",
  address: "Rua Exemplo, 123 — Criciúma – SC",
  cnpj: "00.000.000/0001-00"
};
```

O formulário de orçamento abre o WhatsApp com a mensagem já preenchida. Se o WhatsApp estiver vazio, ele abre o e-mail.

## Movimento e interações

- Tela de carregamento com o ícone da marca
- Título do hero entrando palavra por palavra, escudo desenhado em traço e partículas que reagem ao mouse
- Parallax no hero, na foto da seção "Sobre" e no leão de fundo
- Contadores animados (20+, 150+, 100%)
- Faixa vermelha em movimento contínuo que inclina conforme a velocidade da rolagem
- Cards de serviço com inclinação 3D e brilho que segue o cursor
- Linha do processo preenchida durante a rolagem
- Botões magnéticos, barra de progresso de leitura, header que se esconde ao rolar e botão flutuante de WhatsApp
- Respeita a preferência de "reduzir movimento" do sistema

Animações feitas com [GSAP](https://gsap.com/) + ScrollTrigger (via CDN). Fontes: Saira (títulos, alternativa web para a Eurostile Extended do logotipo) e Inter (textos), via Google Fonts.

## Publicar no GitHub Pages

Settings → Pages → Branch `main` / pasta `/ (root)` → Save.
