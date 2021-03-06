import { MongoClient } from "mongodb";
import { url } from "./mongo.js";

export function selectHouse_range(req, res) {
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
        let query = {
            lat: { $lte: lat1, $gte: lat2 },
            lng: { $gte: lng1, $lte: lng2 },
        };
        let result_handler = (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("res:", result);
                res.send(result);
            }
            db.close();
        };

        if (lat1 && lat2 && lng1 && lng2) {
            dbo.collection("house_coord").find(query).toArray(result_handler);
        } else {
            dbo.collection("house_coord").find().toArray(result_handler);
        }
    });
}

export function selectHouse(req, res) {
  let mode = req.query.mode;

  if (mode) {
    if (mode === "fromRegion") {
      let region = req.query.region;
      MongoClient.connect(url, (err, db) => {
        if (err || region === undefined || !db) {
          res.status(404);
          return;
        }
        let dbo = db.db("homefinder");
        try {
          dbo
            .collection("newest_records")
            .aggregate([
              {
                $match: { region: region },
              },
              {
                $group: {
                  _id: "$block",
                  //   unit_price: { $avg: "$unit_price" },
                  //   deal_price: { $avg: "$deal_price" },
                },
              },
              {
                $project: {
                  block: "$_id",
                  //   year: "$_id.year",
                  //   month: "$_id.month",
                  //   unit_price: "$unit_price",
                  //   deal_price: "$deal_price",
                },
              },
              {
                $project: {
                  _id: 0,
                },
              },
            ])
            .toArray((err, result) => {
              if (err) {
                console.log(err);
                res.status(404);
              } else {
                res.send(result);
              }
              db.close();
            });
        } catch (error) {
          res.status(502);
          res.send(error);
        }
      });
    }
  } else {
    res.status(404);
  }
}

export function selectRecords(req, res) {
  let query = {};

  req.query.block ? (query.block = req.query.block) : undefined;
  req.query.year ? (query.year = parseInt(req.query.year)) : undefined;
  req.query.month ? (query.month = parseInt(req.query.month)) : undefined;

  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    }
    let dbo = db.db("homefinder");
    dbo
      .collection("sales_records")
      .find(query)
      .toArray((err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
        db.close();
      });
  });
}

export function getNewestRecords(req, res) {
  try {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        res.send(err);
      }
      let dbo = db.db("homefinder");
      try {
        dbo
          .collection("newest_records")
          .find()
          .toArray((err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("res:", result);
              res.send(result);
            }
            db.close();
          });
      } catch (error) {
        res.status(502);
        res.send(error);
      }
    });
  } catch (error) {
    res.status(502);
    res.send(error);
    console.log(error);
  }
}

export function getRegionAvgPrice(req, res) {
  let region = req.query.region;
  MongoClient.connect(url, (err, db) => {
    if (err || region === undefined) {
      res.status(404);
    }
    try {
      if (!db) {
        return
      }
      db.db("homefinder")
        .collection("sales_records")
        .aggregate([
          {
            $match: { region: region },
          },
          {
            $group: {
              _id: { year: "$year", month: "$month" },
              unit_price: { $avg: "$unit_price" },
              deal_price: { $avg: "$deal_price" },
            },
          },
          {
            $project: {
              year: "$_id.year",
              month: "$_id.month",
              unit_price: "$unit_price",
              deal_price: "$deal_price",
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ])
        .toArray((err, result) => {
          if (err) {
            console.log(err);
            res.status(404);
          } else {
            res.send(result);
          }
          db.close();
        });
    } catch (error) {
      res.status(502);
      res.send(error);
    }
  });
}

export function getSubRegionAvgPrice(req, res) {
    let region = req.query.sub_region;
    MongoClient.connect(url, (err, db) => {
      if (err || region === undefined) {
        res.status(404);
      }
      try {
        if (!db) {
          return
        }
        db.db("homefinder")
          .collection("sales_records")
          .aggregate([
            {
              $match: { sub_region: region },
            },
            {
              $group: {
                _id: { year: "$year", month: "$month" },
                unit_price: { $avg: "$unit_price" },
                deal_price: { $avg: "$deal_price" },
              },
            },
            {
              $project: {
                year: "$_id.year",
                month: "$_id.month",
                unit_price: "$unit_price",
                deal_price: "$deal_price",
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ])
          .toArray((err, result) => {
            if (err) {
              console.log(err);
              res.status(404);
            } else {
              res.send(result);
            }
            db.close();
          });
      } catch (error) {
        res.status(502);
        res.send(error);
      }
    });
  }
  

export function getAvgPrice(req, res) {
  let block_set = req.body;
  if (req.query.year) {
    try {
      MongoClient.connect(url, (err, db) => {
        if (err) {
          res.status(404);
        }
        try {
          let dbo = db.db("homefinder");
          if (req.query.year === "*") {
            dbo
              .collection("sales_records")
              .aggregate([
                {
                  $match: { block: { $in: block_set } },
                },
                {
                  $group: {
                    _id: { year: "$year", month: "$month" },
                    unit_price: { $avg: "$unit_price" },
                    deal_price: { $avg: "$deal_price" },
                  },
                },
                {
                  $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    unit_price: "$unit_price",
                    deal_price: "$deal_price",
                  },
                },
                {
                  $project: {
                    _id: 0,
                  },
                },
              ])
              .toArray((err, result) => {
                if (err) {
                  console.log(err);
                  res.status(404);
                } else {
                  res.send(result);
                }
                db.close();
              });
          } else if (req.query.month) {
            let match_query = {
              $match: {
                block: { $in: block_set },
                year: parseInt(req.query.year),
                month: parseInt(req.query.month),
              },
            };
            if (block_set[0] === "*") {
              delete match_query.$match.block;
            }

            dbo
              .collection("sales_records")
              .aggregate([
                match_query,
                {
                  $group: {
                    _id: null,
                    unit_price: { $avg: "$unit_price" },
                    deal_price: { $avg: "$deal_price" },
                  },
                },
              ])
              .toArray((err, result) => {
                if (err) {
                  console.log(err);
                  res.status(404);
                } else {
                  res.send(result);
                }
                db.close();
              });
          }
        } catch (error) {
          res.status(502);
          res.send(error);
        }
      });
    } catch (error) {
      console.log(error);
      db.close();
      res.status(502);
      res.send(error);
    }
  } else {
    try {
      MongoClient.connect(url, (err, db) => {
        if (err) {
          res.status(404);
        }
        try {
          let dbo = db.db("homefinder");
          if (block_set[0] === "*") {
            dbo
              .collection("newest_records")
              .aggregate([
                {
                  $group: {
                    _id: null,
                    unit_price: { $avg: "$unit_price" },
                    deal_price: { $avg: "$deal_price" },
                  },
                },
              ])
              .toArray((err, result) => {
                if (err) {
                  console.log(err);
                  res.status(404);
                } else {
                  res.send(result);
                }
                db.close();
              });
          } else {
            dbo
              .collection("newest_records")
              .aggregate([
                {
                  $match: {
                    block: { $in: block_set },
                  },
                },
                {
                  $group: {
                    _id: null,
                    unit_price: { $avg: "$unit_price" },
                    deal_price: { $avg: "$deal_price" },
                  },
                },
              ])
              .toArray((err, result) => {
                if (err) {
                  res.status(404);
                } else {
                  res.send(result);
                }
                db.close();
              });
          }
        } catch (error) {
          res.status(502);
          res.send(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
