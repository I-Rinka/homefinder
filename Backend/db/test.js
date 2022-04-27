db.sales_records.aggregate([
    {
        $group: {
            _id: "$block",
            block: { $first: "$block" },
            year: { $max: "$year" },
            month: { $max: "$year", $max: "$month" },
            // unit_price: { $max: "$year", $max: "$month", $avg: "$unit_price" }
        },
    },
    {
        $project: {
            _id: 0
        }
    }
]).forEach(record => {
    print(
        db.sales_records.find(record)
    )
});
db.sales_records.aggregate([
    {
        $match: { 'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里'] } }
    },
    {
        $group: {
            _id: { year: "$year", month: "$month" },
            unit_price: { $avg: "$unit_price" },
            deal_price: { $avg: "$deal_price" },
        },
    },
])
// {
//     $match: {
//         'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里'] }
//     }
// },
// {
//     $group: {
//         _id: null,
//         price: { $avg: "$unit_price" }
//     },
// },
db.sales_records.aggregate([
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
            pipeline: [
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
            pipeline: [
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
])

db.sales_records.aggregate([
    {
        $match: {
            'year': 2020, 'month': 3
        }
    },
    {
        $group: {
            _id: null,
            unit_price: { $avg: "$unit_price" },
            deal_price: { $avg: "$deal_price" },
        },
    },
])

db.sales_records.aggregate([
    {
        $match: {
            'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里'] }
        }
    },
    {
        $group: {
            _id: "$block",
            block: { $first: "$block" },
            year: { $max: "$year" },
            month: { $max: "$year", $max: "$month" }
        },
    },
    {
        $project: {
            _id: 0
        }
    },
    {
        $lookup:
        {
            from: "sales_records",
            let: { blk: "$block", yer: "$year", moth: "$month" },
            pipeline: [
                {
                    $match: {
                        'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里'] }
                    },
                    $match:
                    {
                        $expr:
                        {
                            $and:
                                [
                                    { $eq: ["$block", "$$blk"] },
                                    { $eq: ["$year", "$$yer"] },
                                    { $eq: ["$month", "$$moth"] },
                                ]
                        }
                    }
                }
            ],
            as: "a"
        }
    }
])


db.sales_records.aggregate([
    {
        $match: {
            'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里', '帘子库胡同', '嘉浩国际商住别墅城'] }
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
                    'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里', '帘子库胡同', '嘉浩国际商住别墅城'] }
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
                    'block': { $in: ['高原街4号院', '飞腾家园', '永顺西里', '帘子库胡同', '嘉浩国际商住别墅城'] }
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
    }
])

            // {
            //     $lookup:
            //     {
            //         from: "sales_records",
            //         let: { blk: "$block", yer: "$year" },
            //         pipeline: [{
            //             $match: {
            //                 'block': { $in: block_set }
            //             }
            //         },
            //         {
            //             $match:
            //             {
            //                 $expr:
            //                 {
            //                     $and:
            //                         [
            //                             { $eq: ["$block", "$$blk"] },
            //                             { $eq: ["$year", "$$yer"] },
            //                         ]
            //                 }
            //             }
            //         }
            //         ],
            //         as: 'wantToUnwind'
            //     },
            // },
            // {
            //     $unwind: "$wantToUnwind"
            // },
            // {
            //     $project: {
            //         block: "$wantToUnwind.block",
            //         year: "$wantToUnwind.year",
            //         month: "$wantToUnwind.month",
            //     }
            // },
            // {
            //     $group: {
            //         _id: "$block",
            //         block: { $first: "$block" },
            //         year: { $max: "$year" },
            //         month: { $max: "$month" },
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: "sales_records",
            //         let: { blk: "$block", yer: "$year", mth: "$month" },
            //         pipeline: [{
            //             $match: {
            //                 'block': { $in: block_set }
            //             }
            //         },
            //         {
            //             $match:
            //             {
            //                 $expr:
            //                 {
            //                     $and:
            //                         [
            //                             { $eq: ["$block", "$$blk"] },
            //                             { $eq: ["$year", "$$yer"] },
            //                             { $eq: ["$month", "$$mth"] },
            //                         ]
            //                 }
            //             }
            //         }
            //         ],
            //         as: 'wantToUnwind'
            //     },
            // },
            // {
            //     $unwind: "$wantToUnwind"
            // },
            // {
            //     $project: {
            //         // block: "$wantToUnwind.block",
            //         // area: "$wantToUnwind.area",
            //         // direction: "$wantToUnwind.direction",
            //         // decoration: "$wantToUnwind.decoration",
            //         // year: "$wantToUnwind.year",
            //         // month: "$wantToUnwind.month",
            //         deal_price: "$wantToUnwind.deal_price",
            //         // position: "$wantToUnwind.posiiton",
            //         unit_price: "$wantToUnwind.unit_price",
            //         // region: "$wantToUnwind.region",
            //         // sub_region: "$wantToUnwind.sub_region",
            //         // room: "$wantToUnwind.room",
            //         // hall: "$wantToUnwind.hall",
            //         // block_height: "$wantToUnwind.block_height",
            //         // built_year: "$wantToUnwind.built_year",
            //         // type: "$wantToUnwind.type",
            //     }
            // },
            // {
            //     $group: {
            //         _id: null,
            //         unit_price: { $avg: "$unit_price" },
            //         deal_price: { $avg: "$deal_price" },
            //     },
            // },