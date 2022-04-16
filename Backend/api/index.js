import Express from "express";
import { selectHouse, selectRecord } from "./sql.js";

export const api = Express.Router();

api.get('/selecthouse', selectHouse);
api.get('/selectrecord', selectRecord);