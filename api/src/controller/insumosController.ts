import type{ Request, Response } from "express";
import { createInsumoModel, getAllInsumosModel } from "../model/insumosModel.ts";
import { insumoSchema } from "../schemas/insumosSchema.ts";

export async function createInsumoController(req: Request, res: Response) {
    try {
        const parse = await insumoSchema.safeParseAsync(req.body);
        if (!parse.success) {
            return res.status(400).json({
            error: "Dados inválidos",
            detalhes: parse.error.format()
        });
        }
        const { nome, quantidade, unidade, custo } = parse.data;
        const novoInsumo = {
            nome,
            quantidade,
            unidade,
            custo
        }
        const insumo = await createInsumoModel(novoInsumo);
        res.status(201).json(insumo);
    } catch (error) {
        console.error("Error ao criar insumo: ", error)        
        res.status(500).json({ message: "Error ao criar insumo", error})
    }
}

export async function getAllInsumosController(req: Request, res: Response) {
    try {
        const insumos = await getAllInsumosModel();
        res.status(200).json(insumos)
    } catch (error) {
        console.error("Error ao buscar insumos: ", error)
        res.status(500).json({ message: "Error ao buscar insumos", error})
    }
}