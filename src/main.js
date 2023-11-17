import { convertMidiToDesmos } from "./load-midi.js";

const input = document.getElementById("input");
const output = document.getElementById("output");

input.addEventListener("change", async (e) => {
  const file = input.files[0];
  const str = await convertMidiToDesmos(await file.arrayBuffer());
  output.value = str;
});
