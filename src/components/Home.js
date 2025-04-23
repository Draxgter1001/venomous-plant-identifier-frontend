import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [useFrontCamera, setUseFrontCamera] = useState(false); // Front camera toggle
  const [isNotPlant, setIsNotPlant] = useState(false);  // Flag for non-plant images
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User authentication status
  const webcamRef = useRef(null); // Reference to webcam component
  const resultRef = useRef(null); // Reference to result display component
  const navigate = useNavigate(); // Navigation hook for routing
  const API_URL = process.env.REACT_APP_API_URL || "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/plants";

  // Check authentication status and load history on component mount
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
      const response = await fetch(`${API_URL}/identify`, {
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
        `${API_URL}/details/${result.token}`
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
        `${API_URL}/user-plants/${userEmail}`
      );
      const plants = await response.json();
      setPastIdentifications(plants);
    } catch (err) {
      console.error("Error fetching user plants:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    navigate("/login");
  }

  // Deletes a plant record from user's history
  const deletePlant = async (accessToken) => {
    try {
      const response = await fetch(
        `${API_URL}/delete/${accessToken}`,
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

      {isLoggedIn && (
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <span style={{ marginRight: "10px", fontWeight: "bold" }}>
            Logged in as: {localStorage.getItem("userEmail")}
          </span>
          <button onClick={logout} style={{ cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}

      <div className="button-group">
        {/* Upload from Gallery */}
        <button onClick={() => {
          setImageBase64(""); // Clear previous preview 
          setPlantDetails(null); // Clear previous details
          setPlantToken(null); // Clear previous token
          document.getElementById("galleryInput").click()
          }}>
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
        <button onClick={() => {
          setImageBase64("");
          setPlantDetails(null);
          setPlantToken(null);
          setShowWebcam(true); // Show webcam
        }}>
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
            <button onClicjk={() => setUseFrontCamera(prev => !prev)}>
              Switch Camera
            </button>
          </div>
        </div>
      )}

      {/* Preview Captured or Selected Image */}
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
        <div id="result-section" ref={resultRef} style={{ marginTop: "20px" }}>
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
