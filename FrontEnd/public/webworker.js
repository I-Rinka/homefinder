onmessage = function (e) {
  let scores = e.data.scores;

  scores.sort((a, b) => a.score - b.score);
  postMessage({ scores: scores });
};
