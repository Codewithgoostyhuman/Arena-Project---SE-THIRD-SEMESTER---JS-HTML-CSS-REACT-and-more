import League from "./League";
export default class LeagueOwner extends User {
  constructor(id, name, email, role = "LeagueOwner", status = "Pending") {
    super(id, name, email, role, status);
    this.leagues = [];
  }
  createLeague(leagueName) {
    this.leagues.push(
      new League(leagueName, this.name, GameClass, ratingFunction)
    );
  }
  createTournament(
    LeagueName,
    tournamentName,
    TournamentStyle,
    startDate,
    endDate,
    maxPlayers
  ) {
    LeagueName.createTournament(
      tournamentName,
      TournamentStyle,
      startDate,
      endDate,
      maxPlayers
    );
    console.log(`Tournament created with name ${tournamentName}`);
  }
  announceTournament(LeagueName, tournamentName) {
    LeagueName.announceTournament(tournamentName);
    console.log(`Tournament announced with name: ${tournamentName}`);
  }
  declareWinners(tournament) {
    const winners = tournament.getWinners();
    console.log(
      `Winner of ${tournament.name}: ${winners
        .map((w) => w.name)
        .join(", ")}`
    );
  }
}
