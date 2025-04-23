import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import "../static/Home.css";
import PlantResult from "./PlantResult";

function Home() {
  const [imageBase64, setImageBase64] = useState("");
  const [plantToken, setPlantToken] = useState(null);
  const [plantDetails, setPlantDetails] = useState(null);
  const [pastIdentifications, setPastIdentifications] = useState([]);
  const [error, setError] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [isNotPlant, setIsNotPlant] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const webcamRef = useRef(null);
  const resultRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants";

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
      fetchUserPlants(userEmail);
    }
  }, []);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [plantDetails]);

  const fetchUserPlants = async (userEmail) => {
    try {
      const response = await fetch(`${API_URL}/user-plants/${userEmail}`);
      const plants = await response.json();
      setPastIdentifications(plants);
    } catch (err) {
      console.error("Error fetching user plants:", err);
    }
  };

  const handleImageSelection = (image) => {
    setImageBase64(image);
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) fetchUserPlants(userEmail);
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    handleImageSelection(imageSrc);
    setShowWebcam(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => handleImageSelection(reader.result);
    reader.readAsDataURL(file);
  };

  const identifyPlant = async () => {
    setError(null);
    setPlantDetails(null);
    setIsNotPlant(false);

    const userEmail = localStorage.getItem("userEmail");

    try {
      const response = await fetch(`${API_URL}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: imageBase64, userEmail }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error identifying plant");

      if (result.token === "The image is not a plant!") {
        setIsNotPlant(true);
        return;
      }

      setPlantToken(result.token);

      const detailsResponse = await fetch(`${API_URL}/details/${result.token}`);
      const details = await detailsResponse.json();
      setPlantDetails(details);

      if (userEmail) fetchUserPlants(userEmail);
    } catch (err) {
      console.error("Error identifying plant:", err);
      setError(err.message);
    }
  };

  const deletePlant = async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/delete/${accessToken}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete plant");

      fetchUserPlants(localStorage.getItem("userEmail"));
    } catch (err) {
      console.error("Error deleting plant:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Plant Identifier</h1>

      <div className="button-group">
        <button
          onClick={() => {
            setImageBase64("");
            setPlantDetails(null);
            setPlantToken(null);
            document.getElementById("galleryInput").click();
          }}
        >
          Upload from Gallery
        </button>

        <input
          id="galleryInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          onClick={() => {
            setImageBase64("");
            setPlantDetails(null);
            setPlantToken(null);
            setShowWebcam(true);
          }}
        >
          Take a Photo
        </button>
      </div>

      {showWebcam && (
        <div className="preview-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: useFrontCamera ? "user" : "environment",
            }}
            style={{ width: "100%", maxWidth: "400px", border: "1px solid #ccc" }}
          />
          <div className="button-group">
            <button onClick={captureFromWebcam} style={{ marginTop: "10px" }}>
              Capture Photo
            </button>
            <button onClick={() => setShowWebcam(false)} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
            <button onClick={() => setUseFrontCamera((prev) => !prev)}>
              Switch Camera
            </button>
          </div>
        </div>
      )}

      {imageBase64 && (
        <div className="preview-container">
          <h2>Preview:</h2>
          <img
            src={imageBase64}
            alt="Selected or Captured"
            style={{ maxWidth: "300px", border: "1px solid #ccc" }}
          />
          <button onClick={identifyPlant} style={{ marginTop: "15px" }}>
            Identify Plant
          </button>
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

      {plantDetails && (
        <div id="plant-result" ref={resultRef} style={{ marginTop: "20px" }}>
          <PlantResult plantDetails={plantDetails} plantToken={plantToken} />
        </div>
      )}

      {isLoggedIn && pastIdentifications.length > 0 && (
        <div className="history-container">
          <h2>My Past Identifications</h2>
          <div className="history-grid">
            {pastIdentifications.map((plant) => (
              <div
                key={plant.accessToken}
                className="history-card"
                onClick={() => {
                  setPlantDetails(plant.details);
                  setTimeout(() => {
                    const section = document.getElementById("plant-result");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                style={{ cursor: "pointer" }}
              >
                <p><strong>{plant.details.name}</strong></p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlant(plant.accessToken);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
