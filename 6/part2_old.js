(() => {
  let [times, distances] = document.body.innerText.split("\n").filter(v => v).map(
    v => [parseInt(v.replace(/^.+?(?=\d)|\s+/g, ""))]
  );

  let races = times.map((_, i) => ({ time: times[i], record: distances[i] }));

  let product = 1;
  for (let race of races) {
    let midpoint = race.time / 2, radius = Math.sqrt(Math.pow(race.time, 2) - 4 * race.record) / 2;
    let rangeStart = Math.floor(midpoint - radius) + 1;
    let rangeEnd = Math.ceil(midpoint + radius) - 1;

    let nWinningValues = rangeEnd - rangeStart + 1;

    product *= nWinningValues;
  }

  return product;
})();
