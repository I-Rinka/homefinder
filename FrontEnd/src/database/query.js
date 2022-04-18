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

export async function GetBlocks() {
    let res= await axios.get("http://localhost:3000/block_data.json")
    return res.data;
}