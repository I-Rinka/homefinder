import Express from "express";
import { selectHouse, selectRecords, getNewestRecords, getAvgPrice,getRegionAvgPrice,getSubRegionAvgPrice} from "../db/sql.js";

export const api = Express.Router();

api.get('/selecthouse', selectHouse);
api.get('/selectrecord', selectRecords);
api.get('/currentrecord', getNewestRecords);
api.post('/avgprice', getAvgPrice);
api.get('/regionprice', getRegionAvgPrice);
api.get('/subregionprice', getSubRegionAvgPrice);
