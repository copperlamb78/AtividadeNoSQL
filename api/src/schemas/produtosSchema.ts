import { z } from "zod";

export const produtoSchema = z.object({
  nome: z
    .string({ message: "Nome deve ser uma string" })
    .min(1, { message: "Nome é obrigatório" })
    .regex(/^[A-Za-zÀ-ÿ0-9 ]+$/, "Caracteres especiais não são permitidos.")
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
    .transform((v) => v.trim()),
  preco: z.number({ message: "Preço deve ser um número" }).positive({ message: "Preço deve ser um número positivo" }),
  insumos: z.array(
    z.object({
      nome: z
        .string({ message: "Nome do insumo deve ser uma string" })
        .min(1, { message: "Nome do insumo é obrigatório" })
        .max(100, { message: "Nome do insumo deve ter no máximo 100 caracteres" })
        .transform((v) => v.trim()),
      quantidade: z.number({ message: "Quantidade do insumo deve ser um número" }).positive({ message: "Quantidade do insumo deve ser um número positivo" }),
    })
  ),
});
