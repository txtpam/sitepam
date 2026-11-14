import { redirect } from "next/navigation";
import { estaLogado } from "@/lib/auth";
import { listarPaginas, usandoBlob } from "@/lib/storage";
import { sair } from "../acoes";
import { FormNovaPagina, BotaoExcluir } from "./FormsPainel";
import "../painel.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Páginas · edição do site", robots: { index: false } };

const dataBr = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default async function Painel() {
  if (!(await estaLogado())) redirect("/entrar");
  const paginas = await listarPaginas();
  const temInicio = paginas.some((p) => p.slug === "");
  const lista = temInicio ? paginas : [{ slug: "", titulo: "Início", atualizadoEm: "" }, ...paginas];

  return (
    <main className="painel">
      <div className="painel__topo">
        <img src="/marca/pb_logo_horizontal_cor.svg" alt="pamela burigo • fotografia" width={172} height={44} />
        <div className="painel__acoes">
          <a className="painel__botao painel__botao--claro" href="/" target="_blank">
            Ver o site
          </a>
          <form action={sair}>
            <button className="painel__botao painel__botao--claro">Sair</button>
          </form>
        </div>
      </div>

      <div className="painel__conteudo">
        {!usandoBlob() && process.env.VERCEL && (
          <p className="painel__aviso">
            O armazenamento ainda não foi conectado. Na Vercel, abra o projeto › Storage › Create › Blob e conecte ao projeto. Sem isso, as
            alterações não são salvas.
          </p>
        )}

        <section className="painel__cartao">
          <h1 className="painel__titulo">Páginas do site</h1>
          <ul className="painel__lista">
            {lista.map((p) => (
              <li key={p.slug || "inicio"} className="painel__item">
                <div>
                  <div className="painel__item-nome">{p.slug === "" ? "Início (página principal)" : p.titulo}</div>
                  <div className="painel__item-info">
                    /{p.slug} {p.atualizadoEm ? `· publicada em ${dataBr(p.atualizadoEm)}` : "· ainda não publicada"}
                  </div>
                </div>
                <div className="painel__acoes">
                  <a className="painel__botao" href={`/editar/${p.slug || "inicio"}`}>
                    Editar
                  </a>
                  <a className="painel__botao painel__botao--claro" href={`/${p.slug}`} target="_blank">
                    Ver
                  </a>
                  {p.slug !== "" && <BotaoExcluir slug={p.slug} />}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="painel__cartao">
          <h2 className="painel__titulo">Criar página nova</h2>
          <p className="painel__subtitulo">Por exemplo, um álbum de ensaio, a página de portfólio ou a de um evento.</p>
          <FormNovaPagina />
        </section>

        <section className="painel__cartao">
          <h2 className="painel__titulo">Como editar</h2>
          <ol className="painel__dicas">
            <li>
              Clique em <strong>Editar</strong> na página desejada.
            </li>
            <li>
              Na coluna da esquerda estão os <strong>blocos</strong> (Foto, Carrossel, Álbum, Texto…). Arraste um bloco para a página.
            </li>
            <li>
              Clique em um bloco na página para alterar textos, fotos e cores na coluna da direita. Títulos também podem ser editados direto na
              página.
            </li>
            <li>
              Para mudar a ordem, arraste o bloco pela alça. Para remover, use a lixeira que aparece ao selecioná-lo.
            </li>
            <li>
              Quando terminar, clique em <strong>Publicar</strong>. O site é atualizado em instantes.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
