import React, { useMemo, useState } from "react";
import "./locationFinder.css";

import carParkImg from "../../assets/carpark.jpg";
import newBuildingImg from "../../assets/newbuilding.jpg";
import libraryImg from "../../assets/library.jpg";
import labImg from "../../assets/lab.jpg";
import officeImg from "../../assets/studentaffair.jpeg";
import medicalCenterImg from "../../assets/medicalCenter.jpg";
import sportsComplexImg from "../../assets/sportsComplex.jpg";
import cafeteriaImg from "../../assets/cafeteria.jpg";


const dummyLocations = [
  {
    _id: "1",
    name: "SLIIT Car Park",
    category: "Parking",
    building: "Near New Building",
    floor: "Ground Floor",
    roomNumber: "",
    nearbyLandmark: "Next to New Building",
    description: "Main student parking area inside the campus.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Car+Park",
    image: carParkImg,
    status: "Available",
  },
  {
    _id: "2",
    name: "New Building",
    category: "Lecture Hall",
    building: "Main Campus",
    floor: "1",
    roomNumber: "NB-101",
    nearbyLandmark: "Near SLIIT Car Park",
    description:
      "Main lecture building used for student lectures and academic activities.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+New+Building",
    image: newBuildingImg,
    status: "Available",
  },
  {
    _id: "3",
    name: "Main Library",
    category: "Library",
    building: "Block A",
    floor: "2",
    roomNumber: "A-201",
    nearbyLandmark: "Opposite New Building",
    description: "Library for study, books, references, and learning resources.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Library",
    image: libraryImg,
    status: "Available",
  },
  {
    _id: "4",
    name: "Engineering Lab",
    category: "Lab",
    building: "Engineering Block",
    floor: "3",
    roomNumber: "E-305",
    nearbyLandmark: "Near Main Library",
    description: "Laboratory facility for engineering practical sessions.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Engineering+Lab",
    image: labImg,
    status: "Temporarily Closed",
  },
  {
    _id: "5",
    name: "Student Affairs Office",
    category: "Office",
    building: "Admin Block",
    floor: "1",
    roomNumber: "ADM-103",
    nearbyLandmark: "Near Main Entrance",
    description:
      "Office for student support, academic letters, and campus-related inquiries.",
    googleMapsLink:
      "https://www.google.com/maps/search/SLIIT+Student+Affairs+Office",
    image: officeImg,
    status: "Available",
  },
  {
    _id: "6",
    name: "Campus Cafeteria",
    category: "Cafeteria",
    building: "Food Court Area",
    floor: "Ground Floor",
    roomNumber: "",
    nearbyLandmark: "Near New Building",
    description: "Main campus cafeteria for meals, snacks, and refreshments.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Cafeteria",
    image: cafeteriaImg,
    status: "Available",
  },
  {
    _id: "7",
    name: "Medical Center",
    category: "Medical",
    building: "Wellness Block",
    floor: "Ground Floor",
    roomNumber: "MC-01",
    nearbyLandmark: "Near Sports Complex",
    description: "Medical support center for students and staff.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Medical+Center",
    image: medicalCenterImg,
    status: "Available",
  },
  {
    _id: "8",
    name: "Sports Complex",
    category: "Sports",
    building: "Sports Zone",
    floor: "Ground Floor",
    roomNumber: "",
    nearbyLandmark: "Near Medical Center",
    description:
      "Campus sports area for practices, matches, and student activities.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Sports+Complex",
    image: sportsComplexImg,
    status: "Available",
  },
];

export default function LocationFinder() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const locations = useMemo(() => {
    return dummyLocations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.building.toLowerCase().includes(search.toLowerCase()) ||
        location.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category ? location.category === category : true;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="location-finder-page">
      <div className="location-finder-container">
        <h1>Campus Location Finder</h1>
        <p className="finder-subtitle">
          Search official campus places and open them in Google Maps.
        </p>

        <form className="finder-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by location name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Lab">Lab</option>
            <option value="Library">Library</option>
            <option value="Office">Office</option>
            <option value="Cafeteria">Cafeteria</option>
            <option value="Parking">Parking</option>
            <option value="Medical">Medical</option>
            <option value="Sports">Sports</option>
            <option value="Washroom">Washroom</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">Search</button>
        </form>

        {locations.length === 0 ? (
          <p>No matching locations found.</p>
        ) : (
          <div className="finder-grid">
            {locations.map((location) => (
              <div className="finder-card" key={location._id}>
                {location.image ? (
                  <img src={location.image} alt={location.name} />
                ) : (
                  <div className="finder-image-placeholder">No Image</div>
                )}

                <h3>{location.name}</h3>
                <p><strong>Category:</strong> {location.category}</p>
                <p><strong>Building:</strong> {location.building}</p>
                <p><strong>Floor:</strong> {location.floor}</p>

                {location.roomNumber && (
                  <p><strong>Room:</strong> {location.roomNumber}</p>
                )}

                {location.nearbyLandmark && (
                  <p><strong>Nearby:</strong> {location.nearbyLandmark}</p>
                )}

                {location.description && (
                  <p><strong>Description:</strong> {location.description}</p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      location.status === "Available"
                        ? "status-available"
                        : "status-closed"
                    }
                  >
                    {location.status}
                  </span>
                </p>

                <a
                  href={location.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="finder-map-btn"
                >
                  Open in Google Maps
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}