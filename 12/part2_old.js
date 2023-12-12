(() => {
  const OPERATIONAL = ".", DAMAGED = "#", UNKNOWN = "?";
  const N_UNFOLD = 5;

  let lines = document.body.innerText.replace(/\n$/, "").split("\n").map(v => {
    let [conditions, damagedGroups] = v.split(" ");
    conditions = conditions.split("");
    damagedGroups = damagedGroups.split(",").map(v => parseInt(v));

    for (let i = 0; i < N_UNFOLD - 1; i++) {
      conditions = conditions.concat(UNKNOWN, conditions);
      damagedGroups = damagedGroups.concat(damagedGroups);
    }

    return { conditions, damagedGroups };
  });

  function computeNumArrangements(conditions, damagedGroups, currentGroupLength = 0) {
    // conditions list has ended - either succeed or fail
    if (!conditions.length) {
      // no remaining groups, and no current groups - successful
      if (!damagedGroups.length && !currentGroupLength) return 1;

      // too many damaged groups remaining
      if (damagedGroups.length > 1) return 0;

      // current group and the last remaining group match - successful
      if (damagedGroups[0] === currentGroupLength) return 1;

      return 0;
    }

    switch (conditions[0]) {
      case OPERATIONAL:
        if (!currentGroupLength) {
          let nOperational = 1;
          while (conditions[nOperational] === OPERATIONAL) nOperational++;
          return computeNumArrangements(conditions.slice(1), damagedGroups, 0);
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
        let nUnknown = 1;
        while (conditions[nUnknown] === UNKNOWN) nUnknown++;

        // no groups remaining; everything must be undamaged
        if (!damagedGroups.length) {
          if (currentGroupLength) throw new Error("non-zero current group");
          return computeNumArrangements(conditions.slice(nUnknown), [], 0);
        }

        if (currentGroupLength) {
          // everything needs to be damaged
          if (currentGroupLength + nUnknown <= damagedGroups[0]) {
            return computeNumArrangements(conditions.slice(nUnknown), damagedGroups, currentGroupLength + nUnknown);
          }

          // final element should be undamaged - replace it
          return computeNumArrangements(
            [OPERATIONAL].concat(conditions.slice(damagedGroups[0] - currentGroupLength + 1)),
            damagedGroups,
            damagedGroups[0]
          );
        }


        // try and fit as many groups into the patch of unknowns as possible

        let nTrailingDamaged = 0;
        while (conditions[nUnknown + nTrailingDamaged] === DAMAGED) nTrailingDamaged++;
        let combinedPatchSize = nUnknown + nTrailingDamaged;

        // TODO - handle ~?##|?
        // let nMaxTrailingDamaged = 0;
        // while ([DAMAGED, UNKNOWN].includes(conditions[nUnknown + nMaxTrailingDamaged])) nMaxTrailingDamaged++;
        // if (nMaxTrailingDamaged) {}

        // nothing can fit
        if (damagedGroups[0].length > nUnknown) {
          if (damagedGroups[0].length > nUnknown + nTrailingDamaged) {
            // ... including in the group after the unknowns; failure
            return 0;
          }
          
          // everything has to be undamaged
          return computeNumArrangements(conditions.slice(nUnknown), damagedGroups, 0);
        }

        let nPossibleGroups = 1, possibleGroupsLength = damagedGroups[0];
        while (
          nPossibleGroups < damagedGroups.length
          && possibleGroupsLength + damagedGroups[nPossibleGroups] + 1 <= combinedPatchSize // fits in the patch
          && damagedGroups[nPossibleGroups] >= nTrailingDamaged // works with the trailing group
        ) {
          possibleGroupsLength += damagedGroups[nPossibleGroups] + 1;
          nPossibleGroups++;
        }


        // compute freeLeft = ~??|.~ and freeRight = ~?.|~ (where | is the end of the patch)
        // and add together, removing the intersection that was double-counted intersection (i.e. ~?.|.~)

        function f(LHS, RHS) {
          let nPatchArrangements = 0;
          for (let value of [DAMAGED, OPERATIONAL]) nPatchArrangements += computeNumArrangements(
            [value].concat(conditions.slice(1, LHS)),
            damagedGroups.slice(0, nPossibleGroups),
            0
          );

          let nFollowingArrangements = 0;
          for (let i = 0; i < nPossibleGroups; i++) {
            nFollowingArrangements += computeNumArrangements(
              conditions.slice(RHS),
              damagedGroups.slice(i + 1),
              0
            );
          }

          return nPatchArrangements * nFollowingArrangements;
        }

        let freeLeft = f(combinedPatchSize, combinedPatchSize + 1);
        let freeRight = nTrailingDamaged ? 0 : f(combinedPatchSize - 1, combinedPatchSize);
        let freeLRIntersection = nTrailingDamaged ? 0 : f(combinedPatchSize - 1, combinedPatchSize + 1);
        return freeLeft + freeRight - freeLRIntersection;
    }

    throw new Error("condition not handled");
  }

  let totalArrangements = 0;
  for (let line of lines) {
    let nArrangements = computeNumArrangements(line.conditions, line.damagedGroups, 0);
    console.log(nArrangements);
    totalArrangements += nArrangements;
  }

  return totalArrangements;
})();
