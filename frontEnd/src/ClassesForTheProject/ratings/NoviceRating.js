export const noviceRating = (matchResult) => {
  return matchResult === "win" ? 10 :
         matchResult === "draw" ? 5 : 0;
};