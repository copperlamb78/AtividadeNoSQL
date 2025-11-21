import express from "express";
import router from "../router/Router.ts";

export const app = express();

app.use(express.json());

app.use("/api", router);
