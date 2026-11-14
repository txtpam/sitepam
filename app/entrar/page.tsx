import { redirect } from "next/navigation";
import { estaLogado, senhaConfigurada } from "@/lib/auth";
import { FormEntrar } from "./FormEntrar";
import "../painel.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar · edição do site", robots: { index: false } };

export default async function Entrar() {
  if (await estaLogado()) redirect("/editar");
  return (
    <main className="painel painel--centro">
      <div className="painel__cartao painel__cartao--login">
        <img src="/marca/pb_logo_vertical_preto.svg" alt="pamela burigo • fotografia" width={150} height={146} className="painel__logo-vertical" />
        <h1 className="painel__titulo">Edição do site</h1>
        {senhaConfigurada() ? (
          <FormEntrar />
        ) : (
          <p className="painel__aviso">
            A senha de edição ainda não foi configurada. Na Vercel, abra o projeto › Settings › Environment Variables e crie a variável{" "}
            <code>ADMIN_PASSWORD</code>.
          </p>
        )}
      </div>
    </main>
  );
}
