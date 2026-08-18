# Verzel Elite — plataforma de eventos e ingressos

Aplicação full stack para publicação de eventos, venda de ingressos e validação
de entrada. O organizador escolhe um filme no catálogo do TMDB, configura a
sessão e publica o evento. O cliente seleciona assentos, conclui um pagamento
de teste no Stripe e recebe ingressos individuais com QR Code. Na entrada, a
portaria lê o QR Code e impede que o mesmo ingresso seja utilizado duas vezes.

## Funcionalidades

- cadastro e autenticação com perfis de cliente, organizador e portaria;
- catálogo público de eventos com filtros;
- painel do organizador para criar, publicar e acompanhar eventos;
- busca de filmes pela API do TMDB;
- seleção e reserva de assentos;
- Stripe Checkout incorporado em modo de teste;
- confirmação idempotente do pagamento por retorno e webhook;
- ingresso individual com código, QR Code e link compartilhável;
- perfil do cliente com seus ingressos;
- leitor de QR Code pela câmera e validação manual na portaria;
- registro do horário e do responsável por cada entrada.

## Tecnologias

- Next.js 16, React 19 e TypeScript;
- Tailwind CSS;
- PostgreSQL 17 e Prisma ORM 7;
- Stripe Checkout e webhooks;
- TMDB API;
- ZXing para leitura dos QR Codes.

## Infraestrutura Docker

O repositório contém o arquivo [`compose.yaml`](./compose.yaml), responsável por
subir o PostgreSQL 17 usado no desenvolvimento. Ele configura banco, usuário,
senha, volume persistente, verificação de saúde e publica o serviço localmente
na porta `5438`.

Não há `Dockerfile` para a aplicação: o Next.js é executado diretamente com
`npm run dev` ou `npm run build`. O Docker Compose é utilizado somente para o
banco de dados.

## Pré-requisitos

- Node.js 20.9 ou mais recente;
- npm;
- Docker com Docker Compose, para executar o PostgreSQL;
- uma conta gratuita no [TMDB](https://www.themoviedb.org/signup), para obter o
  token do catálogo;
- uma conta no [Stripe](https://dashboard.stripe.com/register), usada somente
  no ambiente de teste;
- uma conta gratuita e o aplicativo do [ngrok](https://ngrok.com/download), para
  expor o webhook local por uma URL HTTPS.

O ngrok é necessário no fluxo descrito neste guia porque os servidores do
Stripe não conseguem chamar diretamente um endereço `localhost`. O túnel cria
uma URL HTTPS pública e encaminha as requisições recebidas para a aplicação na
porta 3000.

## Instalação passo a passo

### 1. Instale as dependências

```bash
git clone <url-do-repositorio>
cd verzel-elite-dev
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Gere um segredo para as sessões:

```bash
openssl rand -base64 32
```

Copie o resultado para `AUTH_SECRET` no `.env`. Não envie o arquivo `.env` para
o Git e use apenas chaves Stripe de teste (`pk_test_` e `sk_test_`).

### 3. Obtenha o token do TMDB

1. Crie ou acesse sua conta no TMDB.
2. Abra **Configurações > API** e solicite acesso à API, caso ainda não tenha.
3. Copie o **API Read Access Token**.
4. Preencha `TMDB_API_READ_ACCESS_TOKEN` no `.env`.

O seed já cria eventos de demonstração, portanto o catálogo público pode ser
visualizado sem esse token. A busca de filmes no painel do organizador depende
dele.

### 4. Obtenha as chaves de teste do Stripe

1. Entre no Dashboard do Stripe e permaneça no **Sandbox/Modo de teste**.
2. Abra **Developers/Workbench > API keys**.
3. Copie a chave publicável `pk_test_...` para
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Revele a chave secreta `sk_test_...` e copie para `STRIPE_SECRET_KEY`.

Nenhuma cobrança real é feita com essas chaves. Deixe
`STRIPE_WEBHOOK_SECRET="whsec_..."` temporariamente; o valor correto será obtido
quando o endpoint do webhook for criado.

### 5. Inicie o PostgreSQL

O `compose.yaml` publica o banco na porta `5438` para evitar conflito com uma
instalação local do PostgreSQL:

```bash
docker compose up -d db
```

Depois prepare o Prisma e carregue os dados de demonstração:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 6. Inicie a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Mantenha esse terminal
aberto durante os próximos passos.

### 7. Configure o ngrok

1. Instale o [ngrok](https://ngrok.com/download) e crie uma conta gratuita.
2. No painel do ngrok, abra a seção **Your Authtoken** e copie seu token.
3. Em outro terminal, vincule a instalação à sua conta:

   ```bash
   ngrok config add-authtoken <seu-token>
   ```

4. Ainda nesse terminal, crie o túnel para a aplicação:

   ```bash
   ngrok http 3000
   ```

5. O ngrok mostrará uma linha parecida com esta:

   ```text
   Forwarding  https://seu-dominio.ngrok-free.app -> http://localhost:3000
   ```

6. Copie apenas a URL iniciada por `https://`. Mantenha o ngrok aberto; o
   webhook deixa de funcionar quando esse processo é encerrado.

No plano gratuito, a URL pode mudar quando o ngrok for reiniciado. Quando isso
acontecer, edite o endpoint no Stripe usando a nova URL.

### 8. Cadastre o webhook no Stripe

1. Entre no [Dashboard do Stripe](https://dashboard.stripe.com/) e confirme que
   está no mesmo **Sandbox/Modo de teste** usado para copiar as chaves.
2. Abra **Workbench > Webhooks** ou **Event destinations**.
3. Clique em **Create an event destination**.
4. Em **Select events**, pesquise e selecione:

   ```text
   checkout.session.completed
   checkout.session.async_payment_succeeded
   checkout.session.expired
   checkout.session.async_payment_failed
   ```

5. Avance e escolha **Webhook endpoint** como tipo de destino.
6. No campo da URL, junte a URL HTTPS do ngrok com a rota do projeto:

   ```text
   https://seu-dominio.ngrok-free.app/api/stripe/webhook
   ```

7. Finalize a criação do destino.
8. Abra o endpoint criado, localize **Signing secret**, clique em **Reveal** e
   copie o valor iniciado por `whsec_`.
9. Substitua `STRIPE_WEBHOOK_SECRET` no `.env` pelo segredo copiado.
10. Pare o Next.js com `Ctrl+C` e execute `npm run dev` novamente para carregar
    a nova variável.

O `APP_URL` pode continuar como `http://localhost:3000` quando o teste for feito
no mesmo computador. Use a URL do ngrok em `APP_URL` somente se também quiser
abrir a aplicação pelo túnel, por exemplo em um celular.

Durante o teste, deixe estes serviços ativos:

1. PostgreSQL iniciado por `docker compose up -d db`;
2. aplicação executada por `npm run dev`;
3. túnel executado por `ngrok http 3000`.

## Usuários de demonstração

O comando `npx prisma db seed` cria os usuários abaixo, além de eventos e
assentos de demonstração.

| Perfil | E-mail | Senha | Área principal |
| --- | --- | --- | --- |
| Cliente | `customer@example.com` | `Demo@123` | `/profile` |
| Organizador | `organizer@example.com` | `Demo@123` | `/organizer` |
| Portaria | `gatekeeper@example.com` | `Demo@123` | `/gatekeeper` |

Novos cadastros feitos pela tela `/signup` recebem o perfil de cliente.

## Como testar o fluxo completo

1. Entre como cliente.
2. Abra um evento publicado, selecione um ou mais assentos e avance para o
   checkout.
3. No Stripe, use o cartão de teste `4242 4242 4242 4242`, uma data futura e
   qualquer CVC de três dígitos.
4. Aguarde o retorno do checkout e abra **Meus ingressos** no perfil.
5. Abra ou compartilhe um ingresso para visualizar seu QR Code.
6. Em outra sessão do navegador, entre como portaria e acesse `/gatekeeper`.
7. Leia o QR Code com a câmera ou cole o código/link manualmente.
8. A primeira validação deve autorizar a entrada. Uma segunda tentativa deve
   informar que o ingresso já foi utilizado.

Para ler a câmera em outro dispositivo, abra a aplicação por uma origem HTTPS,
como a URL pública do ngrok, e permita o acesso à câmera no navegador.

## Comandos úteis

```bash
npm run dev                 # servidor de desenvolvimento
npm run lint                # análise estática
npx tsc --noEmit            # verificação do TypeScript
npm run build               # build de produção
npx prisma studio           # interface visual do banco
npx prisma migrate status   # estado das migrations
npx prisma db seed          # recria/atualiza os dados de demonstração
```

## Uso de IA

O OpenAI Codex foi utilizado pontualmente como ferramenta de produtividade, com
o objetivo de reduzir o tempo gasto em tarefas repetitivas e acelerar o ciclo de
desenvolvimento. O apoio ocorreu principalmente nos seguintes pontos:

- geração de estruturas iniciais, alguns componentes e páginas padrão em Next.js
  e TypeScript;
- apoio em consultas, migrations e organização dos modelos do Prisma;
- implementação e revisão do fluxo de geração e leitura de QR Codes;
- apoio na construção da interface da portaria e dos estados de validação;
- revisão de tipagem, tratamento de erros e consistência entre componentes;
- organização do README e dos passos de instalação do projeto;
- execução e interpretação de verificações como ESLint, TypeScript e build.

As sugestões recebidas foram avaliadas antes de serem incorporadas e o resultado
foi verificado de forma incremental durante o desenvolvimento.

A definição e priorização dos requisitos, as decisões técnicas, de produto e de
identidade visual, a configuração prática do Stripe Sandbox e do ngrok, o
cadastro do webhook, os testes reais do fluxo de pagamento e a validação final
da entrega foram conduzidos pelo desenvolvedor.

## Segurança

Esta configuração é destinada a desenvolvimento e avaliação local. Nunca use
chaves `sk_live_`, cartões reais ou segredos verdadeiros no repositório. Para
produção, configure as variáveis diretamente no provedor de hospedagem e
cadastre um webhook HTTPS permanente.
