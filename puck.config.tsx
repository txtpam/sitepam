"use client";

import type { Config, Fields, Slot } from "@puckeditor/core";
import {
  Botoes,
  Foto,
  Paragrafos,
  Secao,
  cx,
  linkExterno,
  proporcoes,
  type Botao,
  type Espacamento,
  type Fundo,
  type Imagem,
  type ItemGaleria,
  type Largura,
} from "@/components/blocos/comum";
import { Cabecalho, type PropsCabecalho } from "@/components/blocos/Cabecalho";
import { Carrossel, type PropsCarrossel } from "@/components/blocos/Carrossel";
import { Album, type PropsAlbum } from "@/components/blocos/Album";
import { campoGaleria, campoImagem } from "@/components/editor/campos";

/* ------------------------------------------------- opções reutilizáveis */

const opFundo = [
  { label: "Off-white (padrão)", value: "claro" },
  { label: "Branco", value: "branco" },
  { label: "Petróleo claro", value: "petroleo-claro" },
  { label: "Terracota claro", value: "terracota-claro" },
  { label: "Azul-petróleo", value: "petroleo" },
  { label: "Preto", value: "preto" },
];
const opEspacamento = [
  { label: "Normal", value: "normal" },
  { label: "Compacto", value: "compacta" },
  { label: "Sem espaço", value: "sem-espaco" },
];
const opLargura = [
  { label: "Estreita (textos)", value: "estreito" },
  { label: "Normal", value: "normal" },
  { label: "Larga", value: "largo" },
  { label: "Tela inteira", value: "cheio" },
];
const opAlinhamento = [
  { label: "Esquerda", value: "esquerda" },
  { label: "Centro", value: "centro" },
  { label: "Direita", value: "direita" },
];
const opSimNao = [
  { label: "Sim", value: true },
  { label: "Não", value: false },
];
const opProporcao = [
  { label: "Original da foto", value: "original" },
  { label: "Paisagem 3:2", value: "3:2" },
  { label: "Retrato 2:3", value: "2:3" },
  { label: "Retrato 4:5", value: "4:5" },
  { label: "Quadrada 1:1", value: "1:1" },
  { label: "Panorâmica 16:9", value: "16:9" },
  { label: "Cinema 21:9", value: "21:9" },
];

const campoBotoes = {
  type: "array" as const,
  label: "Botões",
  arrayFields: {
    texto: { type: "text" as const, label: "Texto do botão" },
    link: { type: "text" as const, label: "Link (ex.: /contato, https://wa.me/...)" },
    estilo: {
      type: "select" as const,
      label: "Estilo",
      options: [
        { label: "Destaque (terracota)", value: "destaque" },
        { label: "Escuro", value: "escuro" },
        { label: "Contorno", value: "contorno" },
      ],
    },
  },
  defaultItemProps: { texto: "Fale comigo", link: "#contato", estilo: "destaque" as const },
  getItemSummary: (b: { texto?: string }) => b.texto || "Botão",
};

const camposSecao = {
  ancora: { type: "text" as const, label: "Âncora (opcional — permite links como #sobre)" },
  fundo: { type: "select" as const, label: "Cor de fundo", options: opFundo },
  espacamento: { type: "select" as const, label: "Espaço acima e abaixo", options: opEspacamento },
};

type SecaoProps = { fundo: Fundo; espacamento: Espacamento; ancora: string };
const alinhar = (a?: string) => (a === "centro" ? "pb-alinhar-centro" : a === "direita" ? "pb-alinhar-direita" : undefined);

/* ----------------------------------------------------------- tipos */

type Props = {
  Cabecalho: PropsCabecalho;
  Destaque: {
    imagem?: Imagem;
    rotulo: string;
    titulo: string;
    subtitulo: string;
    assinatura: string;
    botoes: Botao[];
    altura: "tela" | "alta" | "media" | "auto";
    posicao: "base" | "centro" | "topo";
    alinhamento: string;
    escurecer: boolean;
    fundo: Fundo;
  };
  Foto: SecaoProps & {
    imagem?: Imagem;
    legenda: string;
    proporcao: string;
    largura: Largura;
    cantos: boolean;
    link: string;
  };
  Carrossel: SecaoProps & PropsCarrossel & { titulo: string; largura: Largura };
  Album: SecaoProps &
    PropsAlbum & {
      rotulo: string;
      titulo: string;
      descricao: string;
      alinhamento: string;
      largura: Largura;
    };
  Portfolio: SecaoProps & {
    rotulo: string;
    titulo: string;
    colunas: number;
    itens: { capa?: Imagem; categoria: string; nome: string; link: string }[];
  };
  Texto: SecaoProps & {
    rotulo: string;
    titulo: string;
    texto: string;
    alinhamento: string;
    largura: Largura;
    botoes: Botao[];
  };
  ImagemTexto: SecaoProps & {
    imagem?: Imagem;
    ladoFoto: "esquerda" | "direita";
    proporcao: string;
    cantos: boolean;
    rotulo: string;
    titulo: string;
    texto: string;
    botoes: Botao[];
  };
  Citacao: SecaoProps & { frase: string; autor: string; alinhamento: string };
  Colunas: SecaoProps & {
    colunas: number;
    espaco: number;
    alinhamentoVertical: string;
    largura: Largura;
    coluna1: Slot;
    coluna2: Slot;
    coluna3: Slot;
  };
  Contato: SecaoProps & {
    rotulo: string;
    titulo: string;
    texto: string;
    instagram: string;
    whatsapp: string;
    email: string;
    alinhamento: string;
    botoes: Botao[];
  };
  Video: SecaoProps & { url: string; titulo: string; largura: Largura };
  Espaco: { altura: number; fundo: Fundo; divisor: boolean };
  Rodape: {
    frase: string;
    instagram: string;
    whatsapp: string;
    email: string;
    cidade: string;
  };
};

type Root = { title: string; descricao: string };

/* ------------------------------------------------------- contatos */

const soDigitos = (t: string) => (t || "").replace(/\D/g, "");
const linkWhats = (t: string) => {
  const d = soDigitos(t);
  return d ? `https://wa.me/${d.length <= 11 ? `55${d}` : d}` : "";
};
const userInsta = (t: string) => (t || "").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

function ListaContatos({ instagram, whatsapp, email, linha }: { instagram: string; whatsapp: string; email: string; linha?: boolean }) {
  const itens = [
    instagram && {
      href: `https://instagram.com/${userInsta(instagram)}`,
      texto: `@${userInsta(instagram)}`,
      icone: (
        <svg className="pb-contatos__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
      ),
    },
    whatsapp && {
      href: linkWhats(whatsapp),
      texto: whatsapp,
      icone: (
        <svg className="pb-contatos__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z" />
          <path d="M9 9.5c.5 2.3 2.2 4 4.5 4.5l1-1.2 2 .8c-.2 1.3-1.2 2-2.5 1.9C10.8 15.2 8.8 13.2 8.5 10c-.1-1.3.6-2.3 1.9-2.5l.8 2-1.2 1" />
        </svg>
      ),
    },
    email && {
      href: `mailto:${email}`,
      texto: email,
      icone: (
        <svg className="pb-contatos__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6l8.5 7 8.5-7" />
        </svg>
      ),
    },
  ].filter(Boolean) as { href: string; texto: string; icone: React.ReactNode }[];

  return (
    <ul className={cx("pb-contatos", linha && "pb-contatos--linha")}>
      {itens.map((c) => (
        <li key={c.href}>
          <a href={c.href} {...linkExterno(c.href)}>
            {c.icone}
            {c.texto}
          </a>
        </li>
      ))}
    </ul>
  );
}

function urlVideo(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return "";
}

/* ======================================================== config */

export const config: Config<Props, Root> = {
  categories: {
    fotos: { title: "Fotos", components: ["Foto", "Carrossel", "Album", "Portfolio", "Video"] },
    textos: { title: "Textos", components: ["Destaque", "Texto", "ImagemTexto", "Citacao", "Contato"] },
    estrutura: { title: "Estrutura da página", components: ["Cabecalho", "Rodape", "Colunas", "Espaco"] },
  },

  root: {
    fields: {
      title: { type: "text", label: "Título da página (aba do navegador e Google)" },
      descricao: { type: "textarea", label: "Descrição para o Google e para compartilhamento" },
    },
    defaultProps: { title: "Pamela Burigo · fotografia", descricao: "" },
    render: ({ children }) => <div className="pb-site">{children}</div>,
  },

  components: {
    /* -------------------------------------------------- Cabeçalho */
    Cabecalho: {
      label: "Cabeçalho (logo e menu)",
      fields: {
        estilo: {
          type: "select",
          label: "Estilo",
          options: [
            { label: "Fundo off-white", value: "claro" },
            { label: "Fundo branco", value: "branco" },
            { label: "Fundo preto", value: "preto" },
            { label: "Fundo azul-petróleo", value: "petroleo" },
            { label: "Transparente sobre a foto de destaque", value: "transparente" },
          ],
        },
        fixo: { type: "radio", label: "Fica fixo no topo ao rolar a página?", options: opSimNao },
        links: {
          type: "array",
          label: "Itens do menu",
          arrayFields: {
            rotulo: { type: "text", label: "Texto" },
            link: { type: "text", label: "Link (ex.: /portfolio ou #contato)" },
          },
          defaultItemProps: { rotulo: "novo item", link: "/" },
          getItemSummary: (i) => i.rotulo || "Item",
        },
      },
      defaultProps: {
        estilo: "claro",
        fixo: false,
        links: [
          { rotulo: "portfólio", link: "/#portfolio" },
          { rotulo: "sobre", link: "/#sobre" },
          { rotulo: "contato", link: "/#contato" },
        ],
      },
      render: ({ puck, ...p }) => <Cabecalho {...p} editando={puck.isEditing} />,
    },

    /* -------------------------------------------------- Destaque */
    Destaque: {
      label: "Destaque (abertura com foto grande)",
      fields: {
        imagem: campoImagem("Foto de fundo"),
        rotulo: { type: "text", label: "Rótulo pequeno (opcional)", contentEditable: true },
        titulo: { type: "textarea", label: "Título", contentEditable: true },
        subtitulo: { type: "textarea", label: "Subtítulo", contentEditable: true },
        assinatura: { type: "text", label: "Frase de assinatura (opcional)", contentEditable: true },
        botoes: campoBotoes,
        altura: {
          type: "select",
          label: "Altura",
          options: [
            { label: "Tela inteira", value: "tela" },
            { label: "Alta", value: "alta" },
            { label: "Média", value: "media" },
            { label: "Só o necessário", value: "auto" },
          ],
        },
        posicao: {
          type: "radio",
          label: "Posição do texto",
          options: [
            { label: "Embaixo", value: "base" },
            { label: "Centro", value: "centro" },
            { label: "Em cima", value: "topo" },
          ],
        },
        alinhamento: { type: "radio", label: "Alinhamento", options: opAlinhamento },
        escurecer: { type: "radio", label: "Escurecer a foto para o texto aparecer melhor?", options: opSimNao },
        fundo: { type: "select", label: "Cor de fundo (quando não há foto)", options: opFundo },
      },
      defaultProps: {
        rotulo: "",
        titulo: "O olhar por trás de cada fotografia.",
        subtitulo: "Esporte, eventos, retratos e trabalhos autorais.",
        assinatura: "Conheça meu olhar.",
        botoes: [
          { texto: "Ver portfólio", link: "#portfolio", estilo: "destaque" },
          { texto: "Fale comigo", link: "#contato", estilo: "contorno" },
        ],
        altura: "tela",
        posicao: "base",
        alinhamento: "esquerda",
        escurecer: true,
        fundo: "preto",
      },
      render: ({ imagem, rotulo, titulo, subtitulo, assinatura, botoes, altura, posicao, alinhamento, escurecer, fundo, puck }) => {
        const temFoto = Boolean(imagem?.src);
        return (
          <section
            className={cx(
              "pb-destaque",
              `pb-destaque--${altura}`,
              `pb-destaque--vert-${posicao}`,
              temFoto ? "pb-sobre-foto" : `pb-fundo-${fundo}`,
              alinhar(alinhamento),
            )}
          >
            {temFoto && (
              <div className="pb-destaque__fundo">
                <Foto imagem={imagem} prioridade sizes="100vw" />
                {escurecer && <div className="pb-destaque__veu" />}
              </div>
            )}
            <div className="pb-container pb-destaque__conteudo">
              <div className="pb-destaque__texto">
                {rotulo && <p className="pb-rotulo">{rotulo}</p>}
                <h1 className="pb-titulo-capa">{titulo}</h1>
                {subtitulo && <p className="pb-subtitulo">{subtitulo}</p>}
                <Botoes botoes={botoes} editando={puck.isEditing} />
                {assinatura && <p className="pb-assinatura">{assinatura}</p>}
              </div>
            </div>
          </section>
        );
      },
    },

    /* -------------------------------------------------- Foto */
    Foto: {
      label: "Foto",
      fields: {
        imagem: campoImagem("Foto"),
        legenda: { type: "text", label: "Legenda (opcional)" },
        proporcao: { type: "select", label: "Formato", options: opProporcao },
        largura: { type: "select", label: "Largura", options: opLargura },
        cantos: { type: "radio", label: "Cantos de foco terracota (detalhe da marca)", options: opSimNao },
        link: { type: "text", label: "Link ao clicar (opcional)" },
        ...camposSecao,
      },
      defaultProps: {
        legenda: "",
        proporcao: "3:2",
        largura: "normal",
        cantos: false,
        link: "",
        fundo: "claro",
        espacamento: "compacta", ancora: "",
      },
      render: ({ imagem, legenda, proporcao, largura, cantos, link, fundo, espacamento, ancora, puck }) => {
        const quadro = (
          <div
            className={cx("pb-foto__quadro", cantos && "pb-cantos")}
            style={{ aspectRatio: proporcoes[proporcao] }}
          >
            <Foto imagem={imagem} sizes={largura === "cheio" ? "100vw" : "(max-width: 1200px) 100vw, 1200px"} />
            {cantos && <span className="pb-cantos__b" />}
          </div>
        );
        return (
          <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura}>
            <figure className={cx("pb-foto", proporcao === "original" && "pb-foto--original")}>
              {link && !puck.isEditing ? (
                <a href={link} {...linkExterno(link)}>
                  {quadro}
                </a>
              ) : (
                quadro
              )}
              {legenda && (
                <figcaption className={cx("pb-legenda", largura === "cheio" && "pb-container")}>{legenda}</figcaption>
              )}
            </figure>
          </Secao>
        );
      },
    },

    /* -------------------------------------------------- Carrossel */
    Carrossel: {
      label: "Carrossel de fotos",
      fields: {
        fotos: campoGaleria("Fotos do carrossel"),
        titulo: { type: "text", label: "Título acima (opcional)", contentEditable: true },
        modo: {
          type: "radio",
          label: "Exibição",
          options: [
            { label: "Uma foto por vez", value: "uma" },
            { label: "Várias lado a lado", value: "varias" },
          ],
        },
        proporcao: { type: "select", label: "Formato das fotos", options: opProporcao.filter((o) => o.value !== "original") },
        automatico: { type: "radio", label: "Passar sozinho?", options: opSimNao },
        intervalo: { type: "number", label: "Segundos em cada foto", min: 2, max: 20 },
        mostrarSetas: { type: "radio", label: "Mostrar setas", options: opSimNao },
        mostrarPontos: { type: "radio", label: "Mostrar pontinhos", options: opSimNao },
        mostrarLegendas: { type: "radio", label: "Mostrar legendas sobre a foto", options: opSimNao },
        largura: { type: "select", label: "Largura", options: opLargura },
        ...camposSecao,
      },
      defaultProps: {
        fotos: [],
        titulo: "",
        modo: "uma",
        proporcao: "16:9",
        automatico: true,
        intervalo: 5,
        mostrarSetas: true,
        mostrarPontos: true,
        mostrarLegendas: true,
        largura: "normal",
        fundo: "claro",
        espacamento: "normal", ancora: "",
      },
      render: ({ titulo, largura, fundo, espacamento, ancora, puck, id: _id, ...p }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura}>
          {titulo && (
            <div className={cx("pb-cabeca-secao", largura === "cheio" && "pb-container")}>
              <h2 className="pb-titulo pb-titulo--pequeno">{titulo}</h2>
            </div>
          )}
          <Carrossel {...p} editando={puck.isEditing} />
        </Secao>
      ),
    },

    /* -------------------------------------------------- Álbum */
    Album: {
      label: "Álbum (grade de fotos)",
      fields: {
        fotos: campoGaleria("Fotos do álbum"),
        rotulo: { type: "text", label: "Rótulo pequeno (opcional)", contentEditable: true },
        titulo: { type: "text", label: "Título (opcional)", contentEditable: true },
        descricao: { type: "textarea", label: "Descrição (opcional)" },
        alinhamento: { type: "radio", label: "Alinhamento do título", options: opAlinhamento },
        layout: {
          type: "radio",
          label: "Arrumação",
          options: [
            { label: "Grade (todas do mesmo tamanho)", value: "grade" },
            { label: "Mosaico (respeita o formato de cada foto)", value: "mosaico" },
          ],
        },
        proporcao: {
          type: "select",
          label: "Formato na grade",
          options: opProporcao.filter((o) => o.value !== "original"),
        },
        colunas: { type: "number", label: "Colunas no computador", min: 1, max: 6 },
        colunasCelular: { type: "number", label: "Colunas no celular", min: 1, max: 3 },
        espaco: { type: "number", label: "Espaço entre fotos (px)", min: 0, max: 40 },
        ampliar: { type: "radio", label: "Ampliar a foto ao clicar", options: opSimNao },
        largura: { type: "select", label: "Largura", options: opLargura },
        ...camposSecao,
      },
      defaultProps: {
        fotos: [],
        rotulo: "",
        titulo: "",
        descricao: "",
        alinhamento: "esquerda",
        layout: "grade",
        proporcao: "4:5",
        colunas: 3,
        colunasCelular: 2,
        espaco: 6,
        ampliar: true,
        largura: "normal",
        fundo: "claro",
        espacamento: "normal", ancora: "",
      },
      render: ({ rotulo, titulo, descricao, alinhamento, largura, fundo, espacamento, ancora, puck, id: _id, ...p }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura}>
          {(rotulo || titulo || descricao) && (
            <div className={cx("pb-cabeca-secao", alinhar(alinhamento), largura === "cheio" && "pb-container")}>
              {rotulo && <p className="pb-rotulo">{rotulo}</p>}
              {titulo && <h2 className="pb-titulo">{titulo}</h2>}
              {descricao && (
                <div className="pb-texto" style={{ marginTop: 16 }}>
                  <Paragrafos texto={descricao} />
                </div>
              )}
            </div>
          )}
          <Album {...p} editando={puck.isEditing} />
        </Secao>
      ),
    },

    /* -------------------------------------------------- Portfólio */
    Portfolio: {
      label: "Portfólio (capas de ensaios)",
      fields: {
        rotulo: { type: "text", label: "Rótulo pequeno (opcional)", contentEditable: true },
        titulo: { type: "text", label: "Título (opcional)", contentEditable: true },
        colunas: { type: "number", label: "Colunas no computador", min: 2, max: 4 },
        itens: {
          type: "array",
          label: "Ensaios / trabalhos",
          arrayFields: {
            capa: campoImagem("Foto de capa"),
            categoria: { type: "text", label: "Categoria (ex.: esporte)" },
            nome: { type: "text", label: "Nome do ensaio" },
            link: { type: "text", label: "Link (página do álbum, ex.: /ensaio-maria)" },
          },
          defaultItemProps: { categoria: "ensaio", nome: "Novo ensaio", link: "" },
          getItemSummary: (i) => i.nome || "Ensaio",
        },
        ...camposSecao,
      },
      defaultProps: {
        rotulo: "portfólio",
        titulo: "Trabalhos recentes",
        colunas: 3,
        itens: [
          { categoria: "esporte", nome: "Tatame", link: "" },
          { categoria: "eventos", nome: "Bastidores", link: "" },
          { categoria: "retratos", nome: "Ensaio", link: "" },
        ],
        fundo: "claro",
        espacamento: "normal", ancora: "",
      },
      render: ({ rotulo, titulo, colunas, itens, fundo, espacamento, ancora, puck }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento}>
          {(rotulo || titulo) && (
            <div className="pb-cabeca-secao">
              {rotulo && <p className="pb-rotulo">{rotulo}</p>}
              {titulo && <h2 className="pb-titulo">{titulo}</h2>}
            </div>
          )}
          <div className="pb-portfolio" style={{ ["--colunas" as string]: colunas || 3 }}>
            {(itens || []).map((it, i) => (
              <a key={i} className="pb-portfolio__item" href={!puck.isEditing && it.link ? it.link : undefined}>
                <div className="pb-portfolio__capa">
                  <Foto imagem={it.capa} mensagemVazio="Capa do ensaio" sizes="(max-width: 900px) 50vw, 33vw" />
                </div>
                <div className="pb-portfolio__info">
                  {it.categoria && <span className="pb-portfolio__categoria">{it.categoria}</span>}
                  <h3 className="pb-portfolio__nome">{it.nome}</h3>
                </div>
              </a>
            ))}
          </div>
        </Secao>
      ),
    },

    /* -------------------------------------------------- Texto */
    Texto: {
      label: "Texto",
      fields: {
        rotulo: { type: "text", label: "Rótulo pequeno (opcional)", contentEditable: true },
        titulo: { type: "textarea", label: "Título (opcional)", contentEditable: true },
        texto: { type: "richtext", label: "Texto", contentEditable: true },
        botoes: campoBotoes,
        alinhamento: { type: "radio", label: "Alinhamento", options: opAlinhamento },
        largura: { type: "select", label: "Largura", options: opLargura.filter((o) => o.value !== "cheio") },
        ...camposSecao,
      },
      defaultProps: {
        rotulo: "",
        titulo: "Fotografar é prestar atenção.",
        texto: "<p>Escreva aqui o seu texto.</p>",
        botoes: [],
        alinhamento: "esquerda",
        largura: "estreito",
        fundo: "claro",
        espacamento: "normal", ancora: "",
      },
      render: ({ rotulo, titulo, texto, botoes, alinhamento, largura, fundo, espacamento, ancora, puck }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura} className={alinhar(alinhamento)}>
          {rotulo && <p className="pb-rotulo">{rotulo}</p>}
          {titulo && <h2 className="pb-titulo" style={{ marginBottom: 24 }}>{titulo}</h2>}
          <div className="pb-texto">{texto}</div>
          <Botoes botoes={botoes} editando={puck.isEditing} />
        </Secao>
      ),
    },

    /* -------------------------------------------------- Imagem + texto */
    ImagemTexto: {
      label: "Foto ao lado de texto (ex.: Sobre)",
      fields: {
        imagem: campoImagem("Foto"),
        ladoFoto: {
          type: "radio",
          label: "Foto de que lado?",
          options: [
            { label: "Esquerda", value: "esquerda" },
            { label: "Direita", value: "direita" },
          ],
        },
        proporcao: { type: "select", label: "Formato da foto", options: opProporcao },
        cantos: { type: "radio", label: "Cantos de foco terracota", options: opSimNao },
        rotulo: { type: "text", label: "Rótulo pequeno", contentEditable: true },
        titulo: { type: "textarea", label: "Título", contentEditable: true },
        texto: { type: "richtext", label: "Texto", contentEditable: true },
        botoes: campoBotoes,
        ...camposSecao,
      },
      defaultProps: {
        ladoFoto: "esquerda",
        proporcao: "4:5",
        cantos: false,
        rotulo: "o olhar",
        titulo: "Fotografar é prestar atenção.",
        texto:
          "<p>Fotografo esportes, eventos, retratos e trabalhos autorais. Em todos eles, procuro a mesma coisa: o instante em que a pessoa deixa de posar e simplesmente acontece.</p><p>Para mim, a fotografia é uma forma de expressão e de conexão. Cada imagem registra uma história e uma emoção, e também o encontro entre quem fotografa e quem é fotografado.</p><p>Valorizar as pessoas é o ponto de partida. O resto é luz, tempo e um olhar atento.</p>",
        botoes: [],
        fundo: "branco",
        espacamento: "normal", ancora: "",
      },
      render: ({ imagem, ladoFoto, proporcao, cantos, rotulo, titulo, texto, botoes, fundo, espacamento, ancora, puck }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento}>
          <div className={cx("pb-imagem-texto", ladoFoto === "direita" && "pb-imagem-texto--foto-direita")}>
            <div className="pb-imagem-texto__foto">
              <div
                className={cx("pb-foto__quadro", cantos && "pb-cantos")}
                style={{ aspectRatio: proporcoes[proporcao] || "auto" }}
              >
                <Foto imagem={imagem} mensagemVazio="Adicione um retrato" sizes="(max-width: 820px) 100vw, 50vw" />
                {cantos && <span className="pb-cantos__b" />}
              </div>
            </div>
            <div>
              {rotulo && <p className="pb-rotulo">{rotulo}</p>}
              {titulo && <h2 className="pb-titulo" style={{ marginBottom: 24 }}>{titulo}</h2>}
              <div className="pb-texto">{texto}</div>
              <Botoes botoes={botoes} editando={puck.isEditing} />
            </div>
          </div>
        </Secao>
      ),
    },

    /* -------------------------------------------------- Citação */
    Citacao: {
      label: "Frase em destaque",
      fields: {
        frase: { type: "textarea", label: "Frase", contentEditable: true },
        autor: { type: "text", label: "Autor ou contexto (opcional)", contentEditable: true },
        alinhamento: { type: "radio", label: "Alinhamento", options: opAlinhamento },
        ...camposSecao,
      },
      defaultProps: {
        frase: "Cada fotografia carrega o olhar de quem a fez.",
        autor: "Pamela Burigo",
        alinhamento: "centro",
        fundo: "petroleo",
        espacamento: "normal", ancora: "",
      },
      render: ({ frase, autor, alinhamento, fundo, espacamento, ancora }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura="estreito" className={alinhar(alinhamento)}>
          <figure className="pb-citacao">
            <blockquote>{frase}</blockquote>
            {autor && <figcaption className="pb-assinatura">{autor}</figcaption>}
          </figure>
        </Secao>
      ),
    },

    /* -------------------------------------------------- Colunas */
    Colunas: {
      label: "Colunas (blocos lado a lado)",
      fields: {
        colunas: {
          type: "radio",
          label: "Quantas colunas?",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
          ],
        },
        espaco: { type: "number", label: "Espaço entre colunas (px)", min: 0, max: 120 },
        alinhamentoVertical: {
          type: "radio",
          label: "Alinhamento vertical",
          options: [
            { label: "Topo", value: "start" },
            { label: "Centro", value: "center" },
            { label: "Base", value: "end" },
          ],
        },
        largura: { type: "select", label: "Largura", options: opLargura },
        ...camposSecao,
        coluna1: { type: "slot", label: "Coluna 1", disallow: ["Colunas", "Cabecalho", "Rodape", "Destaque"] },
        coluna2: { type: "slot", label: "Coluna 2", disallow: ["Colunas", "Cabecalho", "Rodape", "Destaque"] },
        coluna3: { type: "slot", label: "Coluna 3", disallow: ["Colunas", "Cabecalho", "Rodape", "Destaque"] },
      },
      resolveFields: (data, { fields }) => {
        if (data.props.colunas === 3) return fields;
        const { coluna3: _c3, ...resto } = fields as Fields<Props["Colunas"]>;
        return resto as Fields<Props["Colunas"]>;
      },
      defaultProps: {
        colunas: 2,
        espaco: 32,
        alinhamentoVertical: "start",
        largura: "normal",
        fundo: "claro",
        espacamento: "normal",
        coluna1: [],
        coluna2: [],
        coluna3: [],
        ancora: "",
      },
      render: ({ colunas, espaco, alinhamentoVertical, largura, fundo, espacamento, ancora, coluna1: C1, coluna2: C2, coluna3: C3 }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura}>
          <div
            className="pb-colunas"
            style={{
              ["--colunas" as string]: colunas,
              ["--espaco" as string]: `${espaco}px`,
              ["--alinhar" as string]: alinhamentoVertical,
            }}
          >
            <C1 className="pb-coluna" />
            <C2 className="pb-coluna" />
            {colunas === 3 && <C3 className="pb-coluna" />}
          </div>
        </Secao>
      ),
    },

    /* -------------------------------------------------- Contato */
    Contato: {
      label: "Contato",
      fields: {
        rotulo: { type: "text", label: "Rótulo pequeno", contentEditable: true },
        titulo: { type: "textarea", label: "Título", contentEditable: true },
        texto: { type: "textarea", label: "Texto" },
        instagram: { type: "text", label: "Instagram (ex.: @pb.picx)" },
        whatsapp: { type: "text", label: "WhatsApp (ex.: (49) 99947-6388)" },
        email: { type: "text", label: "E-mail" },
        botoes: campoBotoes,
        alinhamento: { type: "radio", label: "Alinhamento", options: opAlinhamento },
        ...camposSecao,
      },
      defaultProps: {
        ancora: "contato",
        rotulo: "contato",
        titulo: "Vamos conversar?",
        texto: "Me conta um pouco sobre o que você imagina para as fotos, e eu monto uma proposta para você.",
        instagram: "@pb.picx",
        whatsapp: "(49) 99947-6388",
        email: "txtpam@gmail.com",
        botoes: [{ texto: "Chamar no WhatsApp", link: "https://wa.me/5549999476388", estilo: "destaque" }],
        alinhamento: "esquerda",
        fundo: "petroleo-claro",
        espacamento: "normal",
      },
      render: ({ rotulo, titulo, texto, instagram, whatsapp, email, botoes, alinhamento, fundo, espacamento, ancora, puck }) => (
        <Secao id={ancora} fundo={fundo} espacamento={espacamento} className={alinhar(alinhamento)}>
          <div style={{ maxWidth: 760, marginLeft: alinhamento === "centro" ? "auto" : undefined, marginRight: alinhamento === "centro" ? "auto" : undefined }}>
            {rotulo && <p className="pb-rotulo">{rotulo}</p>}
            {titulo && <h2 className="pb-titulo">{titulo}</h2>}
            {texto && (
              <div className="pb-texto" style={{ marginTop: 18 }}>
                <Paragrafos texto={texto} />
              </div>
            )}
            <ListaContatos instagram={instagram} whatsapp={whatsapp} email={email} linha={alinhamento === "centro"} />
            <Botoes botoes={botoes} editando={puck.isEditing} />
          </div>
        </Secao>
      ),
    },

    /* -------------------------------------------------- Vídeo */
    Video: {
      label: "Vídeo (YouTube ou Vimeo)",
      fields: {
        url: { type: "text", label: "Link do vídeo" },
        titulo: { type: "text", label: "Título acima (opcional)", contentEditable: true },
        largura: { type: "select", label: "Largura", options: opLargura },
        ...camposSecao,
      },
      defaultProps: { url: "", titulo: "", largura: "normal", fundo: "claro", espacamento: "normal", ancora: "" },
      render: ({ url, titulo, largura, fundo, espacamento, ancora, puck }) => {
        const src = urlVideo(url || "");
        return (
          <Secao id={ancora} fundo={fundo} espacamento={espacamento} largura={largura}>
            {titulo && (
              <div className="pb-cabeca-secao">
                <h2 className="pb-titulo pb-titulo--pequeno">{titulo}</h2>
              </div>
            )}
            <div className="pb-video">
              {src ? (
                <iframe
                  src={src}
                  title={typeof titulo === "string" && titulo ? titulo : "Vídeo"}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  style={puck.isEditing ? { pointerEvents: "none" } : undefined}
                />
              ) : (
                <div className="pb-vazio" style={{ position: "absolute", inset: 0 }}>
                  <span>Cole o link de um vídeo do YouTube ou Vimeo</span>
                </div>
              )}
            </div>
          </Secao>
        );
      },
    },

    /* -------------------------------------------------- Espaço */
    Espaco: {
      label: "Espaço / linha divisória",
      fields: {
        altura: { type: "number", label: "Altura (px)", min: 0, max: 300 },
        divisor: { type: "radio", label: "Mostrar linha", options: opSimNao },
        fundo: { type: "select", label: "Cor de fundo", options: opFundo },
      },
      defaultProps: { altura: 48, divisor: false, fundo: "claro" },
      render: ({ altura, divisor, fundo }) => (
        <div className={`pb-fundo-${fundo}`} style={{ paddingTop: altura / 2, paddingBottom: altura / 2 }}>
          {divisor && (
            <div className="pb-container">
              <hr className="pb-divisor" />
            </div>
          )}
        </div>
      ),
    },

    /* -------------------------------------------------- Rodapé */
    Rodape: {
      label: "Rodapé",
      fields: {
        frase: { type: "text", label: "Frase", contentEditable: true },
        instagram: { type: "text", label: "Instagram" },
        whatsapp: { type: "text", label: "WhatsApp" },
        email: { type: "text", label: "E-mail" },
        cidade: { type: "text", label: "Cidade / região" },
      },
      defaultProps: {
        frase: "Conheça meu olhar.",
        instagram: "@pb.picx",
        whatsapp: "(49) 99947-6388",
        email: "txtpam@gmail.com",
        cidade: "Florianópolis · SC",
      },
      render: ({ frase, instagram, whatsapp, email, cidade }) => (
        <footer className="pb-rodape">
          <div className="pb-container">
            <div className="pb-rodape__topo">
              <div>
                <a href="/" className="pb-rodape__logo" aria-label="Início">
                  <img src="/marca/pb_logo_horizontal_negativo-cor.svg" alt="pamela burigo • fotografia" width={218} height={56} />
                </a>
                {frase && <p className="pb-rodape__frase">{frase}</p>}
              </div>
              <ListaContatos instagram={instagram} whatsapp={whatsapp} email={email} />
            </div>
            <div className="pb-rodape__base">
              <span>© {new Date().getFullYear()} Pamela Burigo · fotografia</span>
              {cidade && <span>{cidade}</span>}
            </div>
          </div>
        </footer>
      ),
    },
  },
};

export type ConfigSite = typeof config;
