"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "@/puck.config";
import { publicar } from "@/app/acoes";
import { modeloInicio, modeloNovaPagina } from "@/lib/modelos";
import { configurarUpload } from "@/lib/upload-client";
import { dicionarioPtBr } from "./dicionario";

type Status = { tipo: "ok" | "erro" | "salvando" | "alterado"; texto: string } | null;

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
  const primeiraMudanca = useRef(true);

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
      onChange={() => {
        // o Puck dispara um onChange ao carregar; ignoramos o primeiro
        if (primeiraMudanca.current) {
          primeiraMudanca.current = false;
          return;
        }
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
