import { activateUser, activateUserByName, deactivateUser,deleteUser } from "../APIs/UserAPI";
import rating from "./Rating";

export default class Operator extends User{
    constructor(id,name,email,password,role="Operator",status="Active"){
        super(id,name,email,password,role,status);
        this.games = ["Number Guess Duel","Tic Tac Toe","Rock Paper Scissors"];
        this.tournamentStyles = ["Round Robin","Double Round Robin","Single Elimination"];
        this.users = [];
}
async approveUserById(userId){
    try{
        const response = await activateUser(userId);
        return response.data;
    }catch(error){
        console.log("Failed to approve user:",error);
        throw error;
    }
}
async approveUserByName(username){
    try{
        const response = await activateUserByName(username)
            return response.data;
        
    }catch(error){
        console.log("Failed to approve user: ",error);
        throw error;
    }
}
defineRatingForumula(name, winnerScore,drawScore,loserScore){
    return new rating(name,winnerScore,loserScore,drawScore);
}
async getAllUsers(){
    try{
        const {data} = await getUsers();
        this.users = data;
    }catch(error){
        console.log("User not found",error);
        throw error;
    }
}
async deactivateUser(userId){
    return deactivateUser(userId);
}
async deleteUser(userId){
    return deleteUser(userId);
}
addNewGame(GameName){
    this.games.push(GameName);
}
addNewTournamentStyle(tournamentStyleName){
    this.tournamentStyles.push(tournamentStyleName);
}

}