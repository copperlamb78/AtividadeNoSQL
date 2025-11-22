import { z } from "zod";

export const pedidoSchema = z.object({
  produtos: z.array(
    z.object({
      nome: z
        .string({ message: "Nome do produto deve ser uma string" })
        .min(1, { message: "Nome do produto é obrigatório" })
        .max(100, { message: "Nome do produto deve ter no máximo 100 caracteres" })
        .transform((v) => v.trim()),
      quantidade: z.number({ message: "Quantidade do produto deve ser um número" }).positive({ message: "Quantidade do produto deve ser um número positivo" }),
    })
  ),
});
