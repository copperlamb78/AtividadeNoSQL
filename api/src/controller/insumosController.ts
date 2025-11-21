import type { Request, Response } from "express";
import { createInsumoModel, deleteInsumoByNameModel, getAllInsumosModel, getInsumoByNameModel, updateInsumoByNameModel } from "../model/insumosModel.ts";
import { insumoSchema, insumoSchemaOptional, nomeInsumo } from "../schemas/insumosSchema.ts";

export async function createInsumoController(req: Request, res: Response) {
  try {
    const parse = await insumoSchema.safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    const { nome, quantidade, unidade, custo } = parse.data;
    const novoInsumo = {
      nome,
      quantidade,
      unidade,
      custo,
    };
    const insumo = await createInsumoModel(novoInsumo);
    return res.status(201).json(insumo);
  } catch (error) {
    console.error("Error ao criar insumo: ", error);
    return res.status(500).json({ message: "Error ao criar insumo", error });
  }
}

export async function getAllInsumosOrByNameController(req: Request, res: Response) {
  try {
    if (req.body) {
      const parse = await nomeInsumo.safeParseAsync(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          detalhes: parse.error.format(),
        });
      }
      const { nome } = parse.data;
      const insumo = await getInsumoByNameModel({ nome });
      if (insumo.length === 0) {
        return res.status(404).json({ message: "Não foi possível encontrar o insumo" });
      }
      return res.status(200).json(insumo);
    }
    const insumos = await getAllInsumosModel();
    return res.status(200).json(insumos);
  } catch (error) {
    console.error("Error ao buscar insumos: ", error);
    return res.status(500).json({ message: "Error ao buscar insumos", error });
  }
}

export async function updateInsumoByNameController(req: Request, res: Response) {
  try {
    const nomeInsumo = req.query.nome as string;
    const parse = await insumoSchemaOptional.safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    const insumo = await updateInsumoByNameModel(nomeInsumo, parse.data);
    return res.status(200).json(insumo);
  } catch (error) {
    console.error("Error ao atualizar insumo: ", error);
    return res.status(500).json({ message: "Error ao atualizar insumo", error });
  }
}

export async function deleteInsumoByNameController(req: Request, res: Response) {
  try {
    const parse = await nomeInsumo.safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    const insumoDeletado = await deleteInsumoByNameModel(parse.data.nome);
    return res.status(200).json(insumoDeletado);
  } catch (error) {
    console.error("Error ao deletar insumo: ", error);
    return res.status(500).json({ message: "Error ao deletar insumo", error });
  }
}
