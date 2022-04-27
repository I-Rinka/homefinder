import axios from "axios";
let url = "http://localhost:27727/api/"

export async function GetCurrentRecord() {
    let res = await axios.get(url + "currentrecord")
    let resObj = res.data
    console.log(resObj);
    let ans = {};
    for (let i = 0; i < resObj.length; i++) {
        const element = resObj[i];
        ans[element["block"]] = { year: element.year, month: element.month };
    }
    return ans;
}

export async function GetBlocksAvgPrice(blocks, controller) {
    let query_url = url + "avgprice/";
    let res = await axios.post(query_url, blocks, {
        signal: controller ? controller.signal : undefined
    })
    let resObj = res.data;
    return resObj[0];
}

export async function GetBlocksAvgPriceYearMonth(blocks, year, month, controller) {
    let query_url = url + "avgprice/";
    let res = await axios.post(query_url, blocks, {
        params: {
            year,
            month
        },
        signal: controller ? controller.signal : undefined
    })
    let resObj = res.data;
    return resObj[0];
}
export async function GetBlocksAvgPriceAllTime(blocks, controller) {
    let query_url = url + "avgprice/";
    try {
        let res = await axios.post(query_url, blocks, {
            params: {
                year: '*',
            },
            signal: controller ? controller.signal : undefined
        })
        let resObj = res.data;

        return resObj;
    } catch (error) {
        throw error;
    }
}

export async function GetBlocks() {
    let res = await axios.get("http://localhost:3000/block_data.json")
    return res.data;
}

export async function GetRegions() {
    let res = await axios.get("http://localhost:3000/region_subregion.json")
    return res.data;
}