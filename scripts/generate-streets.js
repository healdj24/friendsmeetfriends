#!/usr/bin/env node
/**
 * Pre-generates static street data for NYC from OpenStreetMap.
 * Run with: node scripts/generate-streets.js
 *
 * This fetches all NYC streets once and saves them with pre-computed
 * classifications (beginner/intermediate/expert) so the map loads instantly.
 */

const fs = require('fs');
const path = require('path');

// ========== CLASSIFICATION RULES (same as page.tsx) ==========
const PRIME_PATTERNS = [
  'ALLEY', 'MEWS', 'PLACE', 'SLIP', 'COURT', 'ROW', 'LANE', 'WAY',
  'GAY STREET', 'COMMERCE STREET', 'WEEHAWKEN STREET', 'JONES STREET',
  'CORNELIA STREET', 'MINETTA', 'PATCHIN PLACE', 'MILLIGAN PLACE',
  'WASHINGTON MEWS', 'MACDOUGAL ALLEY', 'GROVE COURT',
  'STUYVESANT STREET', 'EXTRA PLACE', 'GREAT JONES ALLEY', 'SHINBONE ALLEY',
  'FREEMAN ALLEY', 'RIVINGTON',
  'STAPLE STREET', 'CORTLANDT ALLEY', 'COLLISTER STREET', 'LAIGHT STREET',
  'HUBERT STREET', 'BEACH STREET', 'ERICSSON PLACE', 'HARRISON STREET',
  'VESTRY STREET', 'DESBROSSES STREET', 'WATTS STREET',
  'SHUBERT ALLEY', 'POMANDER WALK',
  'HENDERSON PLACE',
];

const AVOID_PATTERNS = [
  'BROADWAY', 'AVENUE OF THE AMERICAS', '6TH AVENUE', '7TH AVENUE',
  'VARICK STREET', 'WEST STREET', 'WEST END AVENUE',
  '1ST AVENUE', '2ND AVENUE', '3RD AVENUE', 'LEXINGTON AVENUE',
  'PARK AVENUE', 'MADISON AVENUE', '5TH AVENUE', '8TH AVENUE',
  '9TH AVENUE', '10TH AVENUE', '11TH AVENUE', '12TH AVENUE',
  'AMSTERDAM AVENUE', 'COLUMBUS AVENUE', 'CENTRAL PARK WEST',
  'AVENUE A', 'AVENUE B', 'AVENUE C', 'AVENUE D',
  'BOWERY', 'LAFAYETTE STREET', 'CENTRE STREET', 'ALLEN STREET',
  'ESSEX STREET', 'ELDRIDGE STREET', 'CHRYSTIE STREET',
  'FDR DRIVE', 'HENRY HUDSON',
  '14TH STREET', '23RD STREET', '34TH STREET', '42ND STREET',
  '57TH STREET', '72ND STREET', '79TH STREET', '86TH STREET',
  '96TH STREET', '110TH STREET', '125TH STREET',
  'CANAL STREET', 'CHAMBERS STREET', 'HOUSTON STREET',
  'DELANCEY STREET', 'GRAND STREET', 'WORTH STREET',
  'CHURCH STREET', 'GREENWICH STREET', 'TRINITY PLACE',
  'WATER STREET', 'SOUTH STREET', 'FULTON STREET', 'WALL STREET',
];

const STREET_ALIASES = {
  'AVENUE OF THE AMERICAS': '6 AVENUE',
  'SIXTH AVENUE': '6 AVENUE',
  'AVE OF THE AMERICAS': '6 AVENUE',
  'FASHION AVENUE': '7 AVENUE',
  'ADAM CLAYTON POWELL JR BOULEVARD': '7 AVENUE',
  'ADAM CLAYTON POWELL BOULEVARD': '7 AVENUE',
  'FREDERICK DOUGLASS BOULEVARD': '8 AVENUE',
  'CENTRAL PARK WEST': '8 AVENUE',
  'COLUMBUS AVENUE': '9 AVENUE',
  'AMSTERDAM AVENUE': '10 AVENUE',
  'WEST END AVENUE': '11 AVENUE',
  'PARK AVENUE SOUTH': 'PARK AVENUE',
  'FOURTH AVENUE': 'PARK AVENUE',
  '4 AVENUE': 'PARK AVENUE',
  'LEXINGTON AVE': 'LEXINGTON AVENUE',
  'MADISON AVE': 'MADISON AVENUE',
  'MALCOLM X BOULEVARD': 'LENOX AVENUE',
  'LENOX AVE': 'LENOX AVENUE',
  'ST NICHOLAS AVENUE': 'SAINT NICHOLAS AVENUE',
  'SAINT MARKS PLACE': 'SAINT MARKS PLACE',
  'ST MARKS PLACE': 'SAINT MARKS PLACE',
};

function classify(name) {
  const n = (name || '').toUpperCase();
  if (AVOID_PATTERNS.some(p => n.includes(p) || n === p)) return 'avoid';
  if (PRIME_PATTERNS.some(p => n.includes(p) || n === p)) return 'prime';
  return 'good';
}

function normalizeStreetName(name) {
  let n = (name || '').toUpperCase().trim();
  n = n.replace(/\s+(SOUTH|NORTH|EAST|WEST)$/g, '');
  n = n.replace(/^N\b\.?\s*/g, 'NORTH ');
  n = n.replace(/^S\b\.?\s*/g, 'SOUTH ');
  n = n.replace(/^E\b\.?\s*/g, 'EAST ');
  n = n.replace(/^W\b\.?\s*/g, 'WEST ');

  const numberWords = {
    'FIRST': '1', 'SECOND': '2', 'THIRD': '3', 'FOURTH': '4', 'FIFTH': '5',
    'SIXTH': '6', 'SEVENTH': '7', 'EIGHTH': '8', 'NINTH': '9', 'TENTH': '10',
    'ELEVENTH': '11', 'TWELFTH': '12', 'THIRTEENTH': '13', 'FOURTEENTH': '14',
    'FIFTEENTH': '15', 'SIXTEENTH': '16', 'SEVENTEENTH': '17', 'EIGHTEENTH': '18',
    'NINETEENTH': '19', 'TWENTIETH': '20',
  };
  Object.entries(numberWords).forEach(([word, digit]) => {
    n = n.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  n = n.replace(/\bST\b\.?/g, 'STREET');
  n = n.replace(/\bAVE?\b\.?/g, 'AVENUE');
  n = n.replace(/\bBLVD\b\.?/g, 'BOULEVARD');
  n = n.replace(/\bPL\b\.?/g, 'PLACE');
  n = n.replace(/\bDR\b\.?/g, 'DRIVE');
  n = n.replace(/\bRD\b\.?/g, 'ROAD');
  n = n.replace(/\bCT\b\.?/g, 'COURT');
  n = n.replace(/\bLN\b\.?/g, 'LANE');
  n = n.replace(/\bPKWY\b\.?/g, 'PARKWAY');
  n = n.replace(/\bSQ\b\.?/g, 'SQUARE');
  n = n.replace(/(\d+)(ST|ND|RD|TH)\b/g, '$1');
  n = n.replace(/[.,'-]/g, '');
  n = n.replace(/\s+/g, ' ').trim();

  if (STREET_ALIASES[n]) {
    n = STREET_ALIASES[n];
  }
  return n;
}

async function generateStreetData() {
  console.log('Fetching NYC streets from Overpass API...');
  console.log('This may take 2-5 minutes...\n');

  // NYC bounding box (all 5 boroughs)
  const bbox = '40.49,-74.26,40.92,-73.70';

  const query = `[out:json][timeout:600];
    way["highway"]["name"](${bbox});
    out geom;`;

  const startTime = Date.now();

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass API returned ${response.status}`);
  }

  const data = await response.json();
  console.log(`Fetched ${data.elements.length} way elements in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);

  // Group by normalized name and pre-classify
  const streets = {};

  data.elements.forEach(way => {
    if (!way.tags?.name || !way.geometry || way.geometry.length === 0) return;

    const name = way.tags.name;
    const normalizedName = normalizeStreetName(name);
    // Round to 5 decimal places (~1 meter accuracy, saves lots of bytes)
    const coords = way.geometry.map(p => [
      Math.round(p.lat * 100000) / 100000,
      Math.round(p.lon * 100000) / 100000
    ]);

    if (!streets[normalizedName]) {
      streets[normalizedName] = {
        n: name,                    // display name
        k: normalizedName,          // normalized key (for plow matching)
        p: classify(name),          // priority: 'prime' | 'good' | 'avoid'
        s: [],                      // segments
      };
    }

    // Add segment (just coords, no ID needed for display)
    streets[normalizedName].s.push(coords);
  });

  // Convert to array for smaller JSON
  const streetArray = Object.values(streets);

  // Stats
  const primeCount = streetArray.filter(s => s.p === 'prime').length;
  const goodCount = streetArray.filter(s => s.p === 'good').length;
  const avoidCount = streetArray.filter(s => s.p === 'avoid').length;
  const totalSegments = streetArray.reduce((sum, s) => sum + s.s.length, 0);

  console.log('Classification stats:');
  console.log(`  Beginner (prime): ${primeCount}`);
  console.log(`  Intermediate (good): ${goodCount}`);
  console.log(`  Expert (avoid): ${avoidCount}`);
  console.log(`  Total streets: ${streetArray.length}`);
  console.log(`  Total segments: ${totalSegments}\n`);

  // Write to public folder
  const outputPath = path.join(__dirname, '..', 'public', 'data', 'nyc-streets.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    generated: new Date().toISOString(),
    stats: {
      streets: streetArray.length,
      segments: totalSegments,
      prime: primeCount,
      good: goodCount,
      avoid: avoidCount,
    },
    streets: streetArray,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output));

  const fileSizeBytes = fs.statSync(outputPath).size;
  const fileSizeMB = (fileSizeBytes / 1024 / 1024).toFixed(2);

  console.log(`Written to: ${outputPath}`);
  console.log(`File size: ${fileSizeMB} MB`);
  console.log('\nDone! The map will now load instantly from this static file.');
}

// Also generate traffic control data (stop signs & traffic lights)
async function generateTrafficControl() {
  console.log('\nFetching stop signs and traffic lights...');

  // NYC bounding box (all 5 boroughs)
  const bbox = '40.49,-74.26,40.92,-73.70';

  const query = `[out:json][timeout:600];
    (node["highway"="stop"](${bbox});node["highway"="traffic_signals"](${bbox}););
    out body;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass API returned ${response.status}`);
  }

  const data = await response.json();

  const stopSigns = [];
  const trafficLights = [];

  data.elements.forEach(node => {
    if (!node.tags?.highway) return;
    const point = [
      Math.round(node.lat * 100000) / 100000,
      Math.round(node.lon * 100000) / 100000
    ];

    if (node.tags.highway === 'stop') {
      stopSigns.push(point);
    } else if (node.tags.highway === 'traffic_signals') {
      trafficLights.push(point);
    }
  });

  console.log(`  Stop signs: ${stopSigns.length}`);
  console.log(`  Traffic lights: ${trafficLights.length}`);

  const outputPath = path.join(__dirname, '..', 'public', 'data', 'nyc-traffic.json');

  const output = {
    generated: new Date().toISOString(),
    stopSigns,
    trafficLights,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output));

  const fileSizeBytes = fs.statSync(outputPath).size;
  const fileSizeKB = (fileSizeBytes / 1024).toFixed(1);

  console.log(`Written to: ${outputPath}`);
  console.log(`File size: ${fileSizeKB} KB`);
}

// Run both
async function main() {
  try {
    await generateStreetData();
    await generateTrafficControl();
    console.log('\n All data generated successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
