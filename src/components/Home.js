import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import '../static/Home.css'

function Home() {
  const [imageBase64, setImageBase64] = useState("");
  const [plantToken, setPlantToken] = useState(null);
  const [plantDetails, setPlantDetails] = useState(null);
  const [pastIdentifications, setPastIdentifications] = useState([]);
  const [error, setError] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isNotPlant, setIsNotPlant] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
      fetchUserPlants(userEmail);
    }
  }, []);

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageBase64(imageSrc);
    setShowWebcam(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const identifyPlant = async () => {
    setError(null);
    setPlantDetails(null);
    setIsNotPlant(false);
  
    const userEmail = localStorage.getItem("userEmail") || null;
  
    try {
      const response = await fetch("http://localhost:8080/api/plants/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image: imageBase64, userEmail }), // Fixed reference
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error identifying plant");
      }
  
      if (result.token === "The image is not a plant!") {
        setIsNotPlant(true);
        return;
      }
  
      setPlantToken(result.token);
  
      const detailsResponse = await fetch(
        `http://localhost:8080/api/plants/details/${result.token}`
      );
      const details = await detailsResponse.json();
      setPlantDetails(details);
    } catch (err) {
      console.error("Error identifying plant:", err);
      setError(err.message);
    }
  };

  const fetchUserPlants = async (userEmail) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/plants/user-plants/${userEmail}`
      );
      const plants = await response.json();
      setPastIdentifications(plants);
    } catch (err) {
      console.error("Error fetching user plants:", err);
    }
  };

  const deletePlant = async (accessToken) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/plants/delete/${accessToken}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete plant");
      }
      fetchUserPlants(localStorage.getItem("userEmail"));
    } catch (err) {
      console.error("Error deleting plant:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Plant Identifier</h1>

      {/* Upload from Gallery */}
      <button onClick={() => document.getElementById("galleryInput").click()}>
        Upload from Gallery
      </button>
      <input
        id="galleryInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Take Photo with Webcam */}
      <button onClick={() => setShowWebcam(true)}>Take a Photo</button>

      {showWebcam && (
        <div style={{ marginTop: "20px" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: "100%", maxWidth: "400px", border: "1px solid #ccc" }}
          />
          <button onClick={captureFromWebcam} style={{ marginTop: "10px" }}>
            Capture Photo
          </button>
          <button onClick={() => setShowWebcam(false)} style={{ marginLeft: "10px" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Preview Captured or Selected Image */}
      {imageBase64 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Preview:</h2>
          <img
            src={imageBase64}
            alt="Selected or Captured"
            style={{ maxWidth: "300px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      {imageBase64 && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={identifyPlant}>Identify Plant</button>
        </div>
      )}

      {isNotPlant && (
        <div style={{ color: "orange", marginTop: "20px" }}>
          <strong>Notice:</strong> The uploaded image is not a plant or does not contain a plant.
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {plantToken && (
        <div style={{ marginTop: "20px" }}>
          <strong>Token:</strong> {plantToken}
        </div>
      )}

      {plantDetails && (
        <div style={{ marginTop: "20px" }}>
          <h2>Plant Details</h2>
          <p><strong>Name:</strong> {plantDetails.name}</p>
          <p><strong>Common Names:</strong> {plantDetails.common_names.join(", ")}</p>
          <p><strong>URL:</strong> <a href={plantDetails.url} target="_blank" rel="noreferrer">{plantDetails.url}</a></p>
          <p><strong>Description:</strong> {plantDetails.description}</p>
          <p><strong>Synonyms:</strong> {plantDetails.synonyms.join(", ")}</p>
          <p><strong>Toxicity:</strong> {plantDetails.toxicity}</p>
          <img
            src={plantDetails.image}
            alt={plantDetails.name}
            style={{ maxWidth: "300px", border: "1px solid #ccc", marginTop: "10px" }}
          />
        </div>
      )}

      {isLoggedIn && pastIdentifications.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Past Identifications</h2>
          <ul>
            {pastIdentifications.map((plant) => (
              <li key={plant.accessToken} style={{ marginBottom: "10px" }}>
                <p><strong>{plant.details.name}</strong></p>
                <button onClick={() => deletePlant(plant.accessToken)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
