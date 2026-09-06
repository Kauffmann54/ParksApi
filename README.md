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
