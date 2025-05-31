const https = require("https");
const fs = require("fs");
const path = require("path");

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json";
const LOCAL_FILE_PATH = path.join(__dirname, "v4.json");

function fetchAndUpdate() {
  console.log("Fetching latest v4.json from GitHub...");

  https
    .get(GITHUB_RAW_URL, (response) => {
      if (response.statusCode !== 200) {
        console.error(
          `Failed to fetch data. Status code: ${response.statusCode}`
        );
        return;
      }

      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          // Validate that the data is valid JSON
          const jsonData = JSON.parse(data);

          // Write the data to the local file
          fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(jsonData, null, 2));
          console.log("Successfully updated v4.json with latest data");
        } catch (error) {
          console.error("Error processing the data:", error.message);
        }
      });
    })
    .on("error", (error) => {
      console.error("Error fetching data:", error.message);
    });
}

// Run the update
fetchAndUpdate();
