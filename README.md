# Acessibilize

Mapa colaborativo de acessibilidade com **761 locais reais**, oito exemplos fictícios separados e **banco compartilhado de locais e registros de visitas**.

## Como demonstrar

Use o site hospedado. Seu acesso continua privado, conforme a configuração anterior; apenas visitantes autorizados conseguem abrir. A publicação de locais e registros exige entrar com a conta do ChatGPT. O nome ou apelido exibido é escolhido no formulário; não publicamos o identificador interno da conta.

1. Busque um lugar e abra seus detalhes.
2. Clique em **Adicionar registro** e informe nome/apelido público e data da visita.
3. Dê de 1 a 5 estrelas para acessibilidade física, visual e auditiva. Cada categoria é opcional; use “Não avaliar” quando não puder dar uma nota. Marque os recursos observados, se desejar. É preciso fornecer ao menos uma nota ou um recurso.
4. Deixe observações, confira a autorização de compartilhamento e publique.
5. Veja as médias por categoria, suas quantidades de avaliações e o histórico. Todas as notas válidas têm o mesmo peso, independentemente da data. O resumo de cada recurso também reúne todos os relatos e mostra divergências e contagens.
6. Use **Adicionar local** para publicar um espaço novo. Depois abra-o e registre os recursos observados. O cadastro aparece em “Locais da comunidade” e em “Todos os locais reais”.
7. Abra o site em outra sessão autorizada: os registros vêm do banco, sem depender do armazenamento do primeiro navegador.

Os registros são observações pessoais, não certificações. Dados originais do OpenStreetMap ficam separados em uma seção expansível. Exemplos fictícios não recebem registros compartilhados. Os filtros consideram recursos relatados; notas por categoria não são usadas para presumir a presença de um recurso específico.

## Como as médias funcionam

Cada categoria possui sua média aritmética independente: soma das notas dividida pela quantidade de notas daquela categoria. Por exemplo, física 5 e 1 resulta em 3,0; uma visita que avalia somente a visual não entra no denominador da física. O banco calcula a média sobre todos os registros avaliados, sem escolher apenas o mais recente. Exibimos uma casa decimal e o total de avaliações (registros, não pessoas distintas).

Categorias sem nota são armazenadas como NULL, nunca como zero. Registros anteriores à introdução de estrelas permanecem sem nota e não alteram as médias. Sem avaliações, a interface mostra “Sem avaliações”. As notas individuais aparecem no histórico. Reenvios do mesmo registro não criam votos duplicados; visitas diferentes podem receber avaliações próprias.

## Persistência e acesso

Novos locais e registros são armazenados no **Cloudflare D1**, compartilhado pelos visitantes autorizados. Favoritos, preferências e rascunhos ficam neste navegador. Cadastros da versão antiga continuam identificados como locais do dispositivo e podem ser publicados com confirmação.

Ao falhar a conexão, o sistema informa a indisponibilidade e mantém os rascunhos; não simula uma publicação bem-sucedida. IDs de requisição evitam duplicações em reenvios. Há validação no servidor de recursos, datas, coordenadas e comprimentos, SQL parametrizado, verificação de origem e limites por conta. Novos registros são acrescentados ao histórico; não há moderação, edição ou exclusão de relatos nesta versão acadêmica. O banco local de testes é separado do banco publicado e não é enviado na entrega.

## Base inicial

761 locais reais da região de Salvador, sob ODbL 1.0, com fontes individuais. 346 têm alguma informação de acessibilidade no OpenStreetMap, inclusive acesso limitado ou indisponível. Isso não representa 346 locais acessíveis ou vistoriados. Ausência de informação não significa ausência de acessibilidade. Oito exemplos fictícios são apenas para apresentação.

Coordenadas podem representar o centro de um edifício ou área. O trajeto externo do Google Maps não garante rota acessível. Confirme condições antes de uma visita. Veja `BASE-DE-DADOS.md` para proveniência. Créditos: © OpenStreetMap contributors, https://www.openstreetmap.org/copyright.

## Desenvolvimento

Node.js 22.13+; Vinext/Vite, Cloudflare D1, Drizzle; interface HTML/CSS/JavaScript com Leaflet e MarkerCluster.

```text
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_heavy_lady_ursula.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_clear_roughhouse.sql
npm run dev
```

Aplique cada migração uma única vez, na ordem, no banco local. Se a primeira já foi aplicada, execute apenas a segunda. A prévia abre na porta 5173; seu login local é simulado pelo starter, não pela conta real. Migrações publicadas são aplicadas pelo fluxo de hospedagem. Abrir `public/index.html` diretamente permite inspecionar a interface e base; as contribuições exigem o servidor.

```text
node scripts/test-community-api.mjs
node scripts/test-ratings.mjs
```

Os testes gravam somente no banco local. Validam a API, médias separadas por categoria, notas ausentes, registros antigos, valores inválidos, reenvios e agregação de relatos divergentes. Os registros de teste não são publicados.

## Arquivos principais

- `public/`: interface, mapa, base inicial e fluxos de contribuição.
- `app/api/community/route.ts`: API de leitura e publicação.
- `lib/community-validation.ts`: validação dos registros.
- `db/schema.ts` e `drizzle/`: esquema e migração do banco.
- `data/base-ids.json`: IDs da base aceitos pelo servidor.
- `import-osm.mjs`: atualização reproduzível da base OSM.
- `.openai/hosting.json`: identificação e binding do banco.

Evoluções possíveis: moderação, correção de cadastros duplicados, fotos, vistorias com pessoas com deficiência e validação formal com leitores de tela.

## Próxima hospedagem

Veja [DEPLOY.md](DEPLOY.md) para a comparação entre Cloudflare e Vercel, a troca de autenticação e a transferência do banco.

