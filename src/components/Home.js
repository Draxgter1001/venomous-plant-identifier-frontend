import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import '../static/Home.css'
import PlantResult from "./PlantResult";

/**
Main component for plant identification featuring:
Image capture via webcam/file upload
Plant identification API integration
Display of plant details and historical records
User session management
*/

function Home() {
  const [imageBase64, setImageBase64] = useState(""); // Stores base64 of captured/uploaded image
  const [plantToken, setPlantToken] = useState(null); // Access token from identification API
  const [plantDetails, setPlantDetails] = useState(null); // Parsed plant details object
  const [pastIdentifications, setPastIdentifications] = useState([]); // User's historical identifications
  const [error, setError] = useState(null); // Error message handling
  const [showWebcam, setShowWebcam] = useState(false); // Webcam interface visibility
  const [isNotPlant, setIsNotPlant] = useState(false);  // Flag for non-plant images
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User authentication status
  const webcamRef = useRef(null); // Reference to webcam component

  // Check authentication status and load history on component mount
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
      fetchUserPlants(userEmail);
    }
  }, []);

  // Captures image from webcam and stores as base64
  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageBase64(imageSrc);
    setShowWebcam(false);
  };

  // Handles file selection from device storage
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  //  Submits image to identification API and processes response
  const identifyPlant = async () => {
    setError(null);
    setPlantDetails(null);
    setIsNotPlant(false);
  
    const userEmail = localStorage.getItem("userEmail") || null;
  
    try {
      // API call to backend identification endpoint
      const response = await fetch("https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants/identify", {
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
      
      // Handle non-plant detection
      if (result.token === "The image is not a plant!") {
        setIsNotPlant(true);
        return;
      }
  
      setPlantToken(result.token);
      
      // Fetch detailed plant information using access token
      const detailsResponse = await fetch(
        `https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants/details/${result.token}`
      );
      const details = await detailsResponse.json();
      setPlantDetails(details);
    } catch (err) {
      console.error("Error identifying plant:", err);
      setError(err.message);
    }
  };

  // Fetches user's historical plant identifications
  const fetchUserPlants = async (userEmail) => {
    try {
      const response = await fetch(
        `https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants/user-plants/${userEmail}`
      );
      const plants = await response.json();
      setPastIdentifications(plants);
    } catch (err) {
      console.error("Error fetching user plants:", err);
    }
  };

  // Deletes a plant record from user's history
  const deletePlant = async (accessToken) => {
    try {
      const response = await fetch(
        `https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants/delete/${accessToken}`,
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

      {/* Identification Trigger */}
      {imageBase64 && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={identifyPlant}>Identify Plant</button>
        </div>
      )}

      {/* System Messages */}
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

      {/* Results Display */}
      {plantDetails && (
        <div style={{ marginTop: "20px" }}>
          <PlantResult plantDetails={plantDetails} plantToken={plantToken} />
        </div>
      )}

      {/* Historical Records */}
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
