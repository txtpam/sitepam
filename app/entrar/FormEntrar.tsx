"use client";

import { useActionState } from "react";
import { entrar } from "../acoes";

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, null);
  return (
    <form action={acao} className="painel__form">
      <label className="painel__label">
        Senha
        <input name="senha" type="password" required autoFocus autoComplete="current-password" className="painel__input" />
      </label>
      {estado?.erro && <p className="painel__erro">{estado.erro}</p>}
      <button className="painel__botao" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
