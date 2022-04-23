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

export async function GetBlocksAvgPrice(blocks) {
    let query_url = url + "avgprice/?";
    for (let i = 0; i < blocks.length; i++) {
        const block_name = blocks[i];
        query_url += 'blocks=';
        query_url += block_name;
        query_url += '&';
    }
    console.log(query_url)
    // encodeURI(query_url)
    let res = await axios.get(encodeURI(query_url));
    let resObj = res.data;
    return resObj[0];
}

export async function GetBlocks() {
    let res = await axios.get("http://localhost:3000/block_data.json")
    return res.data;
}

export async function GetRegions() {
    let res = await axios.get("http://localhost:3000/region_subregion.json")
    return res.data;
}