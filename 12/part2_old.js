// brute force 2, electric boogaloo

(() => {
  const OPERATIONAL = ".", DAMAGED = "#", UNKNOWN = "?";
  const N_UNFOLD = 5;

  let lines = document.body.innerText.replace(/\n$/, "").split("\n").map(v => {
    let [conditions, damagedGroups] = v.split(" ");
    conditions = conditions.split("");
    damagedGroups = damagedGroups.split(",").map(v => parseInt(v));

    let unfoldedConditions = conditions, unfoldedDamagedGroups = damagedGroups;
    for (let i = 0; i < N_UNFOLD - 1; i++) {
      unfoldedConditions = unfoldedConditions.concat(UNKNOWN, conditions);
      unfoldedDamagedGroups = unfoldedDamagedGroups.concat(damagedGroups);
    }

    return { conditions: unfoldedConditions, damagedGroups: unfoldedDamagedGroups };
  });

  let computeNumArrangementsCache = {};
  function computeNumArrangements(conditions, damagedGroups, currentGroupLength) {
    return computeNumArrangementsCache[JSON.stringify(arguments)] ??= (() => {
      // conditions list has ended - either succeed or fail
      if (!conditions.length) {
        // no remaining groups, and no current groups - successful
        if (!damagedGroups.length && !currentGroupLength) return 1;

        // too many damaged groups remaining
        if (damagedGroups.length > 1) return 0;

        // current group and the last remaining group don't match
        if (damagedGroups[0] !== currentGroupLength) return 0;

        return 1;
      }

      switch (conditions[0]) {
        case OPERATIONAL:
          if (!currentGroupLength) {
            let nOperational = 1;
            while (conditions[nOperational] === OPERATIONAL) nOperational++;
            return computeNumArrangements(conditions.slice(nOperational), damagedGroups, 0);
          }

          // check group is right size
          if (damagedGroups[0] !== currentGroupLength) return 0;

          // move onto next group
          return computeNumArrangements(conditions.slice(1), damagedGroups.slice(1), 0);
        
        case DAMAGED:
          // no groups left
          if (!damagedGroups.length) return 0;

          // group too long
          if (currentGroupLength >= damagedGroups[0]) return 0;

          // make the current group longer
          let nDamaged = 1;
          while (conditions[nDamaged] === DAMAGED) nDamaged++;
          return computeNumArrangements(conditions.slice(nDamaged), damagedGroups, currentGroupLength + nDamaged);
        
        case UNKNOWN:
          let nArrangements = 0;
          nArrangements += computeNumArrangements([OPERATIONAL].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
          nArrangements += computeNumArrangements([DAMAGED].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
          return nArrangements;
      }

      throw new Error("condition not handled");
    })();
  }

  let totalArrangements = 0;
  for (let line of lines) {
    let nArrangements = computeNumArrangements(line.conditions, line.damagedGroups, 0);
    totalArrangements += nArrangements;
  }

  return totalArrangements;
})();
