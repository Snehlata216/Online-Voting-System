// Import UUID to generate a unique ID
const { v4: uuidv4 } = require("uuid");

// Function to create custom voter ID
function generateVoterId(name) {
  const uniquePart = uuidv4().split("-")[0].toUpperCase(); // e.g., "A1B2C3D4"
  const prefix = name ? name.slice(0, 3).toUpperCase() : "VOT"; // e.g., "SNE"
  return `${prefix}-${uniquePart}`; // => "SNE-A1B2C3D4"
}

module.exports = generateVoterId;
