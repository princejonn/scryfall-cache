import latinise from "./latinise";

const searchString = (string: string): string => {
  return latinise(string)
    .trim()
    .replace(/\s/g, "-")
    .replace(/\'/g, "")
    .replace(/\,/g, "")
    .toLowerCase();
};

export default searchString;
