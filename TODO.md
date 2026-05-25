# TODO

- [x] Update UI to use a single input for Number Plate (e.g., RAB301C) and optional slot display (remove/ignore manual slot field)
- [x] Update `script.js` to auto-assign the first free slot when parking
- [x] Update validation so non-numeric content is never treated as slot number
- [x] Keep remove flow unchanged (remove by number plate)
- [ ] Quick manual test scenarios:
  - [ ] Park RAB301C into empty park -> success + slot shows assigned number
  - [ ] Park again with same plate -> shows already parked
  - [ ] Fill all 50 slots -> shows FULL
  - [ ] Remove car by RAB301C -> frees slot and billing still works

