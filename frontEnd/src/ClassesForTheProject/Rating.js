export default class rating{
    constructor(name,winnerScore,loserScore,drawScore){
        this.name = name;
        this.winnerScore = winnerScore;
        this.loserScore = loserScore;
        this.drawScore = drawScore;
    }
      calculate(matchResult) {
    switch (matchResult) {
      case "win":
        return this.winnerScore;
      case "draw":
        return this.drawScore;
      case "lose":
        return this.loserScore;
      default:
        throw new Error(`Invalid match result: ${matchResult}`);
    }
  }
}

