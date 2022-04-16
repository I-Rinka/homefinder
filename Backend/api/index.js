import Express from "express";
import { selectHouse, selectRecords, getNewestRecords } from "../db/sql.js";

export const api = Express.Router();

api.get('/selecthouse', selectHouse);
api.get('/selectrecord', selectRecords);
api.get('/currentrecord', getNewestRecords);