export default class Advertiser extends User {
    constructor(id, name, email, password, role = "Advertiser", status = "Pending") {
        super(id, name, email, password, role, status);
        this.advertisements = [];
    }
    createAdvertisement(advertisement) {
        this.advertisements.push(advertisement);
    }
}