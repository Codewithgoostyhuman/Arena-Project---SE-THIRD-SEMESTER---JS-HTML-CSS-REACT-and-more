import React, { useState, useEffect } from "react";
import Advertiser from "../ClassesForTheProject/Adverstiser";
import Ad from "../ClassesForTheProject/Ad";

const AdvertiserDashboard = () => {
  const [advertiser, setAdvertiser] = useState(
    new Advertiser(1, "Global Brands", "ads@gbc.com", "pass")
  );
  const [filter, setFilter] = useState("ACTIVE");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState("");

  const cloneAdvertiser = () =>
    Object.assign(Object.create(Object.getPrototypeOf(advertiser)), advertiser);

  // Upload Ad
  const handleUpload = () => {
    if (!selectedFile) return alert("Select an image first");

    const updated = cloneAdvertiser();
    updated.createAdvertisement(selectedFile);

    setAdvertiser(updated);
    setSelectedFile(null);
  };

  // Sponsor Ad
  const sponsorAd = (adId) => {
    if (!selectedScheme) return alert("Select a sponsorship scheme");

    const updated = cloneAdvertiser();

    const tournament = { id: 1, name: "Arena Championship" };
    const league = { id: 101, name: "Pro League" };

    if (selectedScheme === "Tournament") {
      updated.sponsorTournament(adId, tournament);
    } else {
      updated.sponsorLeague(adId, league);
    }

    setAdvertiser(updated);
    setSelectedScheme("");
  };

  // Cancel Ad
  const cancelAd = (adId) => {
    const updated = cloneAdvertiser();
    updated.cancelAdvertisement(adId);
    setAdvertiser(updated);
  };

  // Hide Ad
  const hideAd = (adId) => {
    const updated = cloneAdvertiser();
    const ad = updated.advertisements.find((a) => a.id === adId);
    if (ad) ad.hidden = true;
    setAdvertiser(updated);
  };

  // Reset hidden ads whenever filter changes
  useEffect(() => {
    const updated = cloneAdvertiser();
    updated.advertisements.forEach((ad) => (ad.hidden = false));
    setAdvertiser(updated);
  }, [filter]);

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-4xl font-black text-center text-red-500 mb-4">
        Advertiser Dashboard
      </h1>

      <p className="text-center mb-10 tracking-widest">
        Credit Balance:{" "}
        <span className="text-red-500">${advertiser.credit}</span>
      </p>

      {/* Upload Section */}
      <div className="flex justify-center gap-4 mb-12">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-red-600 rounded font-bold"
        >
          Upload Ad
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {["ACTIVE", "CANCELLED", "ALL"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-bold border ${
              filter === f
                ? "border-red-500 text-red-500"
                : "border-zinc-600 text-zinc-400"
            }`}
          >
            {f === "ACTIVE"
              ? "Active Ads"
              : f === "CANCELLED"
              ? "Cancelled Ads"
              : "All Ads"}
          </button>
        ))}
      </div>

      {/* Ads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {advertiser.advertisements
          .filter((ad) => {
            if (filter !== "ALL" && ad.hidden) return false;
            if (filter === "ACTIVE") return ad.status === "Active";
            if (filter === "CANCELLED") return ad.status === "Cancelled";
            return true;
          })
          .map((ad) => (
            <div
              key={ad.id}
              className="relative bg-zinc-900 p-5 rounded-xl border border-zinc-700"
            >
              {/* Close Button: only show if NOT viewing all ads */}
              {filter !== "ALL" && (
                <button
                  onClick={() => hideAd(ad.id)}
                  className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 text-sm font-bold"
                  title="Remove Ad"
                >
                  ✕
                </button>
              )}

              <img
                src={ad.previewUrl}
                alt="Ad"
                className="h-40 w-full object-cover rounded mb-4"
              />

              <p className="text-xs uppercase tracking-widest mb-2">
                Status:{" "}
                <span className="text-red-500 font-bold">{ad.status}</span>
              </p>

              <p className="text-xs mb-2">Scheme: {ad.scheme ?? "None"}</p>

              {/* Scheme Selection */}
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full mb-3 bg-black border border-zinc-600 p-2 text-xs"
              >
                <option value="">Select Scheme</option>
                <option value="Tournament">Tournament Sponsor</option>
                <option value="League">League Sponsor</option>
              </select>

              <button
                onClick={() => sponsorAd(ad.id)}
                disabled={ad.status === "Cancelled"}
                className="w-full mb-2 py-2 border border-red-500 text-red-500 text-xs font-bold uppercase"
              >
                Sponsor
              </button>

              <button
                onClick={() => cancelAd(ad.id)}
                disabled={ad.status === "Cancelled"}
                className="w-full py-2 text-xs border border-zinc-600 uppercase"
              >
                Cancel
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
