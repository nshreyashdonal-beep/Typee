import { getNeighborhood, resolveBaseKey } from "../data/keyNeighbors";

// Grid cells, laid out as a real 3x3 compass: the key itself in the
// middle, and whichever physical neighbors sit in each direction around it.
const CELLS = ["NW", "N", "NE", "W", "CENTER", "E", "SW", "S", "SE"];

function displayLabel(label) {
  if (label === "space") return "space";
  return label.length === 1 ? label.toUpperCase() : label;
}

// Shows a small "you are here" snippet of the keyboard: the target key
// highlighted in the middle, with the keys physically around it dimmed in
// place. No finger is implied — this is purely about position, so whatever
// finger reaches it comfortably is the right one.
//
// If `wrongChar` is passed (the key the person actually pressed by
// mistake) and it happens to be one of the visible neighbors, that cell is
// picked out in the "wrong" color so the correction is visible on the grid
// itself, not just in words.
export default function KeyNeighborhood({ keyChar, wrongChar, size = "md" }) {
  const { neighbors } = getNeighborhood(keyChar);
  const byDir = Object.fromEntries(neighbors.map((n) => [n.dir, n.label]));
  // wrongChar may be a shifted symbol (e.g. "@") that isn't a key of its
  // own — resolve it to the physical base label ("2") before comparing
  // against the neighbor grid, which only ever stores base labels.
  const wrongLower = wrongChar ? resolveBaseKey(wrongChar).toLowerCase() : null;

  return (
    <div className={"compass compass-" + size}>
      {CELLS.map((cell) => {
        if (cell === "CENTER") {
          return (
            <div className="compass-cell compass-center mono" key={cell}>
              {displayLabel(keyChar === " " ? "space" : keyChar)}
            </div>
          );
        }
        const label = byDir[cell];
        const isWrong = label && label.toLowerCase() === wrongLower;
        return (
          <div
            className={"compass-cell mono " + (isWrong ? "compass-wrong" : "compass-neighbor")}
            key={cell}
          >
            {label ? displayLabel(label) : ""}
          </div>
        );
      })}
    </div>
  );
}
