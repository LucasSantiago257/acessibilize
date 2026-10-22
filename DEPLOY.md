# Próxima hospedagem do Acessibilize

## Situação atual

O site já está publicado no Sites, com acesso privado. A interface está em `public/`, a API em `app/api/community/route.ts`, e as contribuições e notas ficam no banco D1 vinculado à hospedagem. A base inicial do OpenStreetMap vem nos arquivos do projeto; os registros dos visitantes ficam no banco e exigem uma transferência separada.

O projeto usa Vinext, Vite e Cloudflare Workers. Apesar de haver uma dependência de Next.js no starter, ele não usa hoje o build padrão do Next.js para Vercel. O aplicativo possui login próprio com usuário e senha e sessões no D1; o acesso privado do Sites é um controle adicional da hospedagem.

## Caminhos possíveis

| Caminho | O que pode ser preservado | Trabalho necessário |
| --- | --- | --- |
| Cloudflare Workers + D1 em uma conta própria | Interface, base inicial, runtime Workers, SQL e estrutura de migrações | Configurar conta e banco próprios, autenticação independente, transferência de dados, domínio e deploy. |
| Vercel + Next.js + banco gerenciado, por exemplo Supabase | Interface, base inicial, validação de formulários e regras de médias | Adaptar o build para Next.js/Vercel, substituir os acessos ao D1, configurar banco e autenticação independentes, transferir dados e validar a API. |

**Recomendação para o projeto atual:** Cloudflare Workers + D1 representa a migração menor, por preservar a tecnologia já usada no backend. Essa é uma avaliação do código atual, não uma restrição da Vercel. Vercel continua sendo uma alternativa se houver preferência pela plataforma.

## Ordem de execução sugerida

1. Definir a plataforma e conectar uma conta de propriedade do grupo.
2. Definir o login dos colaboradores, por exemplo e-mail ou Google através de um provedor de autenticação. A leitura pública e a exigência de login para contribuir devem ser configuradas separadamente.
3. Preservar a validação das sessões do aplicativo no servidor. As contribuições já usam essa sessão, sem confiar em cabeçalhos de identidade enviados pelo visitante. Caso a plataforma mude, revisar também os controles do starter e o acesso à página.
4. Criar o banco de produção e aplicar as três migrações existentes, mantendo as três notas opcionais, o histórico de visitas e as tabelas de usuários e sessões.
5. Exportar as contribuições da hospedagem atual e importá-las no novo banco. A base inicial de 761 locais continua nos arquivos.
6. Fazer um deploy de prévia e verificar login, publicação, persistência entre contas, médias, notas ausentes e reenvios sem duplicação.
7. Configurar o domínio e publicar a versão de produção após a verificação.

O código ainda depende do binding D1 e da configuração de hospedagem; enviar apenas `public/` para uma hospedagem estática publica a interface, mas não o login nem os registros compartilhados. O trabalho de migração deve manter o login e os dados funcionando junto com a interface.

## Referências oficiais consultadas

- Vinext e Cloudflare Workers: https://vinext.dev/docs/deploying/cloudflare
- D1 e seu binding no Worker: https://developers.cloudflare.com/d1/worker-api/
- Next.js na Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Exemplo de autenticação Supabase no Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs

Consulta em 20/10/2026. A recomendação não depende de preços ou promessas de planos gratuitos.
