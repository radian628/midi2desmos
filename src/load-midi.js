import MIDIFile from "midifile";
import MIDIEvents from "midievents";

function getRanges(notes) {
  const ranges = [];

  const pressedNotes = new Map();

  for (const note of notes) {
    if (note.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON) {
      pressedNotes.set(note.param1, note);
    } else if (note.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF) {
      const startNote = pressedNotes.get(note.param1);

      const duration = note.playTime - startNote.playTime;

      // artificially shorten duration so that
      // clustered notes don't "merge" together
      note.playTime = startNote.playTime + duration * 0.8;

      ranges.push({
        startNote: startNote,
        endNote: note,
      });
    }
  }

  return ranges;
}

function getAllVoices(ranges) {
  const voices = [];

  function isBetween(x, a, b) {
    return x >= a && x <= b;
  }

  function rangeOverlap(r1, r2) {
    const start1 = r1.startNote.playTime;
    const end1 = r1.endNote.playTime;
    const start2 = r2.startNote.playTime;
    const end2 = r2.endNote.playTime;

    return (
      isBetween(start1, start2, end2) ||
      isBetween(end1, start2, end2) ||
      isBetween(start2, start1, end1) ||
      isBetween(end2, start1, end1)
    );
  }

  function insertRange(r) {
    for (const v of voices) {
      const existingNote = v.at(-1);
      if (!rangeOverlap(r, existingNote)) {
        v.push(r);
        return;
      }
    }

    voices.push([r]);
  }

  for (const r of ranges) {
    insertRange(r);
  }

  return voices;
}

function voices2desmos(voices) {
  return `V\\left(x\\right)=\\left[${voices.map((v) => {
    return `\\left\\{${v.map((range) => {
      return `${Math.round(range.startNote.playTime)}<x<${Math.round(
        range.endNote.playTime
      )}:${range.startNote.param1}`;
    })},0\\right\\}`;
  })}\\right]`;
}

function list(...inner) {
  return `\\left[${inner}\\right]`;
}

function voices2desmosFast(voices) {
  const time2index = (t) => Math.floor(t / 50);
  const timeTruncate = (t) =>
    Math.floor(((t - 50 * time2index(t)) / 50) * 254) + 1;

  return `V\\left(x\\right)=${list(
    ...voices.map((v) => {
      const regions = new Array(10000).fill(0).map((v) => []);
      let x = 0;
      for (const range of v) {
        const startRegion = time2index(range.startNote.playTime);
        const endRegion = time2index(range.endNote.playTime);
        regions[startRegion].push({
          note: range.startNote.param1,
          time: timeTruncate(range.startNote.playTime),
        });
        for (let i = startRegion + 1; i <= endRegion; i++) {
          regions[i].push({
            note: range.startNote.param1,
            time: 1,
          });
        }
        regions[endRegion].push({
          note: 0,
          time: timeTruncate(range.endNote.playTime),
        });
      }

      for (const r of regions) {
        if (r.length > 3) {
          console.log(
            "UH OH! MORE THAN THREE NOTE CHANGES IN A SINGLE REGION!"
          );
        }
      }

      let encodedRegions = regions.map((r) => {
        let encoded = 0;
        let bitshift = 0;
        for (const noteChange of r.slice(0, 3)) {
          encoded += noteChange.time * 2 ** bitshift;
          encoded += noteChange.note * 2 ** (bitshift + 8);
          bitshift += 16;
        }

        return encoded;
      });

      return `${list(encodedRegions)}\\left[x\\right]`;
    })
  )}`;
}

export async function convertMidiToDesmos(midi) {
  const midifile = new MIDIFile(midi);

  const events = midifile.getEvents();

  const ranges = getRanges(events);

  const voices = getAllVoices(ranges);

  return voices2desmosFast(voices);
}
