export const CATEGORY_COLOR = {
  Strategy: "#d62bdc",
  Family: "#43A047",
  Party: "#FB8C00",
  "Card Game": "#3949AB",
  Cooperative: "#00897B",
  Abstract: "#8E24AA",
  Eurogame: "#546E7A",
  "War Game": "#C62828",
  "Dungeon Crawler": "#5D4037",
  Dexterity: "#FDD835",
  Trivia: "#1E88E5",
};

export function categoryColor(category) {
  return CATEGORY_COLOR[category] || "#9E9E9E";
}
