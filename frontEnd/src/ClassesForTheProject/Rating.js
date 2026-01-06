import { MatchResult } from "./helpers/matchResult.js";

export default class Rating {
  constructor(name, winnerScore, loserScore, drawScore) {
    this.name = name;
    this.winnerScore = winnerScore;
    this.loserScore = loserScore;
    this.drawScore = drawScore;
  }

  calculate(matchResult) {
    switch (matchResult) {
      case MatchResult.WIN:
        return this.winnerScore;
      case MatchResult.DRAW:
        return this.drawScore;
      case MatchResult.LOSE:
        return this.loserScore;
      default:
        throw new Error(`Invalid match result: ${matchResult}`);
    }
  }
}
