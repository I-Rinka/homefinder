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