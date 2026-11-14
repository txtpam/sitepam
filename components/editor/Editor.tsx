"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Puck, useGetPuck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "@/puck.config";
import { publicar } from "@/app/acoes";
import { modeloInicio, modeloNovaPagina } from "@/lib/modelos";
import { configurarUpload } from "@/lib/upload-client";
import { dicionarioPtBr } from "./dicionario";

type Status = { tipo: "ok" | "erro" | "salvando" | "alterado"; texto: string } | null;

/**
 * Botão "Publicar" fixo no canto da tela (celular e tablet).
 * No celular, o botão do topo some quando o painel de configurações está aberto;
 * este fica sempre visível. Precisa estar dentro do <Puck> para ler o conteúdo atual.
 */
function PublicarFlutuante({ status, aoPublicar }: { status: Status; aoPublicar: (d: Data) => Promise<void> }) {
  const getPuck = useGetPuck();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;
  const salvando = status?.tipo === "salvando";
  const texto = salvando ? "Publicando…" : status?.tipo === "ok" ? "Publicado" : "Publicar";
  return createPortal(
    <button
      type="button"
      className={`editor-publicar-flutuante${status?.tipo === "alterado" ? " editor-publicar-flutuante--pendente" : ""}`}
      disabled={salvando}
      aria-live="polite"
      onClick={() => aoPublicar(getPuck().appState.data as Data)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
      </svg>
      {texto}
    </button>,
    document.body,
  );
}

export function Editor({
  slug,
  dataInicial,
  tituloNovo,
  inicio,
  modoUpload,
}: {
  slug: string;
  dataInicial: Data | null;
  tituloNovo: string | null;
  inicio: Data | null;
  modoUpload: "token" | "presigned" | "local";
}) {
  configurarUpload({ modo: modoUpload });

  const data = useMemo(
    () => dataInicial ?? (slug === "" ? modeloInicio() : modeloNovaPagina(tituloNovo || slug, inicio)),
    [dataInicial, slug, tituloNovo, inicio],
  );
  const [status, setStatus] = useState<Status>(dataInicial ? null : { tipo: "alterado", texto: "Página ainda não publicada" });
  const alterado = useRef(!dataInicial);
  const ultimoPublicado = useRef<string | null>(dataInicial ? JSON.stringify(data) : null);

  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => {
      if (alterado.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, []);

  const aoPublicar = async (d: Data) => {
    setStatus({ tipo: "salvando", texto: "Publicando…" });
    try {
      await publicar(slug, d);
      ultimoPublicado.current = JSON.stringify(d);
      alterado.current = false;
      setStatus({ tipo: "ok", texto: `Publicado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao publicar.";
      setStatus({ tipo: "erro", texto: msg });
      alert(`Não foi possível publicar: ${msg}`);
    }
  };

  const endereco = `/${slug}`;

  return (
    <Puck
      config={config}
      data={data}
      onPublish={aoPublicar}
      onChange={(d) => {
        // o Puck também avisa ao carregar; só marcamos se o conteúdo mudou de verdade
        if (ultimoPublicado.current !== null && JSON.stringify(d) === ultimoPublicado.current) return;
        alterado.current = true;
        setStatus({ tipo: "alterado", texto: "Alterações não publicadas" });
      }}
      dictionary={dicionarioPtBr}
      headerTitle={slug === "" ? "Início" : tituloNovo || slug}
      headerPath={endereco}
      viewports={[
        { width: 390, height: "auto", label: "Celular", icon: "Smartphone" },
        { width: 820, height: "auto", label: "Tablet", icon: "Tablet" },
        { width: 1280, height: "auto", label: "Computador", icon: "Monitor" },
      ]}
      overrides={{
        puck: ({ children }) => (
          <>
            {children}
            <PublicarFlutuante status={status} aoPublicar={aoPublicar} />
          </>
        ),
        headerActions: ({ children }) => (
          <div className="editor-acoes">
            {status && <span className={`editor-status ${status.tipo === "erro" ? "editor-status--erro" : ""}`}>{status.texto}</span>}
            <a href="/editar">Páginas</a>
            <a href={endereco} target="_blank" rel="noreferrer">
              Ver site
            </a>
            {children}
          </div>
        ),
      }}
    />
  );
}
