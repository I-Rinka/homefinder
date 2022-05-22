onmessage = function (e) {
  switch (e.data.op) {
    case "ranking":
      Ranking(e.data);
      break;
    case "moreRanking":
      MoreRanking(e.data);
      break;
    case "uploadDATA":
      UpdateDATA(e.data);
      break;
    default:
      break;
  }
};

let DATA = {};
let latest_ranking = [];
function MoreRanking(data) {
  let offset = data.offset;
  postMessage({
    op: "moreRanking",
    scores: latest_ranking.slice(offset + 1, offset + 5 + 1),
  });
}
function Ranking(data) {
  let scores = [];
  DATA = data.DATA;
  if (DATA.scaled_records) {
    for (let i = 0; i < DATA.scaled_records.length; i++) {
      if (!CheckFilter(i)) continue; // filtering

      let record = DATA.scaled_records[i];
      let s = 0;
      for (let j = 0; j < DATA.enabled_strip.length; j++) {
        let d = DATA.enabled_strip[j];

        if (!DATA.user_mark_records[d.name]) {
          s += (record[d.name] * d.weight) / DATA.strip_percentage_sum.value;
        } else {
          s += (record[d.name] * d.weight) / DATA.strip_percentage_sum.value;
        }
      }
      let obj = { index: i, score: s };
      scores.push(obj);
    }
  }

  scores.sort((a, b) => a.score - b.score);
  latest_ranking = scores;
  postMessage({ op: "ranking", scores: scores });
}

function UpdateDATA(DATA) {
  DATA = DATA.DATA;
  console.log("DATA updated", DATA);
}

function CheckFilter(index) {
  let flag = true;
  for (let i = 0; i < DATA.enabled_strip.length; i++) {
    let attr = DATA.enabled_strip[i].name;
    if (DATA.nominal_attr_name.includes(attr)) {
      // nominal
      let record = DATA.origin_records[index];
      if (!DATA.nominal_filter[attr].includes(record[attr])) {
        flag = false;
        break;
      }
    } else {
      // quantitative
      if (!DATA.user_mark_records[attr]) {
        let record = DATA.origin_records[index];
        if (
          !(
            DATA.quantitative_filter[attr][0] <= record[attr] &&
            DATA.quantitative_filter[attr][1] >= record[attr]
          )
        ) {
          flag = false;
          break;
        }
      } else {
        let record = DATA.user_mark_records[attr][index];
        if (
          !(
            DATA.quantitative_filter[attr][0] <= record &&
            DATA.quantitative_filter[attr][1] >= record
          )
        ) {
          flag = false;
          break;
        }
      }
    }
  }
  if (flag) return true;
  else return false;
}
