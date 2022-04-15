import Express from "express";
import { selecthouse } from "./selecthouse.js";

export const api = Express.Router();

api.get('/selecthouse', selecthouse);