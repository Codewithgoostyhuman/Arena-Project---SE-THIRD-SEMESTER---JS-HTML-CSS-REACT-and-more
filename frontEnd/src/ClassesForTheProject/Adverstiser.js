import Ad from "./Ad";
import User from "./User";

export default class Advertiser extends User {
  constructor(
    id,
    name,
    email,
    password,
    role = "Advertiser",
    status = "Pending"
  ) {
    super(id, name, email, password, role, status);
    this.advertisements = [];
    this.credit = 500;
  }

  createAdvertisement(src) {
    const newAd = new Ad(this.name, src);
    this.advertisements.push(newAd);
    console.log("Ad uploaded successfully.");
    return newAd;
  }

  sponsorTournament(adId, tournament) {
    const ad = this.advertisements.find(a => a.id === adId);

    if (!ad) {
      console.log("Ad not found.");
      return;
    }

    if (this.credit < ad.cost) {
      console.log("Insufficient credit.");
      return;
    }

    ad.scheme = "Tournament Sponsor";
    ad.targetId = tournament.id;
    this.credit -= ad.cost;

    console.log(`Sponsored Tournament: ${tournament.name}`);
  }

  sponsorLeague(adId, league) {
    const ad = this.advertisements.find(a => a.id === adId);

    if (!ad) {
      console.log("Ad not found.");
      return;
    }

    if (this.credit < ad.cost) {
      console.log("Insufficient credit.");
      return;
    }

    ad.scheme = "League Sponsor";
    ad.targetId = league.id;
    this.credit -= ad.cost;

    console.log(`Sponsored League: ${league.name}`);
  }

  checkBalance() {
    console.log(`Current Credit Balance: $${this.credit}`);
    return this.credit;
  }

  addCredit(amount) {
    this.credit += amount;
  }

  cancelAdvertisement(adId) {
    const ad = this.advertisements.find(a => a.id === adId);
    if (ad) {
      ad.status = "Cancelled";
      console.log(`Ad ${adId} cancelled.`);
    }
  }
}
