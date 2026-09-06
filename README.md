# Filas Orlando v2

## Novidades
- abas Prioritárias, Atrações, Shows e Restaurantes
- busca por nome
- catálogo completo via `GET /v1/entity/{parkId}/children`
- filas/status via `GET /v1/entity/{parkId}/live`
- opção de incluir os itens visíveis no texto copiado
- restaurantes sem estado ao vivo aparecem como `sem live`
- shows exibem próximo horário quando o live fornece agenda
- atualização live limitada a 1 chamada por parque a cada 5 minutos

## GitHub Pages
Substitua os arquivos da versão anterior pelos arquivos deste pacote, faça commit na `main` e aguarde o Pages publicar.

## Rodar localmente
```bash
python3 -m http.server 8080
```

## Teste
```bash
node test.mjs
```

A única fonte de dados é ThemeParks.wiki.


## Atualizando da V1 para V2.1

Este pacote foi preparado para ser extraído diretamente na raiz do repositório.
Depois do commit, abra o site com `?v=21` uma vez, por exemplo:

`https://SEU-USUARIO.github.io/SEU-REPOSITORIO/?v=21`

Se ainda aparecer “Filas prioritárias”, o GitHub Pages ainda está servindo o `index.html` antigo da raiz. Confira no repositório se o arquivo `index.html` contém `ORLANDO LIVE · V2.1`.


## V2.2
O conteúdo de **Copiar para ChatGPT** acompanha automaticamente a aba atual e também a busca:
- Prioritárias → prioridades visíveis;
- Atrações → atrações visíveis;
- Shows → shows visíveis;
- Restaurantes → restaurantes visíveis.

Não há mais checkbox para ativar esse comportamento.
