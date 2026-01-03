export const expertRating = (matchResult) => {
  return matchResult === "win" ? 25 :
         matchResult === "draw" ? 10 : -5;
};