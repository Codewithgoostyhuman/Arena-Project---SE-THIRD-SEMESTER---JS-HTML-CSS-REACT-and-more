export default class User {
    constructor(Id,name, email,password,role,status) {
        this.Id = Id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
    }
    getId() {
        return this.Id;
    }
    getName() {
        return this.name;
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
    getRole() {
        return this.role;
    }
    getStatus() {
        return this.status;
    }
    updateProfile({name, email, password}) {
        if(name) {this.name = name;}
        if(email) {this.email = email;}
        if(password) {this.password = password;}
    }
}