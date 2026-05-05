function isNumber(str) {
  if (typeof str === "number") return true;
  if (typeof str !== "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

module.exports = {
  isNumber,
};
