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

    let error = 1;
    lat1 = parseFloat(lat1);
    lat2 = parseFloat(lat2);
    lng1 = parseFloat(lng1);
    lng2 = parseFloat(lng2);
    MongoClient.connect(url, (err, db) => {
        if (err) {
            error = 2;
            res.send(error);
        }
        let dbo = db.db("homefinder");
        let query = { lat: { $lte: lat1, $gte: lat2 }, lng: { $gte: lng1, $lte: lng2 } };
        let result_handler = (err, result) => {
            if (err) {
                error = 3;
                console.log(err);
            } else {
                console.log("res:", result);
                error = 0;
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
    let error = 1;
    MongoClient.connect(url, (err, db) => {
        if (err) {
            error = 2;
            res.send(error);
        }
        let dbo = db.db("homefinder");
        dbo.collection("sales_records").find(query).toArray((err, result) => {
            if (err) {
                error = 3;
                console.log(err);
            } else {
                error = 0;
                res.send(result)
            }
            db.close();
        });
    });

}

export function getNewestRecords(req, res) {
    console.log("enter")
    let error = 1;
    MongoClient.connect(url, (err, db) => {
        if (err) {
            error = 2;
            res.send(error);
        }
        let dbo = db.db("homefinder");
        dbo.collection("sales_records").aggregate([
            {
                $group: {
                    _id: "$block",
                    block: { $first: "$block" },
                    year: { $max: "$year" },
                    month: { $max: "$year", $max: "$month" },
                },
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]).toArray((err, result) => {
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

export function getAvgPrice(req, res) {
    let block_set = [];
    if (typeof req.query.blocks === 'string') {
        block_set.push(req.query.blocks)
    }
    else {
        block_set = req.query.blocks;
    }
    console.log(block_set);
    let error = 1;
    MongoClient.connect(url, (err, db) => {
        if (err) {
            error = 2;
            res.send(error);
        }
        let dbo = db.db("homefinder");
        dbo.collection("sales_records").aggregate([
            {
                $match: {
                    'block': { $in: block_set }
                }
            },
            {
                $group: {
                    _id: "$block",
                    block: { $first: "$block" },
                    year: { $max: "$year" },
                },
            },
            {
                $lookup:
                {
                    from: "sales_records",
                    let: { blk: "$block", yer: "$year" },
                    pipeline: [{
                        $match: {
                            'block': { $in: block_set }
                        }
                    },
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ["$block", "$$blk"] },
                                        { $eq: ["$year", "$$yer"] },
                                    ]
                            }
                        }
                    }
                    ],
                    as: 'wantToUnwind'
                },
            },
            {
                $unwind: "$wantToUnwind"
            },
            {
                $project: {
                    block: "$wantToUnwind.block",
                    year: "$wantToUnwind.year",
                    month: "$wantToUnwind.month",
                }
            },
            {
                $group: {
                    _id: "$block",
                    block: { $first: "$block" },
                    year: { $max: "$year" },
                    month: { $max: "$month" },
                },
            },
            {
                $lookup:
                {
                    from: "sales_records",
                    let: { blk: "$block", yer: "$year", mth: "$month" },
                    pipeline: [{
                        $match: {
                            'block': { $in: block_set }
                        }
                    },
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ["$block", "$$blk"] },
                                        { $eq: ["$year", "$$yer"] },
                                        { $eq: ["$month", "$$mth"] },
                                    ]
                            }
                        }
                    }
                    ],
                    as: 'wantToUnwind'
                },
            },
            {
                $unwind: "$wantToUnwind"
            },
            {
                $project: {
                    block: "$wantToUnwind.block",
                    area: "$wantToUnwind.area",
                    direction: "$wantToUnwind.direction",
                    decoration: "$wantToUnwind.decoration",
                    year: "$wantToUnwind.year",
                    month: "$wantToUnwind.month",
                    deal_price: "$wantToUnwind.deal_price",
                    position: "$wantToUnwind.posiiton",
                    unit_price: "$wantToUnwind.unit_price",
                    region: "$wantToUnwind.region",
                    sub_region: "$wantToUnwind.sub_region",
                    room: "$wantToUnwind.room",
                    hall: "$wantToUnwind.hall",
                    block_height: "$wantToUnwind.block_height",
                    built_year: "$wantToUnwind.built_year",
                    type: "$wantToUnwind.type",
                }
            },
            {
                $group: {
                    _id: "$block",
                    block: { $first: "$block" },
                    year: { $max: "$year" },
                    month: { $max: "$month" },
                    avg_price: { $avg: "$unit_price" },
                },
            },
        ]).toArray((err, result) => {
            if (err) {
                error = 3;
                console.log(err);
            } else {
                error = 0;
                res.send(result)
            }
            db.close();
        });
    });
}