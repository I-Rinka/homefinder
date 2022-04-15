import { MongoClient } from "mongodb";
import { url } from "../db/mongo.js";

export function selecthouse(req, res) {
    let lat1 = req.query.lat1;
    let lat2 = req.query.lat2;

    let lng1 = req.query.lng1;
    let lng2 = req.query.lng2;
    console.log(lat1, lat2, lng1, lng2);

    if (lat2 == undefined && lng2 == undefined) {
        lat2 = lat1;
        lng2 = lng1;
    }

    let error = 1;
    if (lat1 && lat2 && lng1 && lng2) {
        lat1=parseFloat(lat1);
        lat2=parseFloat(lat2);
        lng1=parseFloat(lng1);
        lng2=parseFloat(lng2);
        MongoClient.connect(url, (err, db) => {
            if (err) {
                error = 2;
                res.send(error);
            }
            let dbo = db.db("homefinder");
            let query = { lat: { $lte: lat1, $gte: lat2 }, lng: { $gte: lng1, $lte: lng2 } };
            dbo.collection("house_coord").find(query).toArray((err, result) => {
                if (err) {
                    error = 3;
                    console.log(err);
                } else {
                    console.log("res:", result);
                    error = 0;
                    res.send(result)
                }
                db.close();
            });
        });
    }
    else {
        res.send(error);
    }
}