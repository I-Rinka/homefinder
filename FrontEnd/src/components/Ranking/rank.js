const ranking_score = () => {
    let scores = [];
    for (let i = 0; i < data.scaled_records.length; i++) {
        if (!CheckFilter(i)) continue; // 删掉不enabled的

        let record = data.scaled_records[i];
        let s = 0;
        for (let j = 0; j < enabled_strip.value.length; j++) {
            let d = enabled_strip.value[j];
            s += record[d.name] * d.weight;
        }
        let obj = { index: i, score: s };
        scores.push(obj);
    }
    console.log("computed_ranking_score", scores);
    // 按照排序
    scores.sort((a, b) => {
        return a.score - b.score;
    });
    return scores;
}

// ranking score相当于是得到map后的index，然后再按照

// nominal_attr_name: 
const nominal_attr_name = ["direction", "decoration", "position", "type"];
function CheckFilter(index) {
    let record = props.origin_records[index];
    let flag = true;
    // 在enabledstrip中
    for (let i = 0; i < enabled_strip.value.length; i++) {
        let attr = enabled_strip.value[i].name;
        if (nominal_attr_name.includes(attr)) {
            // nominal
            if (!data.nominal_filter[attr].includes(record[attr])) {
                flag = false;
                break;
            }
        } else {
            // quantitative
            if (
                !(
                    data.quantitative_filter[attr][0] <= record[attr] &&
                    data.quantitative_filter[attr][1] >= record[attr]
                )
            ) {
                flag = false;
                break;
            }
        }
    }
    if (flag) return true;
    else return false;
}