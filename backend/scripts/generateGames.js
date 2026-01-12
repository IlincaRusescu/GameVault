/* backend/scripts/generateGames.js */
const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");

/**
 * BOARD GAME catalog generator
 * Output: backend/scripts/games.json
 *
 * Run (from backend/):
 *   node scripts/generateGames.js 80
 */

const CATEGORIES = [
  "Strategy",
  "Family",
  "Party",
  "Card Game",
  "Cooperative",
  "Abstract",
  "Eurogame",
  "War Game",
  "Dungeon Crawler",
  "Dexterity",
  "Trivia",
];

const MECHANICS = [
  "Worker Placement",
  "Deck Building",
  "Drafting",
  "Area Control",
  "Tile Placement",
  "Set Collection",
  "Push Your Luck",
  "Hidden Roles",
  "Roll and Write",
  "Engine Building",
  "Bluffing",
  "Cooperative Play",
];

const TAGS = [
  "quick",
  "medium",
  "long",
  "light",
  "heavy",
  "competitive",
  "cooperative",
  "beginner-friendly",
  "high-replay",
  "tactical",
];

const THEMES = [
  "Fantasy",
  "Sci-Fi",
  "Medieval",
  "Mythology",
  "Horror",
  "Nature",
  "Economic",
  "Historical",
  "Pirates",
  "Space",
  "Detective",
  "Post-Apocalyptic",
  "Steampunk",
  "Cyberpunk",
  "Farming",
  "City Building",
  "Adventure",
];

const AGE_OPTIONS = ["6+", "8+", "10+", "12+", "14+", "16+"];

/** helpers **/
function pickSome(arr, min = 1, max = 3) {
  const count = faker.number.int({ min, max });
  return faker.helpers.arrayElements(arr, count);
}

// Compat-safe unique selector (no faker.helpers.arrayUnique)
function pickSomeUnique(arr, min = 1, max = 3) {
  const target = faker.number.int({ min, max });
  const out = new Set();
  let guard = 0;

  while (out.size < target && guard < 50) {
    for (const item of pickSome(arr, target, target)) out.add(item);
    guard++;
  }

  return Array.from(out);
}

function makePlayers(category) {
  if (category === "Party") {
    const min = faker.number.int({ min: 3, max: 5 });
    const max = faker.number.int({ min: 8, max: 20 });
    return { min, max };
  }

  if (category === "Strategy" || category === "Eurogame") {
    const min = faker.helpers.arrayElement([1, 2]);
    const max = faker.helpers.arrayElement([4, 5]);
    return { min, max };
  }

  if (category === "Dungeon Crawler" || category === "Cooperative") {
    const min = faker.helpers.arrayElement([1, 2]);
    const max = faker.helpers.arrayElement([4, 5]);
    return { min, max };
  }

  const min = faker.helpers.arrayElement([1, 2]);
  const max = faker.number.int({ min: Math.max(min, 3), max: 8 });
  return { min, max };
}

function makePlayTime(category) {
  if (category === "Party" || category === "Dexterity") return { min: 10, max: 45 };
  if (category === "Family" || category === "Card Game") return { min: 20, max: 60 };
  if (category === "Strategy" || category === "Eurogame") return { min: 45, max: 150 };
  if (category === "Dungeon Crawler") return { min: 90, max: 240 };
  if (category === "War Game") return { min: 120, max: 360 };
  return { min: 30, max: 90 };
}

function makeComplexity(category) {
  if (category === "Party" || category === "Family" || category === "Dexterity") {
    return Number(faker.number.float({ min: 1.0, max: 2.4, fractionDigits: 1 }));
  }
  if (category === "Strategy" || category === "Eurogame") {
    return Number(faker.number.float({ min: 2.5, max: 4.2, fractionDigits: 1 }));
  }
  if (category === "War Game") {
    return Number(faker.number.float({ min: 3.2, max: 4.9, fractionDigits: 1 }));
  }
  if (category === "Dungeon Crawler") {
    return Number(faker.number.float({ min: 2.5, max: 4.6, fractionDigits: 1 }));
  }
  return Number(faker.number.float({ min: 1.8, max: 3.8, fractionDigits: 1 }));
}

function makeName() {
  const patterns = [
    () => `${faker.word.adjective({ strategy: "closest" })} ${faker.word.noun({ strategy: "closest" })}`,
    () => `${faker.word.noun({ strategy: "closest" })} of ${faker.location.city()}`,
    () => `${faker.word.adjective({ strategy: "closest" })} Realms`,
    () => `${faker.word.noun({ strategy: "closest" })}: ${faker.word.verb({ strategy: "closest" })}`,
    () => `${faker.location.city()} Chronicles`,
  ];
  return faker.helpers.arrayElement(patterns)();
}

function makeShortDescription(category) {
  const common = [
    "A strategic board game with meaningful choices and strong replayability.",
    "Easy to learn, hard to master — perfect for repeat plays.",
    "A tense experience where every decision matters.",
    "A great pick for game nights with friends and family.",
  ];

  const byCategory = {
    Party: [
      "Fast, loud, and chaotic — ideal for big groups.",
      "Quick rounds and hilarious moments every time.",
    ],
    Cooperative: [
      "Work together to overcome the game’s challenges.",
      "A cooperative adventure with tense teamwork decisions.",
    ],
    "Dungeon Crawler": [
      "An epic adventure with heroes, loot, and tough enemies.",
      "Explore, fight, level up — a full campaign experience.",
    ],
    Eurogame: [
      "Optimize your strategy and build an efficient engine.",
      "Tight decisions, low luck — pure strategy satisfaction.",
    ],
    "War Game": [
      "A deep tactical conflict with meaningful positioning.",
      "High strategy and long-term planning on the battlefield.",
    ],
  };

  const pool = byCategory[category] ? [...common, ...byCategory[category]] : common;
  return faker.helpers.arrayElement(pool);
}

function makeGame(index) {
  const category = faker.helpers.arrayElement(CATEGORIES);
  const players = makePlayers(category);
  const playTime = makePlayTime(category);
  const complexity = makeComplexity(category);

  const mechanics = pickSomeUnique(MECHANICS, 2, 4);
  const tags = pickSomeUnique(TAGS, 2, 4);
  const themes = pickSomeUnique(THEMES, 1, 2);

  const designers = Array.from(
    { length: faker.number.int({ min: 1, max: 2 }) },
    () => faker.person.fullName()
  );

  const languageDependence = faker.number.int({ min: 1, max: 5 });

  const ratingCount = faker.number.int({ min: 0, max: 25000 });
  const ratingAvg =
    ratingCount === 0
      ? null
      : Number(faker.number.float({ min: 6.0, max: 8.8, fractionDigits: 1 }));

  const now = new Date().toISOString();

  return {
    // ✅ sequential & deterministic ids
    // If you want padded ids: game_001, game_002 -> use padStart
    gameId: `game_${index + 1}`,
    name: makeName(),
    category,
    age: faker.helpers.arrayElement(AGE_OPTIONS),
    players,
    playTime,
    complexity,
    mechanics,
    themes,
    tags,
    publisher: faker.company.name(),
    designers,
    releaseYear: faker.number.int({ min: 1995, max: new Date().getFullYear() }),
    languageDependence,
    shortDescription: makeShortDescription(category),
    imageUrl: null,
    rating: {
      avg: ratingAvg,
      count: ratingCount,
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function generateGames(count = 50) {
  const games = [];
  for (let i = 0; i < count; i++) {
    games.push(makeGame(i));
  }

  // ensure unique names (append number if duplicates happen)
  const seen = new Map();
  for (const g of games) {
    const key = g.name.toLowerCase();
    const n = (seen.get(key) || 0) + 1;
    seen.set(key, n);
    if (n > 1) g.name = `${g.name} ${n}`;
  }

  return games;
}

(async () => {
  const count = Number(process.argv[2] || 60);
  const games = await generateGames(count);

  const outPath = path.join(__dirname, "games.json");
  fs.writeFileSync(outPath, JSON.stringify(games, null, 2), "utf8");

  console.log(`Generated ${games.length} board games -> ${outPath}`);
})();
