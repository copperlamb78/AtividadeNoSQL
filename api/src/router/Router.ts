import { Router } from "express";
import { insumosRoute } from "./insumosRoute.ts";
import { produtosRoute } from "./produtosRoute.ts";
import { pedidoRoute } from "./pedidoRoute.ts";

const router = Router();

router.use("/insumos", insumosRoute);

router.use("/produtos", produtosRoute);

router.use("/pedidos", pedidoRoute);

export default router;
