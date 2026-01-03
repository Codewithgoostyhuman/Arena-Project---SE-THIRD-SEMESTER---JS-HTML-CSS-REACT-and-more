export default class LeagueOwner extends User {
    constructor(id,name,email,role="LeagueOwner",status="Pending") {
        super(id,name,email,role,status);
        this.leagues =[];
    }
    createLeague(league) {
        this.leagues.push(league);
    }
    createTournament(tournament) {
        // Logic to create a tournament
    }
    announceTournament(tournament) {
        // Logic to announce a tournament
    }
    declareWinners(tournament, winners) {
        // Logic to declare winners
    }
}