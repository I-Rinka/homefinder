import { MongoClient } from "mongodb";
import { url } from "./mongo.js";

export function selectHouse(req, res) {
    let lat1 = req.query.lat1;
    let lat2 = req.query.lat2;

    let lng1 = req.query.lng1;
    let lng2 = req.query.lng2;

    if (lat2 == undefined && lng2 == undefined) {
        lat2 = lat1;
        lng2 = lng1;
    }

    lat1 = parseFloat(lat1);
    lat2 = parseFloat(lat2);
    lng1 = parseFloat(lng1);
    lng2 = parseFloat(lng2);
    MongoClient.connect(url, (err, db) => {
        if (err) {
            console.log(err);
        }
        let dbo = db.db("homefinder");
        let query = { lat: { $lte: lat1, $gte: lat2 }, lng: { $gte: lng1, $lte: lng2 } };
        let result_handler = (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("res:", result);
                res.send(result)
            }
            db.close();
        }

        if (lat1 && lat2 && lng1 && lng2) {
            dbo.collection("house_coord").find(query).toArray(result_handler);
        }
        else {
            dbo.collection("house_coord").find().toArray(result_handler);
        }
    });

}

export function selectRecords(req, res) {
    let query = {
    };

    req.query.block ? query.block = req.query.block : undefined;;
    req.query.year ? query.year = parseInt(req.query.year) : undefined;
    req.query.month ? query.month = parseInt(req.query.month) : undefined;

    console.log(query);
    MongoClient.connect(url, (err, db) => {
        if (err) {
            console.log(err);
        }
        let dbo = db.db("homefinder");
        dbo.collection("sales_records").find(query).toArray((err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result)
            }
            db.close();
        });
    });

}

export function getNewestRecords(req, res) {
    console.log("enter")
    try {
        MongoClient.connect(url, (err, db) => {
            if (err) {
                res.send(err);
            }
            let dbo = db.db("homefinder");
            dbo.collection("newest_records").find().toArray((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("res:", result);
                    res.send(result)
                }
                db.close();
            });
        });
    } catch (error) {
        console.log(error);
    }
}

export function getAvgPrice(req, res) {
    let block_set = req.body;
    if (req.query.month && req.query.year) {
        try {
            MongoClient.connect(url, (err, db) => {
                if (err) {
                    res.status(404);
                }
                try {
                    let dbo = db.db("homefinder");
                    let match_query = {
                        $match: { 'block': { $in: block_set }, 'year': parseInt(req.query.year), 'month': parseInt(req.query.month) }
                    }
                    if (block_set[0] === "*") {
                        delete match_query.$match.block;
                    }

                    dbo.collection("sales_records").aggregate([
                        match_query,
                        {
                            $group: {
                                _id: null,
                                unit_price: { $avg: "$unit_price" },
                                deal_price: { $avg: "$deal_price" },
                            },
                        },
                    ]).toArray((err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(404);
                        } else {
                            res.send(result)
                        }
                        db.close();
                    });
                } catch (error) {

                }
            });
        } catch (error) {
            console.log(error)
        }

    }
    else {
        try {
            MongoClient.connect(url, (err, db) => {
                if (err) {
                    res.status(404);
                }
                try {
                    let dbo = db.db("homefinder");

                    if (block_set[0] === "*") {
                        dbo.collection("newest_records").aggregate([
                            {
                                $group: {
                                    _id: null,
                                    unit_price: { $avg: "$unit_price" },
                                    deal_price: { $avg: "$deal_price" },
                                },
                            },
                        ]).toArray((err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(404);
                            } else {
                                res.send(result)
                            }
                            db.close();
                        });
                    }
                    else {
                        dbo.collection("newest_records").aggregate([
                            {
                                $match: {
                                    'block': { $in: block_set }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    unit_price: { $avg: "$unit_price" },
                                    deal_price: { $avg: "$deal_price" },
                                },
                            },
                        ]).toArray((err, result) => {
                            if (err) {
                                res.status(404);
                            } else {
                                res.send(result)
                            }
                            db.close();
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}