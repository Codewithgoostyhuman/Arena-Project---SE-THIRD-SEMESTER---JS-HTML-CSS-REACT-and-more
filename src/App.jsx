import { useState } from "react";

import Player from "./ClassesForTheProject/Player";
import Match from "./ClassesForTheProject/Match.js";
import TicTacToe from "./ClassesForTheProject/GameLogics/tictactoelogic.js";
import TicTacToeBoard from "./GameComponents/TicTacToeBoard.jsx";
import NumberGuessDuel from "./ClassesForTheProject/GameLogics/numberguessduellogic.js";
import NumberGuessDuelUI from "./GameComponents/NumberGuessDuelUI.jsx";
import RockPaperScissors from "./ClassesForTheProject/GameLogics/rockpaperscissorslogic.js";
import RockPaperScissorsUI from "./GameComponents/RPS.jsx";
import League from "./ClassesForTheProject/League.js";

function App() {
 // 1️⃣ Create players
  const player1 = new Player(1, "Ali", "ali@test.com", "123");
  const player2 = new Player(2, "Sara", "sara@test.com", "123");
  const player3 = new Player(3, "Ahmed", "ahmed@test.com", "123");
  const player4 = new Player(4, "Fatima", "fatima@test.com", "123");

  // 2️⃣ Create league
  const league = new League(
    "Number Guess League",
    "Admin",
    NumberGuessDuel,
    (result) => (result === "win" ? 5 : 2)
  );

  league.addPlayer(player1);
  league.addPlayer(player2);
  league.addPlayer(player3);
  league.addPlayer(player4);

  // 3️⃣ Create match (manual for now)
  const [match] = useState(() => {
    const m = new Match(NumberGuessDuel, [player1, player2,player3,player4]);
    // m.start();


    return m;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>{league.name}</h1>

      <h3>
        {player1.name} vs {player2.name}
      </h3>

      <NumberGuessDuelUI match={match} player={player1} />
      <NumberGuessDuelUI match={match} player={player2} />
      <NumberGuessDuelUI match={match} player={player3} />
      <NumberGuessDuelUI match={match} player={player4} />

      {match.status === "finished" && (
        <div style={{ marginTop: 20 }}>
          <h2>Match Finished</h2>

          {match.game.draw ? (
            <p>Draw</p>
          ) : (
            <p>Winner: {match.game.winner.name}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
