export default class Ad {
  constructor(advertiserName, src) {
    this.id = Math.floor(Math.random() * 1000000); // ✅ matches dashboard
    this.advertiserName = advertiserName;

    this.src = src; // original source (File / URL)
    this.previewUrl =
      src instanceof Blob || src instanceof File
        ? URL.createObjectURL(src)
        : src;

    this.title = `${advertiserName} Advertisement`;
    this.status = "Active";

    // Sponsorship related
    this.scheme = null;
    this.targetId = null;
    this.cost = 50;
  }

  cancel() {
    this.status = "Cancelled";
  }
}
