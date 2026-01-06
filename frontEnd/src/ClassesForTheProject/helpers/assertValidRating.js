export function assertValidRating(rating) {
  if (!rating || typeof rating.calculate !== "function") {
    throw new Error("Invalid Rating: missing calculate() method");
  }
}
