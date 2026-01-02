import { useState } from "react";

export default function TicTacToeBoard({ match }) {
  const [, forceUpdate] = useState(0);
  const game = match.game;

  const play = (i) => {
    match.makeMove(i);
    forceUpdate(n => n + 1);
  };

  return (
    <div style={{ width: 150 }}>
      {game.board.map((cell, i) => (
        <button
          key={i}
          onClick={() => play(i)}
          style={{ width: 50, height: 50 }}
        >
          {cell}
        </button>
      ))}
      <div>
        {match.status === "finished" &&
          (game.draw
            ? "Draw"
            : `Winner: ${game.winner.name}`)}
      </div>
    </div>
  );
}
