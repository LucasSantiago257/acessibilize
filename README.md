# Acesso Livre

Protótipo acadêmico de mapa colaborativo de acessibilidade em Salvador, BA. Feito com HTML, CSS e JavaScript, sem instalação de dependências e sem chave de API. Mapa interativo com Leaflet 1.9.4 e OpenStreetMap.

## Como apresentar

Abra `dist/index.html` em um navegador com internet, ou sirva a pasta `dist` por um servidor HTTP. O site publicado requer acesso à conta proprietária. Para uma apresentação offline, a lista e os filtros funcionam, mas fontes externas e mapa precisam de conexão; use a fonte alternativa do sistema quando offline.

1. Apresente a ideia: ajudar pessoas com deficiência física, visual e auditiva a conhecer recursos de um espaço antes da visita.
2. Busque um lugar ou bairro, por exemplo “Barra”.
3. Combine os filtros: um local só aparece se informar recursos disponíveis em todas as categorias selecionadas.
4. Abra um local na lista ou pelo marcador para ver detalhes. Verde indica recursos disponíveis, amarelo indica recursos parciais e cinza indica ausência de informação; há descrições textuais equivalentes.
5. Salve um favorito e use o coração acima da lista para mostrar apenas favoritos.
6. Demonstre o cadastro com coordenadas em Salvador; o novo local é salvo apenas neste navegador.
7. Abra as opções de leitura para aumentar textos e contraste.

## Limites do protótipo

Os oito espaços de exemplo existem, mas seus recursos de acessibilidade são **fictícios**, sem vistoria ou certificação. Não devem orientar uma visita real. Novas contribuições são declarações não verificadas e ficam em armazenamento local (`localStorage`), assim como favoritos e preferências de leitura. Nenhum cadastro é compartilhado entre usuários. O navegador pode bloquear ou apagar o armazenamento local.

O botão de trajeto abre o Google Maps e não garante rota acessível. A localização é solicitada apenas quando o botão é acionado e não é armazenada pelo aplicativo. O mapa, bibliotecas e fontes carregam de serviços externos. Não há login, backend, avaliações reais ou mecanismo de moderação nesta versão.

## Arquivos

- `dist/index.html`: estrutura semântica em português.
- `dist/style.css`: interface responsiva, foco visível, opções de leitura e movimento reduzido.
- `dist/app.js`: dados demonstrativos, mapa, busca sem distinção de acentos, filtros, cadastros e favoritos locais.
- `.openai/hosting.json`: identificação e configuração do site hospedado.

## Evoluções possíveis

Cadastro compartilhado com moderação; levantamento real com participação de pessoas com deficiência; comprovação por recurso e data de vistoria; validação formal com leitores de tela; planejamento de rotas com dados de calçadas e travessias.

## Créditos

Leaflet: https://leafletjs.com/ · Dados cartográficos: © OpenStreetMap contributors (https://www.openstreetmap.org/copyright). Fontes DM Sans e Manrope via Google Fonts.
