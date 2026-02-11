const STORAGE_KEY = "algomaker-flow";

const state = {
  blocks: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
};

const flowList = document.getElementById("flowList");
const blockType = document.getElementById("blockType");
const pseudoCode = document.getElementById("pseudoCode");
const blockTemplate = document.getElementById("blockTemplate");

const typeLabels = {
  start: "START",
  input: "INPUT",
  process: "PROCESS",
  decision: "IF",
  output: "OUTPUT",
  end: "END",
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.blocks));
}

function addBlock(type) {
  const defaults = {
    start: "Inizio algoritmo",
    input: "Leggi valore",
    process: "Esegui operazione",
    decision: "condizione",
    output: "Mostra risultato",
    end: "Fine algoritmo",
  };

  state.blocks.push({ type, text: defaults[type] || "Nuovo blocco" });
  saveState();
  render();
}

function clearBlocks() {
  state.blocks = [];
  saveState();
  render();
}

function removeBlock(index) {
  state.blocks.splice(index, 1);
  saveState();
  render();
}

function moveBlock(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.blocks.length) return;
  [state.blocks[index], state.blocks[target]] = [state.blocks[target], state.blocks[index]];
  saveState();
  render();
}

function updateText(index, text) {
  state.blocks[index].text = text;
  saveState();
  renderPseudoCode();
}

function renderFlow() {
  flowList.innerHTML = "";

  state.blocks.forEach((block, index) => {
    const item = blockTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".badge").textContent = typeLabels[block.type] || block.type;

    const input = item.querySelector(".block-label");
    input.value = block.text;
    input.addEventListener("change", (event) => updateText(index, event.target.value));

    item.querySelector('[data-action="up"]').addEventListener("click", () => moveBlock(index, -1));
    item.querySelector('[data-action="down"]').addEventListener("click", () => moveBlock(index, 1));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => removeBlock(index));

    flowList.appendChild(item);
  });
}

function renderPseudoCode() {
  if (state.blocks.length === 0) {
    pseudoCode.textContent = "// Aggiungi un blocco per iniziare";
    return;
  }

  const lines = [];

  state.blocks.forEach((block) => {
    switch (block.type) {
      case "start":
        lines.push("BEGIN");
        break;
      case "input":
        lines.push(`READ ${block.text}`);
        break;
      case "process":
        lines.push(block.text);
        break;
      case "decision":
        lines.push(`IF (${block.text}) THEN`);
        lines.push("  // ...");
        lines.push("END IF");
        break;
      case "output":
        lines.push(`PRINT ${block.text}`);
        break;
      case "end":
        lines.push("END");
        break;
      default:
        lines.push(block.text);
    }
  });

  pseudoCode.textContent = lines.join("\n");
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state.blocks, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "algoritmo.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("Formato non valido");
      state.blocks = parsed
        .filter((item) => item && typeof item.type === "string" && typeof item.text === "string")
        .map((item) => ({ type: item.type, text: item.text }));
      saveState();
      render();
    } catch {
      alert("JSON non valido");
    }
  };
  reader.readAsText(file);
}

function render() {
  renderFlow();
  renderPseudoCode();
}

document.getElementById("addBlockBtn").addEventListener("click", () => addBlock(blockType.value));
document.getElementById("clearBtn").addEventListener("click", clearBlocks);
document.getElementById("saveJsonBtn").addEventListener("click", exportJSON);

document.getElementById("importJsonInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importJSON(file);
  event.target.value = "";
});

render();
