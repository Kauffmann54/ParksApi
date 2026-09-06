# Filas Orlando — ThemeParks.wiki

Aplicação web mobile-first em HTML/CSS/JavaScript puro para consultar filas prioritárias e copiar um resumo compacto para o ChatGPT.

## Como funciona

- Usa `GET https://api.themeparks.wiki/v1/entity/{parkId}/live`.
- Cruza atrações por `entityId` estável.
- `strategy_overlay.runtime.json` define o conjunto prioritário (`priorityBase >= 3.5`).
- `aliases.json` define os nomes curtos.
- Não usa nenhuma API alternativa de filas.
- Bloqueia novas chamadas ao mesmo parque por 5 minutos.
- Cache local é apenas contingência e é rotulado como **DESATUALIZADO** quando a atualização falha.
- O Service Worker nunca intercepta/cacheia a API live.

## CORS

A implementação padrão chama a API diretamente do navegador. A documentação oficial do SDK JavaScript da ThemeParks.wiki declara suporte a evergreen browsers e usa `fetch` para a API v1.

Se futuramente CORS deixar de funcionar, há um `cloudflare-worker.js` opcional no repositório. Nesse caso, publique o Worker e altere em `app.js` a montagem da URL para usar seu Worker.

## Rodar localmente

Não abra `index.html` com `file://`, pois PWA/fetch funcionam melhor em HTTP.

Com Python:
```bash
python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.

Ou com Node:
```bash
npx serve .
```

## Testes

Requer Node 18+:

```bash
node test.mjs
```

O teste cobre:
- OPERATING + waitTime
- DOWN
- CLOSED
- REFURBISHMENT
- tempo desconhecido
- atração sem dado

## Publicar grátis no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione `main` e `/ (root)`.
6. Salve.
7. Abra a URL fornecida pelo GitHub Pages.

Como todos os caminhos são relativos (`./`), funciona também em `https://usuario.github.io/nome-do-repo/`.

## Instalar como PWA

### iPhone
Abra no Safari → Compartilhar → **Adicionar à Tela de Início**.

### Android
Abra no Chrome → menu → **Instalar app** / **Adicionar à tela inicial**.

## Cloudflare Worker (fallback de CORS)

1. Crie um Worker no Cloudflare.
2. Cole o conteúdo de `cloudflare-worker.js`.
3. Publique.
4. Troque no `app.js`:
   `fetch(`${API_BASE}/entity/${selectedPark.parkId}/live`, ...)`
   por algo como:
   `fetch(`https://SEU-WORKER.workers.dev/?parkId=${selectedPark.parkId}`, ...)`

O Worker continua consultando exclusivamente a ThemeParks.wiki.

## Ajustando prioridades

Edite `strategy_overlay.runtime.json`. A tela inclui itens com `priorityBase >= 3.5`.
Para esconder uma atração, reduza a prioridade abaixo de 3.5 ou remova a entrada.
