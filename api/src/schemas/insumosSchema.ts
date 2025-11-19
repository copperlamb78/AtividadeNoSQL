import { z } from "zod";

export const insumoSchema = z.object({
    nome: z
    .string({ message: "Nome deve ser uma string"})
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres"})
    .transform((v) => v.trim()),

    quantidade: z
    .number({ message: "Quantidade deve ser um número" })
    .positive({ message: "Quantidade deve ser um número positivo"}),

    unidade: z
    .string({ message: "unidade deve ser uma string"})
    .min(1, { message: "Unidade é obrigatória"})
    .max(30, { message: "Unidade deve ter no máximo 30 caracteres"})
    .transform((v) => v.trim()),

    custo: z
    .number({ message: "Custo deve ser um número" })
    .nonnegative({ message: "Custo deve ser um número não negativo"}),
})

export type InsumoData = z.infer<typeof insumoSchema>;