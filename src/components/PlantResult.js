import "../static/PlantResult.css"; 

function PlantResult({ plantDetails, plantToken }) {
    if (!plantDetails) return null;
  
    const isToxic = plantDetails.toxicity && !plantDetails.toxicity.toLowerCase().includes("non-toxic");
  
    return (
      <div className="plant-card">
        <h2 className={`toxicity-status ${isToxic ? "toxic" : "non-toxic"}`}>
          {isToxic ? "⚠️ Toxic Plant" : "✅ Non-Toxic Plant"}
        </h2>
  
        <div className="plant-info">
          <p><strong>Name:</strong> {plantDetails.name}</p>
          <p><strong>Common Names:</strong> {plantDetails.common_names.join(", ")}</p>
          <p><strong>URL:</strong> <a href={plantDetails.url} target="_blank" rel="noopener noreferrer">{plantDetails.url}</a></p>
          <p><strong>Description:</strong> {plantDetails.description}</p>
          <p><strong>Synonyms:</strong> {plantDetails.synonyms.join(", ")}</p>
          <p><strong>Toxicity:</strong> {plantDetails.toxicity}</p>
          
          <img src={plantDetails.image} alt={plantDetails.name} className="plant-image" />
        </div>
      </div>
    );
  }
  
  export default PlantResult;