onmessage = function (e) {
  switch (e.data.op) {
    case "compute2way":
      Compute2way(
        e.data.involved_criterias_top,
        e.data.involved_criterias_bottom,
        e.data.current_criterias,
        e.data.current_solutions,
        e.data.current_solutions_scale
      );
      break;
    case "compute3way":
      Compute3way(
        e.data.involved_criterias,
        e.data.current_criterias,
        e.data.current_solutions,
        e.data.current_solutions_scale
      );
      break;
    default:
      break;
  }
};

function Compute2way(
  involved_criterias_top,
  involved_criterias_bottom,
  current_criterias,
  current_solutions,
  current_solutions_scale
) {
  let involved_criterias = involved_criterias_top.concat(
    involved_criterias_bottom
  );
  let change = {
    notChangeCurrent: [],
    currentStillInTop: [],
    topStillHasSb: [],
  };
  // time complexity: 30*30 * 100 * n; 90000
  let static_criterias = current_criterias.filter(
    (d) => !involved_criterias.includes(d.name)
  );
  let top_criterias = current_criterias.filter((d) =>
    involved_criterias_top.includes(d.name)
  );
  let bottom_criterias = current_criterias.filter((d) =>
    involved_criterias_bottom.includes(d.name)
  );

  let step = 1 / 30;
  let end = 1;

  let top_overall = 0;
  let bottom_overall = 0;
  top_criterias.forEach((c) => (top_overall += c.weight));
  bottom_criterias.forEach((c) => (bottom_overall += c.weight));

  let sample_times = 0; // rank frequency
  let rank_map = {};

  for (let c_t = step; c_t < end; c_t += step) {
    let c_b = 1 - c_t;

    sample_times++;

    let record_scores = [];
    if (current_solutions.length > 1) {
      current_solutions.forEach((d, i) => {
        let score = 0;
        let top = 0;
        let bottom = 0;
        static_criterias.forEach(
          (c) => (score += current_solutions_scale[i][c.name] * c.weight)
        );
        top_criterias.forEach(
          (c) => (top += current_solutions_scale[i][c.name] * c.weight)
        );
        bottom_criterias.forEach(
          (c) => (bottom += current_solutions_scale[i][c.name] * c.weight)
        );

        record_scores.push({ index: i, score, top, bottom, new_score: 0 });
      });

      record_scores.forEach((d, i) => {
        let b =
          (record_scores[i].bottom * c_b * (top_overall + bottom_overall)) /
          bottom_overall;
        let t =
          (record_scores[i].top * c_t * (top_overall + bottom_overall)) /
          top_overall;
        record_scores[i].new_score = record_scores[i].score + t + b;
      });

      let n_record_scores = record_scores.map((d) => d);
      n_record_scores.sort((a, b) => a.new_score - b.new_score);

      if (n_record_scores[0].index === 0) {
        change.notChangeCurrent.push(c_b);
      }

      let flag = false;

      for (let i = 0; i < n_record_scores.length; i++) {
        const d = n_record_scores[i];
        if (i < 5) {
          if (d.index < 5) {
            flag = true;
          }
          if (d.index === 0) {
            change.currentStillInTop.push(c_b);
          }

          if (!rank_map[current_solutions[d.index]._id]) {
            rank_map[current_solutions[d.index]._id] = {
              at_top: 0,
              in_top: 0,
            };
          }

          if (i === 0) {
            rank_map[current_solutions[d.index]._id].at_top++;
            rank_map[current_solutions[d.index]._id].in_top++;
          } else {
            rank_map[current_solutions[d.index]._id].in_top++;
          }
        } else {
          break;
        }
      }

      if (flag) {
        change.topStillHasSb.push(c_b);
      }
    }
  }

  let min = 1;
  let max = 0;
  change.notChangeCurrent.forEach((d) => (min = d < min ? d : min));
  change.notChangeCurrent.forEach((d) => (max = d > max ? d : max));
  change.notChangeCurrent = [min, max];

  min = 1;
  max = 0;
  change.currentStillInTop.forEach((d) => (min = d < min ? d : min));
  change.currentStillInTop.forEach((d) => (max = d > max ? d : max));
  change.currentStillInTop = [min, max];

  min = 1;
  max = 0;
  change.topStillHasSb.forEach((d) => (min = d < min ? d : min));
  change.topStillHasSb.forEach((d) => (max = d > max ? d : max));
  change.topStillHasSb = [min, max];

  //   EmitRankFrequency(rank_map, sample_times);
  postMessage({ op: "compute2way", change, rank_map, sample_times });
  return change;
}

function Compute3way(
  involved_criterias,
  current_criterias,
  current_solutions,
  current_solutions_scale
) {
  //
  let change = {
    notChangeCurrent: [],
    currentStillInTop: [],
    topStillHasSb: [],
  };
  let step = 1 / 30;
  let end = 1;

  let sample_times = 0; // rank frequency
  let rank_map = {};

  // time complexity: 30*30 * 100 * n; 90000
  let static_criterias = current_criterias.filter(
    (d) => !involved_criterias.includes(d.name)
  );
  let static_weight_overall = 0;
  static_criterias.forEach((c) => (static_weight_overall += c.weight));

  let record_scores = [];

  if (current_solutions.length > 1) {
    current_solutions.forEach((d, i) => {
      let score = 0;

      static_criterias.forEach(
        (c) => (score += current_solutions_scale[i][c.name] * c.weight)
      );

      record_scores.push({ index: i, score, new_score: 0 });
    });

    for (let c3 = step; c3 <= end - step; c3 += step) {
      for (let c2 = step; c2 + c3 <= end - step; c2 += step) {
        sample_times++;

        let c1 = 1 - (c3 + c2);

        record_scores.forEach((d, i) => {
          let ic1 = current_solutions_scale[i][involved_criterias[0]] * c1;
          let ic2 = current_solutions_scale[i][involved_criterias[1]] * c2;
          let ic3 = current_solutions_scale[i][involved_criterias[2]] * c3;

          record_scores[i].new_score =
            record_scores[i].score +
            (ic1 + ic2 + ic3) * (1 - static_weight_overall);
        });

        // todo: calc other criterias

        let n_record_scores = record_scores.map((d) => d);
        n_record_scores.sort((a, b) => a.new_score - b.new_score);

        if (n_record_scores[0].index === 0) {
          change.notChangeCurrent.push([c1, c2, c3]);
        }

        let flag = false;
        for (let i = 0; i < n_record_scores.length; i++) {
          const d = n_record_scores[i];
          if (i < 5) {
            if (d.index < 5) {
              flag = true;
            }
            if (d.index === 0) {
              change.currentStillInTop.push([c1, c2, c3]);
            }

            if (!rank_map[current_solutions[d.index]._id]) {
              rank_map[current_solutions[d.index]._id] = {
                at_top: 0,
                in_top: 0,
              };
            }

            if (i === 0) {
              rank_map[current_solutions[d.index]._id].at_top++;
              rank_map[current_solutions[d.index]._id].in_top++;
            } else {
              rank_map[current_solutions[d.index]._id].in_top++;
            }
          } else {
            break;
          }
        }

        if (flag) {
          change.topStillHasSb.push([c1, c2, c3]);
        }
      }
    }
  }

  //   EmitRankFrequency(rank_map, sample_times);
  postMessage({ op: "compute3way", change, rank_map, sample_times });
  return change;
}
