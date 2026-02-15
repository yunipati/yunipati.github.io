const fs = require('fs');
const path = require('path');

// Configuration
const sourceFolder = process.argv[2] || './json-files'; // Default folder, can be overridden via command line
const outputFile = 'ideas.json';

// Fields to extract from each JSON file
const fieldsToExtract = ['title', 'textContent', 'labels'];

/**
 * Extracts specified fields from an object
 */
function extractFields(obj) {
  const extracted = {};
  fieldsToExtract.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      extracted[field] = obj[field];
    }
  });
  return extracted;
}

/**
 * Main function to combine all JSON files
 */
function combineJsonFiles() {
  try {
    // Check if source folder exists
    if (!fs.existsSync(sourceFolder)) {
      console.error(`Error: Folder "${sourceFolder}" does not exist`);
      process.exit(1);
    }

    // Read all files in the folder
    const files = fs.readdirSync(sourceFolder);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in "${sourceFolder}"`);
    }

    const combinedArray = [];

    // Process each JSON file
    jsonFiles.forEach(file => {
      try {
        const filePath = path.join(sourceFolder, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        // Handle both single objects and arrays
        if (Array.isArray(jsonData)) {
          jsonData.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              combinedArray.push(extractFields(item));
            }
          });
        } else if (typeof jsonData === 'object' && jsonData !== null) {
          combinedArray.push(extractFields(jsonData));
        }

        console.log(`✓ Processed: ${file}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    });

    // Write combined array to ideas.json
    fs.writeFileSync(outputFile, JSON.stringify(combinedArray, null, 2));
    console.log(`\n✓ Successfully created ${outputFile} with ${combinedArray.length} items`);

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
combineJsonFiles();
