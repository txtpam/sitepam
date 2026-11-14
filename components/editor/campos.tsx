"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { CustomField } from "@puckeditor/core";
import type { Imagem, ItemGaleria } from "@/components/blocos/comum";
import { enviarFoto, enviarFotos } from "@/lib/upload-client";

/* Estilos inline: os campos ficam no painel do editor, fora do site. */
const s = {
  caixa: { display: "grid", gap: 8 } as CSSProperties,
  preview: {
    width: "100%",
    aspectRatio: "3 / 2",
    objectFit: "cover",
    borderRadius: 6,
    background: "#eee",
    display: "block",
  } as CSSProperties,
  vazio: {
    width: "100%",
    aspectRatio: "3 / 2",
    borderRadius: 6,
    border: "1.5px dashed #b9c6cb",
    background: "#f5f8f9",
    color: "#1f4e5f",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
    cursor: "pointer",
    textAlign: "center",
    padding: 12,
  } as CSSProperties,
  linha: { display: "flex", gap: 6, flexWrap: "wrap" } as CSSProperties,
  botao: {
    flex: "1 1 auto",
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #c9d3d6",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  } as CSSProperties,
  botaoPrincipal: {
    flex: "1 1 auto",
    padding: "9px 10px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #1f4e5f",
    background: "#1f4e5f",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
  } as CSSProperties,
  input: {
    width: "100%",
    padding: "7px 9px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #c9d3d6",
    fontFamily: "inherit",
    boxSizing: "border-box",
  } as CSSProperties,
  ajuda: { fontSize: 12, color: "#667", margin: 0 } as CSSProperties,
  erro: { fontSize: 12, color: "#943923", margin: 0 } as CSSProperties,
  grade: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } as CSSProperties,
  cartao: {
    border: "1px solid #dde3e5",
    borderRadius: 6,
    padding: 6,
    background: "#fff",
    display: "grid",
    gap: 6,
  } as CSSProperties,
  miniatura: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderRadius: 4,
    display: "block",
    background: "#eee",
  } as CSSProperties,
  icone: {
    border: "1px solid #dde3e5",
    background: "#fff",
    borderRadius: 4,
    width: 28,
    height: 26,
    cursor: "pointer",
    fontSize: 13,
    lineHeight: 1,
    padding: 0,
  } as CSSProperties,
};

function SeletorArquivo({
  multiplo,
  aoEscolher,
  children,
}: {
  multiplo?: boolean;
  aoEscolher: (f: File[]) => void;
  children: (abrir: () => void) => ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={multiplo}
        hidden
        onChange={(e) => {
          const arquivos = Array.from(e.target.files || []);
          e.target.value = "";
          if (arquivos.length) aoEscolher(arquivos);
        }}
      />
      {children(() => ref.current?.click())}
    </>
  );
}

function soltarArquivos(e: React.DragEvent, fn: (f: File[]) => void) {
  e.preventDefault();
  const arquivos = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
  if (arquivos.length) fn(arquivos);
}

/* ---------------------------------------------------- campo: uma foto */

function CampoImagem({ value, onChange, readOnly }: { value?: Imagem; onChange: (v: Imagem | undefined) => void; readOnly?: boolean }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (arquivos: File[]) => {
    setErro("");
    setEnviando(true);
    try {
      const img = await enviarFoto(arquivos[0]);
      onChange({ ...img, alt: value?.alt || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SeletorArquivo aoEscolher={enviar}>
      {(abrir) => (
        <div style={s.caixa} onDragOver={(e) => e.preventDefault()} onDrop={(e) => !readOnly && soltarArquivos(e, enviar)}>
          {value?.src ? (
            <img src={value.src} alt="" style={s.preview} />
          ) : (
            <div style={s.vazio} onClick={() => !readOnly && abrir()} role="button">
              <strong>{enviando ? "Enviando…" : "Clique ou arraste uma foto aqui"}</strong>
              <span>JPG, PNG ou WEBP</span>
            </div>
          )}
          {!readOnly && (
            <div style={s.linha}>
              <button type="button" style={s.botaoPrincipal} onClick={abrir} disabled={enviando}>
                {enviando ? "Enviando…" : value?.src ? "Trocar foto" : "Enviar foto"}
              </button>
              {value?.src && (
                <button type="button" style={s.botao} onClick={() => onChange(undefined)}>
                  Remover
                </button>
              )}
            </div>
          )}
          {value?.src && (
            <input
              style={s.input}
              placeholder="Descrição da foto (acessibilidade e Google)"
              value={value.alt || ""}
              readOnly={readOnly}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
          )}
          {erro && <p style={s.erro}>{erro}</p>}
        </div>
      )}
    </SeletorArquivo>
  );
}

/* ---------------------------------------------- campo: várias fotos */

function CampoGaleria({ value, onChange, readOnly }: { value?: ItemGaleria[]; onChange: (v: ItemGaleria[]) => void; readOnly?: boolean }) {
  const fotos = value || [];
  const [progresso, setProgresso] = useState<string>("");
  const [erros, setErros] = useState<string[]>([]);

  const adicionar = async (arquivos: File[]) => {
    setErros([]);
    setProgresso(`Enviando 0 de ${arquivos.length}…`);
    const { imagens, erros } = await enviarFotos(arquivos, (f, t) => setProgresso(`Enviando ${f} de ${t}…`));
    onChange([...fotos, ...imagens.map((i) => ({ ...i, legenda: "", alt: "" }))]);
    setErros(erros);
    setProgresso("");
  };

  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= fotos.length) return;
    const nova = [...fotos];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    onChange(nova);
  };
  const remover = (i: number) => onChange(fotos.filter((_, k) => k !== i));
  const legendar = (i: number, legenda: string) => onChange(fotos.map((f, k) => (k === i ? { ...f, legenda, alt: legenda } : f)));

  return (
    <SeletorArquivo multiplo aoEscolher={adicionar}>
      {(abrir) => (
        <div style={s.caixa} onDragOver={(e) => e.preventDefault()} onDrop={(e) => !readOnly && soltarArquivos(e, adicionar)}>
          {!readOnly && (
            <div style={{ ...s.vazio, aspectRatio: "auto", padding: 16 }} onClick={abrir} role="button">
              <strong>{progresso || "Adicionar fotos"}</strong>
              <span>Clique ou arraste várias fotos de uma vez</span>
            </div>
          )}
          {erros.map((e, i) => (
            <p key={i} style={s.erro}>
              {e}
            </p>
          ))}
          {fotos.length > 0 && (
            <p style={s.ajuda}>
              {fotos.length} {fotos.length === 1 ? "foto" : "fotos"} · use as setas para mudar a ordem
            </p>
          )}
          <div style={s.grade}>
            {fotos.map((f, i) => (
              <div key={`${f.src}-${i}`} style={s.cartao}>
                <img src={f.src} alt="" style={s.miniatura} />
                <input
                  style={s.input}
                  placeholder="Legenda (opcional)"
                  value={f.legenda || ""}
                  readOnly={readOnly}
                  onChange={(e) => legendar(i, e.target.value)}
                />
                {!readOnly && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                    <span style={{ display: "flex", gap: 4 }}>
                      <button type="button" style={s.icone} onClick={() => mover(i, -1)} disabled={i === 0} title="Mover para antes">
                        ←
                      </button>
                      <button type="button" style={s.icone} onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} title="Mover para depois">
                        →
                      </button>
                    </span>
                    <button type="button" style={{ ...s.icone, color: "#943923" }} onClick={() => remover(i)} title="Remover foto">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SeletorArquivo>
  );
}

/* ------------------------------------------------ definições de campo */

export function campoImagem(label: string): CustomField<Imagem | undefined> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly }) => (
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <CampoImagem value={value} onChange={onChange} readOnly={readOnly} />
      </div>
    ),
  };
}

export function campoGaleria(label: string): CustomField<ItemGaleria[]> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly }) => (
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <CampoGaleria value={value} onChange={onChange} readOnly={readOnly} />
      </div>
    ),
  };
}
