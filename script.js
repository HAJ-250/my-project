// SmartPark Parking Management System
// Data structure + algorithm in JavaScript

// SmartPark Parking Management System
// Array-based car park (max 50 slots)

const maxCars = 50;

// Fixed-size array representing parking slots.
// slots[i] = null OR token: { numberPlate: string, entryTimeMs: number, slotNumber: number }
const slots = new Array(maxCars).fill(null);

// Find the first empty slot (1..50 shown to user)
function findFirstEmptySlotIndex() {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === null) return i;
  }
  return null;
}

function formatTime(ms) {
  return new Date(ms).toLocaleString();
}

// UI helper: show whether parking is full
function checkParkingFull() {
  const statusEl = document.getElementById("status");
  statusEl.className = "show";
  if (isFull()) {
    statusEl.classList.add("danger");
    statusEl.textContent = "Parking is FULL!";
  } else {
    statusEl.classList.add("info");
    statusEl.textContent = "Parking has available slots.";
  }
}


// O(N) worst-case: scan for any empty slot
function isFull() {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === null) return false;
  }
  return true;
}

function isPlateAlreadyParked(plate) {
  for (let i = 0; i < slots.length; i++) {
    const token = slots[i];
    if (token && token.numberPlate === plate) return true;
  }
  return false;
}

// Enter cars into the car park
function parkCar() {
  const plate = document.getElementById("plate").value.trim();

  document.getElementById("receipt").textContent = "";
  document.getElementById("billingDetails").textContent = "";

  if (plate === "") {
    alert("Enter number plate");
    return;
  }

  if (isPlateAlreadyParked(plate)) {
    const statusEl = document.getElementById("status");
    statusEl.className = "show danger";
    statusEl.textContent = "This number plate is already parked.";
    return;

  }

  if (isFull()) {
    const statusEl = document.getElementById("status");
    statusEl.className = "show danger";
    statusEl.textContent = "Parking is FULL!";
    return;
  }

  // Auto-assign the first empty slot
  const idx = findFirstEmptySlotIndex();
  if (idx === null) {
    const statusEl = document.getElementById("status");
    statusEl.className = "show danger";
    statusEl.textContent = "Parking is FULL!";
    return;
  }


  const nowMs = Date.now();
  slots[idx] = {
    numberPlate: plate,
    entryTimeMs: nowMs,
    slotNumber: idx + 1
  };

  document.getElementById("status").className = "show success";
  document.getElementById("status").textContent = "Car parked successfully.";
  displayCars();

  const receiptWrap = document.getElementById("receiptWrap");
  if (receiptWrap) receiptWrap.classList.remove("show");


  document.getElementById("plate").value = "";
}

// Exit: remove car from the car park and update its status + bill
function removeCar() {
  const removePlate = document.getElementById("removePlate").value.trim();

  if (removePlate === "") {
    alert("Enter number plate to remove");
    return;
  }

  document.getElementById("receipt").textContent = "";
  document.getElementById("billingDetails").textContent = "";

  // Find car by plate (linear traversal)
  let foundIdx = -1;
  for (let i = 0; i < slots.length; i++) {
    const token = slots[i];
    if (token && token.numberPlate === removePlate) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx === -1) {
    const statusEl = document.getElementById("status");
    statusEl.className = "show danger";
    statusEl.textContent = "Car not found.";
    return;
  }


  const token = slots[foundIdx];
  const exitMs = Date.now();

  // Pricing rules:
  // - First billed hour: 500 Rwf/hour (covers any duration up to and including 1 hour)
  // - Extra billed hours (when time exceeds 1 hour): 300 Rwf per extra hour
  // Billing model:
  // - totalHours = ceil(durationHours) (always at least 1)
  // - extraHours = max(0, totalHours - 1)

  const durationMs = exitMs - token.entryTimeMs;
  const durationHours = durationMs / (1000 * 60 * 60);
  const totalHours = Math.max(1, Math.ceil(durationHours));

  const baseRate = 500;
  const extraRate = 300;

  const extraHours = Math.max(0, totalHours - 1);
  const totalAmount = baseRate + extraRate * extraHours;

  const extraBreakdown = `Base (500) + ${extraHours} extra hour(s) * 300 = ${totalAmount} Rwf`;

  // Data structure update (free the slot)
  slots[foundIdx] = null;

  const statusEl = document.getElementById("status");
  statusEl.className = "show success";
  statusEl.textContent = "Car removed successfully.";

  document.getElementById("receipt").textContent =

    `Receipt / Token Update\n` +
    `Number Plate: ${token.numberPlate}\n` +
    `Slot Released: ${token.slotNumber}\n` +
    `Entry Time: ${formatTime(token.entryTimeMs)}\n` +
    `Exit Time: ${formatTime(exitMs)}\n` +
    `Parking Duration (hours, rounded up): ${totalHours}\n` +
    `Extra Hours (time exceeds 1 hour): ${extraHours}\n` +
    `Amount: ${totalAmount} Rwf\n` +
    `Breakdown: ${extraBreakdown}`;

  // Summary line on the interface
  document.getElementById("billingDetails").textContent =
    `Exit at ${formatTime(exitMs)}. ${extraBreakdown}.`;

  displayCars();
  syncTraversalIfActive();
  document.getElementById("removePlate").value = "";
}


function renderSummary(){
  const occupied = slots.filter(Boolean).length;
  const available = maxCars - occupied;

  const occupancyText = document.getElementById("occupancyText");
  const occupiedValue = document.getElementById("occupiedValue");
  const availableValue = document.getElementById("availableValue");

  if (occupancyText) occupancyText.textContent = `Occupied: ${occupied}/${maxCars}`;
  if (occupiedValue) occupiedValue.textContent = String(occupied);
  if (availableValue) availableValue.textContent = String(available);
}

// -----------------------
// Traverse-by-Plate logic
// -----------------------

let traverseIndices = null; // array of slot indices in traversal order
let traversePos = 0; // pointer into traverseIndices
let traverseStartPlate = "";

function getTraversalIndicesFromStart(startIdx) {
  // Build a cyclic order over the full slot array, skipping empty slots.
  // Start at startIdx, then move +1 each step, wrap around.
  const indices = [];
  const seen = new Set();

  for (let step = 0; step < slots.length; step++) {
    const idx = (startIdx + step) % slots.length;
    const token = slots[idx];
    if (!token) continue;
    if (seen.has(idx)) continue;
    seen.add(idx);
    indices.push(idx);
  }

  return indices;
}

function findCarIndexByPlate(plate) {
  for (let i = 0; i < slots.length; i++) {
    const token = slots[i];
    if (token && token.numberPlate === plate) return i;
  }
  return -1;
}

function renderTraversalOutput() {
  const out = document.getElementById("traverseOutput");
  if (!out) return;

  if (!traverseIndices || traverseIndices.length === 0) {
    out.textContent = "No parked cars to traverse.";
    return;
  }

  // If traversal was started from a plate that is no longer parked,
  // re-sync traversal order so Next/Prev doesn't get stuck.
  const startIdx = findCarIndexByPlate(traverseStartPlate);
  if (startIdx === -1) {
    traverseIndices = null;
    traversePos = 0;
    traverseStartPlate = "";
    out.textContent = "Traversal ended: start plate is no longer parked.";
    return;
  }


  const idx = traverseIndices[traversePos];
  const token = slots[idx];
  if (!token) {
    // Slot became empty (car removed). Re-sync.
    syncTraversalIfActive();
    return;
  }

  const total = traverseIndices.length;
  const currentNo = traversePos + 1;

  out.textContent = `(${currentNo}/${total}) Plate: ${token.numberPlate} • Slot: ${token.slotNumber} • Entry: ${formatTime(token.entryTimeMs)}`;
}

function syncTraversalIfActive() {
  if (!traverseIndices || traverseIndices.length === 0) return;

  // Rebuild traversal order from the start plate if still parked.
  const startIdx = findCarIndexByPlate(traverseStartPlate);
  if (startIdx === -1) {
    // Start car is no longer present; end traversal.
    traverseIndices = null;
    traversePos = 0;
    traverseStartPlate = "";
    renderTraversalOutput();
    return;
  }

  traverseIndices = getTraversalIndicesFromStart(startIdx);
  traversePos = 0;
  renderTraversalOutput();
}

function startTraversalByPlate() {
  const plate = document.getElementById("traversePlate").value.trim();

  if (plate === "") {
    alert("Enter number plate to start traversal");
    return;
  }

  const startIdx = findCarIndexByPlate(plate);
  if (startIdx === -1) {
    alert("This number plate is not currently parked.");
    return;
  }

  traverseStartPlate = plate;
  traverseIndices = getTraversalIndicesFromStart(startIdx);
  traversePos = 0;

  renderTraversalOutput();
}

function traverseNext() {
  if (!traverseIndices || traverseIndices.length === 0) {
    renderTraversalOutput();
    return;
  }

  traversePos = (traversePos + 1) % traverseIndices.length;
  renderTraversalOutput();
}

function traversePrev() {
  if (!traverseIndices || traverseIndices.length === 0) {
    renderTraversalOutput();
    return;
  }

  traversePos = (traversePos - 1 + traverseIndices.length) % traverseIndices.length;
  renderTraversalOutput();
}

// -----------------------
// Traverse all occupied cars table
// -----------------------

function displayCars() {
  const tableBody = document.getElementById("carList");
  tableBody.innerHTML = "";

  let counter = 0;
  for (let i = 0; i < slots.length; i++) {
    const token = slots[i];
    if (!token) continue;

    counter++;
    tableBody.innerHTML += `
      <tr>
        <td>${counter}</td>
        <td>${token.numberPlate}</td>
        <td>${token.slotNumber}</td>
        <td>${formatTime(token.entryTimeMs)}</td>
      </tr>
    `;
  }

  renderSummary();
}

// Ensure summary is correct on load
renderSummary();



