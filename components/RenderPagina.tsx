"use client";

import { useMemo } from "react";
import { Render, type Data } from "@puckeditor/core";
import { config } from "@/puck.config";
import { modeloInicio } from "@/lib/modelos";

export function RenderPagina({ data }: { data: Data | null }) {
  // Antes da primeira publicação, a página inicial mostra o modelo padrão.
  const conteudo = useMemo(() => data ?? modeloInicio(), [data]);
  return <Render config={config} data={conteudo} />;
}
