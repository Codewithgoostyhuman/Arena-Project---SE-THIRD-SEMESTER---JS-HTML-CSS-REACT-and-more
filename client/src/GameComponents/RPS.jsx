export default function RPS({ match, player }) {
  const [, refresh] = useState(0);

  const play = (choice) => {
    match.makeMove({ playerId: player.Id, choice });
    refresh(n => n + 1);
  };

  return (
    <div>
      <button onClick={() => play("rock")}>Rock</button>
      <button onClick={() => play("paper")}>Paper</button>
      <button onClick={() => play("scissors")}>Scissors</button>

      {match.status === "finished" && (
        <div>
          {match.game.draw
            ? "Draw"
            : `Winner: ${match.game.winner.name}`}
        </div>
      )}
    </div>
  );
}
