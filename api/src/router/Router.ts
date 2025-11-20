import { Router } from "express";
import { insumosRoute } from "./insumosRoute.ts";
import { produtosRoute } from "./produtosRoute.ts";

const router = Router();

router.use("/insumos", insumosRoute)

router.use("/produtos", produtosRoute)

export default router;
