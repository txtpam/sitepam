# Site — Pamela Burigo Fotografia

Site em **Next.js** (React) com um **modo de edição visual** ([Puck](https://puckeditor.com)), para a Pamela montar e alterar as páginas sem programar: ela arrasta blocos como **Foto**, **Carrossel** e **Álbum**, envia fotos e publica.

Identidade visual de acordo com o Manual da Marca v3: paleta (preto, off-white, azul-petróleo, terracota), fonte Inter, logos oficiais em `public/marca/`, terracota sobre petróleo bloqueado.

## Como a Pamela usa

1. Acessar `https://SEU-SITE/editar` e entrar com a senha.
2. Escolher a página e clicar em **Editar**. Para criar um álbum ou ensaio novo, use **Criar página nova**.
3. Arrastar blocos da coluna da esquerda para a página. Clicar em um bloco para trocar fotos, textos e cores na coluna da direita.
4. Clicar em **Publicar**.

### Blocos disponíveis

| Grupo | Blocos |
|---|---|
| Fotos | Foto · Carrossel de fotos · Álbum (grade ou mosaico, com ampliação ao clicar) · Portfólio (capas de ensaios) · Vídeo |
| Textos | Destaque (abertura com foto grande) · Texto · Foto ao lado de texto · Frase em destaque · Contato |
| Estrutura | Cabeçalho · Rodapé · Colunas (2 ou 3 colunas com outros blocos dentro) · Espaço / linha |

As fotos são reduzidas automaticamente no navegador (lado maior de 2400 px) antes do envio. Dá para enviar várias de uma vez no Carrossel e no Álbum.

## Publicar na Vercel (uma vez só)

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: **Add New › Project**, importe o repositório. Framework: Next.js (detectado sozinho).
3. Antes ou depois do primeiro deploy, em **Settings › Environment Variables**, crie:
   - `ADMIN_PASSWORD`: a senha da Pamela para o modo de edição.
   - (opcional) `SESSION_SECRET`: um texto aleatório longo.
4. Em **Storage › Create Database › Blob**, crie um Blob Store (acesso **public**) e conecte ao projeto. A variável `BLOB_READ_WRITE_TOKEN` é criada automaticamente.
5. Faça um **Redeploy** para as variáveis entrarem em vigor.
6. (Opcional) Em **Settings › Domains**, conecte o domínio próprio.

Para desfazer uma publicação errada: cada publicação guarda uma versão em `paginas/<pagina>/` no Blob Store (as 15 mais recentes). Apagar a versão mais nova no painel do Blob faz a página voltar à anterior (em até 1 hora, ou na hora ao publicar de novo).

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # defina ADMIN_PASSWORD
npm run dev
```

Sem `BLOB_READ_WRITE_TOKEN`, páginas e fotos ficam na pasta `.data/`, que não vai para o Git.

## Estrutura

```
app/[[...slug]]/page.tsx   site público (cache, atualizado ao publicar)
app/editar/                lista de páginas e editor (exige login)
app/entrar/                login
app/api/upload/            autorização de envio de fotos
puck.config.tsx            definição de todos os blocos e campos do editor
components/blocos/         Carrossel, Álbum, Cabeçalho, Lightbox…
components/editor/         editor, campos de foto/galeria, tradução pt-BR
lib/storage.ts             leitura/gravação (Vercel Blob ou .data/)
app/globals.css            estilos da marca
```
