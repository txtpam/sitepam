"use client";

import type { Data } from "@puckeditor/core";
import { config } from "@/puck.config";

type Bloco = { type: string; props: Record<string, unknown> };

let contador = 0;
const novoId = (tipo: string) => `${tipo}-${Date.now().toString(36)}-${(contador++).toString(36)}`;

/** Cria um bloco com as configurações padrão + ajustes. */
function bloco(tipo: keyof typeof config.components, ajustes: Record<string, unknown> = {}): Bloco {
  const padrao = (config.components[tipo]?.defaultProps || {}) as Record<string, unknown>;
  return { type: tipo, props: { ...structuredClone(padrao), ...ajustes, id: novoId(tipo) } };
}

export function modeloInicio(): Data {
  return {
    root: { props: { title: "Pamela Burigo · fotografia", descricao: "Esporte, eventos, retratos e trabalhos autorais. Fotografia com olhar atento às pessoas." } },
    content: [
      bloco("Cabecalho", { estilo: "transparente" }),
      bloco("Destaque"),
      bloco("ImagemTexto", { ancora: "sobre" }),
      bloco("Portfolio", { ancora: "portfolio" }),
      bloco("Citacao"),
      bloco("Album", { rotulo: "registros", titulo: "Últimos registros", layout: "mosaico", espacamento: "normal" }),
      bloco("Contato"),
      bloco("Rodape"),
    ],
    zones: {},
  } as unknown as Data;
}

/** Nova página: copia cabeçalho e rodapé da página inicial, se existirem. */
export function modeloNovaPagina(titulo: string, inicio: Data | null): Data {
  const cab = inicio?.content?.find((b) => b.type === "Cabecalho");
  const rod = inicio?.content?.find((b) => b.type === "Rodape");
  const cabProps = cab ? { ...(cab.props as Record<string, unknown>) } : {};
  if (cabProps.estilo === "transparente") cabProps.estilo = "claro";

  return {
    root: { props: { title: `${titulo} · Pamela Burigo`, descricao: "" } },
    content: [
      bloco("Cabecalho", cabProps),
      bloco("Texto", { rotulo: "", titulo, texto: "<p>Uma breve apresentação deste trabalho.</p>", espacamento: "normal" }),
      bloco("Album", { layout: "mosaico", espacamento: "compacta" }),
      bloco("Rodape", rod ? { ...(rod.props as Record<string, unknown>) } : {}),
    ].map((b) => ({ ...b, props: { ...b.props, id: novoId(b.type) } })),
    zones: {},
  } as unknown as Data;
}
