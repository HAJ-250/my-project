# SmartPark - Time & Space Complexity (Array-based)

Assume `N` = parking capacity (N = 50).

## Data structure
- Fixed array `slots` of size `N`.
  - Each occupied index holds a car token: `{ numberPlate, entryTimeMs }`.
  - Empty slots are `null`.

## Operations
### 1) Check whether parking is full
- Implementation: scan `slots` for any `null`.
- Time complexity: **O(N)** (worst case)
- Space complexity: **O(1)** extra

### 2) Enter (park) a car
- If a slot is requested:
  - Validate requested slot index: **O(1)**
  - Check if empty: **O(1)**
- If you choose first free slot:
  - Scan for `null`: **O(N)**
- Worst-case time complexity: **O(N)**
- Space complexity: **O(1)** extra

### 3) Remove (exit) a car
- Find the car token by scanning slots for matching `numberPlate`:
  - Time: **O(N)**
- Billing computation after found:
  - Time: **O(1)**
- Freeing the slot:
  - Time: **O(1)**
- Space: **O(1)** extra

### 4) Traverse all cars
- Traverse all indices 0..N-1 and render occupied tokens.
- Time complexity: **O(N)**
- Space complexity: **O(1)** extra (excluding output)

## Test findings (time & space) — sample empirical checks

> Note: The implementation is array-based with capacity N=50. Exact timings vary by machine/browser, so results below focus on *relative behavior* and *consistency with the expected linear scans*.

### Test method used
1. Open `index.html` in a browser.
2. Run a small script manually (or via devtools console) that performs:
   - Park cars until full (50 inserts)
   - Traverse (render table)
   - Remove one car (by plate)
   - Traverse again
3. Record relative time using either:
   - `console.time('opName')` / `console.timeEnd('opName')`, or
   - the browser devtools “Performance” tab (coarse comparison).

### Complexity expectations per scenario
Let N be the parking capacity (50).

| Scenario | What happens in code | Expected time | Expected extra space |
|---|---|---|---|
| Park 1 car into non-full park | find first empty + constant work | O(N) worst-case, typically less than full scan | O(1) |
| Park cars until full | repeated scans to find empty slots | O(N^2) over the whole filling process (because each insert may scan) | O(1) |
| Check parking full | scan for any `null` | O(N) | O(1) |
| Traverse all cars | scan all slots for non-null | O(N) | O(1) excluding UI output |
| Remove a car | scan for matching plate | O(N) | O(1) |

### Observed/expected results (relative)
- **As N fills up**, the cost of `parkCar()` increases because `findFirstEmptySlotIndex()` must scan more indices before finding `null`.
- **`checkParkingFull()` scales linearly** with N: when all slots are occupied, it must inspect every slot.
- **`displayCars()` traversal time** grows roughly linearly with occupied slots because it iterates over all N indices.
- **Removing a car** shows linear behavior because it searches for the plate using a full scan.

### Space usage summary
- Data structure: `slots` array of size N=50.
- Each occupied slot holds a small token object: `{ numberPlate, entryTimeMs, slotNumber }`.
- Therefore:
  - **Asymptotic extra space** for operations is **O(1)** (beyond stored tokens).
  - Total stored tokens across all cars is **O(N)** in the worst case.

These complexities and observed behaviors match the required array-based approach.


