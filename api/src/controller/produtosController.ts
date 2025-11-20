import type { Request, Response } from "express"
import { produtoSchema } from "../schemas/produtosSchemas.ts";
import { createProdutosModel } from "../model/produtosModel.ts";
import { getInsumoByNameModel } from "../model/insumosModel.ts";

export async function createProdutoController(req: Request, res: Response) {
    try {
        const parse = await produtoSchema.safeParseAsync(req.body);
        if (!parse.success) {
            return res.status(400).json({
            error: "Dados inválidos",
            detalhes: parse.error.format()
        })}
        if (parse.data.insumos.length === 0) {
            return res.status(400).json({ message: "O produto deve ter pelo menos um insumo" })
        }
        const insumosInexistentes = [];
        for (let i = 0; i < parse.data.insumos.length; i++) {
            const insumo = await getInsumoByNameModel({ nome: parse.data.insumos[i].nome })
            if (!insumo || insumo.length === 0) {
                insumosInexistentes.push(parse.data.insumos[i].nome)
            }
        }
        if (insumosInexistentes.length > 0) {
            return res.status(400).json({ message: `Os seguintes insumos não existem, favor cadastrar: ${insumosInexistentes.join(", ")}` })
        }
        const produto = await createProdutosModel(parse.data);
        return res.status(201).json(produto);
    } catch (error) {
        console.error("Error ao criar produto: ", error)
        return res.status(500).json({ message: "Error ao criar produto", error})
    }
}