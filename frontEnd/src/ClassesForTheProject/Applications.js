export default class Application{
    constructor(playerName,leagueName,status="Pending"){
        this.playerName=playerName;
        this.leagueName=leagueName;
        this.status=status;
        this.ApplicationId= Math.floor(Math.random() * 1000000);
    }
    
}