export default class Operator extends User{
    constructor(id,name,email,password,role="Operator",status="Active"){
        super(id,name,email,password,role,status);
}
approveUser(user){
    user.status="Active";
}
}