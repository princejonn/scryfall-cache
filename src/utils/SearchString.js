import latinise from "utils/Latinise";

/**
 * Returns text heavily washed and modified to much easier make matching comparisons
 *
 * @param {string} text
 * @returns {string}
 */
export default (text) => {
  return latinise(text)
    .trim()
    .replace(/\s/g, "-")
    .replace(/\'/g, "")
    .replace(/\,/g, "")
    .toLowerCase();
};
