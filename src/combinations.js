const percom = require("percom");

function upTo(num) {
  let nums = [];
  let currNum = 1;
  while (num >= currNum) {
    nums.push(currNum);
    currNum++;
  }
  return nums;
}

function removeDuplicateArrays(input) {
  return Array.from(new Set(input.map(JSON.stringify)), JSON.parse);
}

function combinations(termNum, numOfTerms) {
  let terms = upTo(termNum);
  let idx = 1;
  while (idx < numOfTerms) {
    terms.push(...upTo(termNum));
    idx++;
  }
  const array = percom.com(terms, numOfTerms);
  const uniqueArr = removeDuplicateArrays(array);
  return uniqueArr.filter((subArray) => subArray.includes(termNum));
}

module.exports = combinations;
