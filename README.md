# Acessibilize

Protótipo acadêmico com **761 locais reais na região de Salvador**, importados do OpenStreetMap, mais oito exemplos fictícios separados para apresentação.

## Abrir e apresentar

Extraia o ZIP e abra `dist/index.html` com internet. Não exige instalação nem chave de API. A hospedagem privada exige a conta proprietária.

1. A base padrão é “Locais reais · OpenStreetMap”. O mapa agrupa marcadores próximos; amplie ou clique em um grupo para explorar.
2. Busque nome ou bairro e filtre por categoria. A lista mostra 30 locais por vez; “Mostrar mais” carrega os próximos.
3. Combine filtros físicos, visuais e auditivos. Aparecem registros com recursos disponíveis ou parciais nas categorias selecionadas. Acesso explicitamente indisponível é excluído do filtro físico.
4. Abra um local para ver os dados exatos da fonte, data de importação e link para o registro original.
5. Para demonstrar as três categorias, selecione “Exemplos fictícios · apresentação” em “Origem dos dados”.
6. Salve favoritos e cadastre um local: ele fica neste navegador e aparece em “Meus cadastros”.
7. Experimente as opções de leitura e a alternância entre mapa e lista no celular.

## Base de dados e limites

Há **346 registros com alguma informação explícita de acessibilidade**, incluindo acesso limitado ou indisponível. Isso não representa 346 locais acessíveis ou vistoriados. Os demais aguardam informações. Ausência de dados não significa ausência de acessibilidade. Não acrescentamos recursos presumidos: acesso para cadeira de rodas não confirma sanitários adaptados, braille ou Libras.

Os oito exemplos de apresentação possuem recursos **fictícios** e ficam em uma base separada. Nenhum registro é certificado pelo Acessibilize. Confirme as condições antes de uma visita. O trajeto abre o Google Maps e não garante rota acessível.

Coordenadas de áreas podem indicar o centro do elemento, sem indicar a entrada. Endereços ou bairros ausentes na fonte são identificados. A consulta abrange uma caixa geográfica da região de Salvador e pode incluir arredores. Há até 160 locais por categoria; não é um inventário completo.

`BASE-DE-DADOS.md` documenta contagens e proveniência. `import-osm.mjs` reproduz a importação com Node.js 22+ e conexão ao Overpass. `dist/places.js` contém o recorte sob **ODbL 1.0**. Dados © OpenStreetMap contributors: https://www.openstreetmap.org/copyright.

Cadastros, favoritos e preferências ficam em armazenamento local e não são compartilhados. Localização só é solicitada ao clicar no botão e não é armazenada. Mapa, bibliotecas e fontes usam serviços externos. A base vem empacotada: a busca não precisa consultar novamente a API.

## Tecnologia

HTML, CSS e JavaScript sem build. Leaflet 1.9.4, Leaflet.markercluster 1.5.3 e OpenStreetMap.

- `dist/index.html`: interface.
- `dist/style.css`: visual responsivo e opções de leitura.
- `dist/app.js`: mapa, busca, filtros, favoritos e cadastros.
- `dist/places.js`: base real com fonte por registro.
- `import-osm.mjs`: importação reproduzível.

Evoluções: cadastro compartilhado, moderação, vistorias com pessoas com deficiência, atualização por recurso e validação formal com leitores de tela.
