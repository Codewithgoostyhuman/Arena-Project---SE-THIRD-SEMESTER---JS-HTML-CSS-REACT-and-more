export default class User {
    constructor(Id,name, email,password,role,status) {
        this.Id = Id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
    }
    updateProfile({name, email, password}) {
        if(name) {this.name = name;}
        if(email) {this.email = email;}
        if(password) {this.password = password;}
    }
}