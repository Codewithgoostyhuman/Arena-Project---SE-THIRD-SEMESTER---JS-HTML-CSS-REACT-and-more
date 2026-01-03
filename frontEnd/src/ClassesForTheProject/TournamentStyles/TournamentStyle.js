export default class TournamentStyle{
    constructor(players = []){
        if(new.target === TournamentStyle){
            throw new TypeError("Cannot construct TournamentStyle instances directly");
        }
        this.players = players;
    }
    getPlayers(){
        return this.players;
    }
    getMatchCount(){
        throw new Error("Method 'getMatchCount()' must be implemented.");
    }
    generateMatches(){
        throw new Error("Method 'generateMatches()' must be implemented.");
    }
}