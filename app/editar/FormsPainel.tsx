"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apagarPagina, criarPagina } from "../acoes";

export function FormNovaPagina() {
  const [estado, acao, enviando] = useActionState(criarPagina, null);
  return (
    <form action={acao} className="painel__form">
      <div className="painel__form painel__form--linha">
        <label className="painel__label">
          Nome da página
          <input name="titulo" required placeholder="Ex.: Ensaio na praia" className="painel__input" />
        </label>
        <label className="painel__label">
          Endereço
          <span className="painel__prefixo">
            <span>/</span>
            <input name="slug" required placeholder="ensaio-praia" className="painel__input" pattern="[A-Za-z0-9\- ]+" />
          </span>
        </label>
        <button className="painel__botao" disabled={enviando}>
          {enviando ? "Criando…" : "Criar e editar"}
        </button>
      </div>
      {estado?.erro && <p className="painel__erro">{estado.erro}</p>}
    </form>
  );
}

export function BotaoExcluir({ slug }: { slug: string }) {
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  return (
    <button
      className="painel__botao painel__botao--perigo"
      disabled={pendente}
      onClick={() => {
        if (!confirm(`Excluir a página /${slug}? Essa ação não pode ser desfeita.`)) return;
        iniciar(async () => {
          await apagarPagina(slug);
          router.refresh();
        });
      }}
    >
      {pendente ? "Excluindo…" : "Excluir"}
    </button>
  );
}
