var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/midifile/src/MIDIFileHeader.js
var require_MIDIFileHeader = __commonJS({
  "node_modules/midifile/src/MIDIFileHeader.js"(exports, module) {
    "use strict";
    function MIDIFileHeader(buffer) {
      let a;
      if (!buffer) {
        a = new Uint8Array(MIDIFileHeader.HEADER_LENGTH);
        a[0] = 77;
        a[1] = 84;
        a[2] = 104;
        a[3] = 100;
        a[4] = 0;
        a[5] = 0;
        a[6] = 0;
        a[7] = 6;
        a[8] = 0;
        a[9] = 1;
        a[10] = 0;
        a[11] = 1;
        a[12] = 0;
        a[13] = 192;
        this.datas = new DataView(a.buffer, 0, MIDIFileHeader.HEADER_LENGTH);
      } else {
        if (!(buffer instanceof ArrayBuffer)) {
          throw Error("Invalid buffer received.");
        }
        this.datas = new DataView(buffer, 0, MIDIFileHeader.HEADER_LENGTH);
        if (!("M" === String.fromCharCode(this.datas.getUint8(0)) && "T" === String.fromCharCode(this.datas.getUint8(1)) && "h" === String.fromCharCode(this.datas.getUint8(2)) && "d" === String.fromCharCode(this.datas.getUint8(3)))) {
          throw new Error("Invalid MIDIFileHeader : MThd prefix not found");
        }
        if (6 !== this.datas.getUint32(4)) {
          throw new Error("Invalid MIDIFileHeader : Chunk length must be 6");
        }
      }
    }
    MIDIFileHeader.HEADER_LENGTH = 14;
    MIDIFileHeader.FRAMES_PER_SECONDS = 1;
    MIDIFileHeader.TICKS_PER_BEAT = 2;
    MIDIFileHeader.prototype.getFormat = function() {
      const format = this.datas.getUint16(8);
      if (0 !== format && 1 !== format && 2 !== format) {
        throw new Error(
          "Invalid MIDI file : MIDI format (" + format + "), format can be 0, 1 or 2 only."
        );
      }
      return format;
    };
    MIDIFileHeader.prototype.setFormat = function(format) {
      if (0 !== format && 1 !== format && 2 !== format) {
        throw new Error(
          "Invalid MIDI format given (" + format + "), format can be 0, 1 or 2 only."
        );
      }
      this.datas.setUint16(8, format);
    };
    MIDIFileHeader.prototype.getTracksCount = function() {
      return this.datas.getUint16(10);
    };
    MIDIFileHeader.prototype.setTracksCount = function(n) {
      return this.datas.setUint16(10, n);
    };
    MIDIFileHeader.prototype.getTickResolution = function(tempo) {
      if (this.datas.getUint16(12) & 32768) {
        return 1e6 / (this.getSMPTEFrames() * this.getTicksPerFrame());
      }
      tempo = tempo || 5e5;
      return tempo / this.getTicksPerBeat();
    };
    MIDIFileHeader.prototype.getTimeDivision = function() {
      if (this.datas.getUint16(12) & 32768) {
        return MIDIFileHeader.FRAMES_PER_SECONDS;
      }
      return MIDIFileHeader.TICKS_PER_BEAT;
    };
    MIDIFileHeader.prototype.getTicksPerBeat = function() {
      var divisionWord = this.datas.getUint16(12);
      if (divisionWord & 32768) {
        throw new Error("Time division is not expressed as ticks per beat.");
      }
      return divisionWord;
    };
    MIDIFileHeader.prototype.setTicksPerBeat = function(ticksPerBeat) {
      this.datas.setUint16(12, ticksPerBeat & 32767);
    };
    MIDIFileHeader.prototype.getSMPTEFrames = function() {
      const divisionWord = this.datas.getUint16(12);
      let smpteFrames;
      if (!(divisionWord & 32768)) {
        throw new Error("Time division is not expressed as frames per seconds.");
      }
      smpteFrames = divisionWord & 32512;
      if (-1 === [24, 25, 29, 30].indexOf(smpteFrames)) {
        throw new Error("Invalid SMPTE frames value (" + smpteFrames + ").");
      }
      return 29 === smpteFrames ? 29.97 : smpteFrames;
    };
    MIDIFileHeader.prototype.getTicksPerFrame = function() {
      const divisionWord = this.datas.getUint16(12);
      if (!(divisionWord & 32768)) {
        throw new Error("Time division is not expressed as frames per seconds.");
      }
      return divisionWord & 255;
    };
    MIDIFileHeader.prototype.setSMTPEDivision = function(smpteFrames, ticksPerFrame) {
      if (29.97 === smpteFrames) {
        smpteFrames = 29;
      }
      if (-1 === [24, 25, 29, 30].indexOf(smpteFrames)) {
        throw new Error("Invalid SMPTE frames value given (" + smpteFrames + ").");
      }
      if (0 > ticksPerFrame || 255 < ticksPerFrame) {
        throw new Error(
          "Invalid ticks per frame value given (" + smpteFrames + ")."
        );
      }
      this.datas.setUint8(12, 128 | smpteFrames);
      this.datas.setUint8(13, ticksPerFrame);
    };
    module.exports = MIDIFileHeader;
  }
});

// node_modules/midifile/src/MIDIFileTrack.js
var require_MIDIFileTrack = __commonJS({
  "node_modules/midifile/src/MIDIFileTrack.js"(exports, module) {
    "use strict";
    function MIDIFileTrack(buffer, start) {
      let a;
      let trackLength;
      if (!buffer) {
        a = new Uint8Array(12);
        a[0] = 77;
        a[1] = 84;
        a[2] = 114;
        a[3] = 107;
        a[4] = 0;
        a[5] = 0;
        a[6] = 0;
        a[7] = 4;
        a[8] = 0;
        a[9] = 255;
        a[10] = 47;
        a[11] = 0;
        this.datas = new DataView(a.buffer, 0, MIDIFileTrack.HDR_LENGTH + 4);
      } else {
        if (!(buffer instanceof ArrayBuffer)) {
          throw new Error("Invalid buffer received.");
        }
        if (12 > buffer.byteLength - start) {
          throw new Error(
            "Invalid MIDIFileTrack (0x" + start.toString(16) + ") : Buffer length must size at least 12bytes"
          );
        }
        this.datas = new DataView(buffer, start, MIDIFileTrack.HDR_LENGTH);
        if (!("M" === String.fromCharCode(this.datas.getUint8(0)) && "T" === String.fromCharCode(this.datas.getUint8(1)) && "r" === String.fromCharCode(this.datas.getUint8(2)) && "k" === String.fromCharCode(this.datas.getUint8(3)))) {
          throw new Error(
            "Invalid MIDIFileTrack (0x" + start.toString(16) + ") : MTrk prefix not found"
          );
        }
        trackLength = this.getTrackLength();
        if (buffer.byteLength - start < trackLength) {
          throw new Error(
            "Invalid MIDIFileTrack (0x" + start.toString(16) + ") : The track size exceed the buffer length."
          );
        }
        this.datas = new DataView(
          buffer,
          start,
          MIDIFileTrack.HDR_LENGTH + trackLength
        );
        if (!(255 === this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 3)) && 47 === this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 2)) && 0 === this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 1)))) {
          throw new Error(
            "Invalid MIDIFileTrack (0x" + start.toString(16) + ") : No track end event found at the expected index (" + (MIDIFileTrack.HDR_LENGTH + (trackLength - 1)).toString(16) + ")."
          );
        }
      }
    }
    MIDIFileTrack.HDR_LENGTH = 8;
    MIDIFileTrack.prototype.getTrackLength = function() {
      return this.datas.getUint32(4);
    };
    MIDIFileTrack.prototype.setTrackLength = function(trackLength) {
      return this.datas.setUint32(4, trackLength);
    };
    MIDIFileTrack.prototype.getTrackContent = function() {
      return new DataView(
        this.datas.buffer,
        this.datas.byteOffset + MIDIFileTrack.HDR_LENGTH,
        this.datas.byteLength - MIDIFileTrack.HDR_LENGTH
      );
    };
    MIDIFileTrack.prototype.setTrackContent = function(dataView) {
      let origin;
      let destination;
      let i;
      let j;
      const trackLength = dataView.byteLength - dataView.byteOffset;
      if (4 > trackLength) {
        throw new Error("Invalid track length, must size at least 4bytes");
      }
      this.datas = new DataView(
        new Uint8Array(MIDIFileTrack.HDR_LENGTH + trackLength).buffer
      );
      this.datas.setUint8(0, 77);
      this.datas.setUint8(1, 84);
      this.datas.setUint8(2, 114);
      this.datas.setUint8(3, 107);
      this.datas.setUint32(4, trackLength);
      origin = new Uint8Array(
        dataView.buffer,
        dataView.byteOffset,
        dataView.byteLength
      );
      destination = new Uint8Array(
        this.datas.buffer,
        MIDIFileTrack.HDR_LENGTH,
        trackLength
      );
      for (i = 0, j = origin.length; i < j; i++) {
        destination[i] = origin[i];
      }
    };
    module.exports = MIDIFileTrack;
  }
});

// node_modules/midievents/src/MIDIEvents.js
var require_MIDIEvents = __commonJS({
  "node_modules/midievents/src/MIDIEvents.js"(exports, module) {
    "use strict";
    function MIDIEvents2() {
      throw new Error("MIDIEvents function not intended to be run.");
    }
    MIDIEvents2.EVENT_META = 255;
    MIDIEvents2.EVENT_SYSEX = 240;
    MIDIEvents2.EVENT_DIVSYSEX = 247;
    MIDIEvents2.EVENT_MIDI = 8;
    MIDIEvents2.EVENT_META_SEQUENCE_NUMBER = 0;
    MIDIEvents2.EVENT_META_TEXT = 1;
    MIDIEvents2.EVENT_META_COPYRIGHT_NOTICE = 2;
    MIDIEvents2.EVENT_META_TRACK_NAME = 3;
    MIDIEvents2.EVENT_META_INSTRUMENT_NAME = 4;
    MIDIEvents2.EVENT_META_LYRICS = 5;
    MIDIEvents2.EVENT_META_MARKER = 6;
    MIDIEvents2.EVENT_META_CUE_POINT = 7;
    MIDIEvents2.EVENT_META_MIDI_CHANNEL_PREFIX = 32;
    MIDIEvents2.EVENT_META_END_OF_TRACK = 47;
    MIDIEvents2.EVENT_META_SET_TEMPO = 81;
    MIDIEvents2.EVENT_META_SMTPE_OFFSET = 84;
    MIDIEvents2.EVENT_META_TIME_SIGNATURE = 88;
    MIDIEvents2.EVENT_META_KEY_SIGNATURE = 89;
    MIDIEvents2.EVENT_META_SEQUENCER_SPECIFIC = 127;
    MIDIEvents2.EVENT_MIDI_NOTE_OFF = 8;
    MIDIEvents2.EVENT_MIDI_NOTE_ON = 9;
    MIDIEvents2.EVENT_MIDI_NOTE_AFTERTOUCH = 10;
    MIDIEvents2.EVENT_MIDI_CONTROLLER = 11;
    MIDIEvents2.EVENT_MIDI_PROGRAM_CHANGE = 12;
    MIDIEvents2.EVENT_MIDI_CHANNEL_AFTERTOUCH = 13;
    MIDIEvents2.EVENT_MIDI_PITCH_BEND = 14;
    MIDIEvents2.MIDI_1PARAM_EVENTS = [
      MIDIEvents2.EVENT_MIDI_PROGRAM_CHANGE,
      MIDIEvents2.EVENT_MIDI_CHANNEL_AFTERTOUCH
    ];
    MIDIEvents2.MIDI_2PARAMS_EVENTS = [
      MIDIEvents2.EVENT_MIDI_NOTE_OFF,
      MIDIEvents2.EVENT_MIDI_NOTE_ON,
      MIDIEvents2.EVENT_MIDI_NOTE_AFTERTOUCH,
      MIDIEvents2.EVENT_MIDI_CONTROLLER,
      MIDIEvents2.EVENT_MIDI_PITCH_BEND
    ];
    MIDIEvents2.createParser = function midiEventsCreateParser(stream, startAt, strictMode) {
      var eventTypeByte;
      var event;
      var MIDIEventType;
      var MIDIEventChannel;
      var MIDIEventParam1;
      if (stream instanceof DataView) {
        stream = {
          position: startAt || 0,
          buffer: stream,
          readUint8: function() {
            return this.buffer.getUint8(this.position++);
          },
          readUint16: function() {
            var v = this.buffer.getUint16(this.position);
            this.position = this.position + 2;
            return v;
          },
          readUint32: function() {
            var v = this.buffer.getUint16(this.position);
            this.position = this.position + 2;
            return v;
          },
          readVarInt: function() {
            var v = 0;
            var i = 0;
            var b;
            while (4 > i++) {
              b = this.readUint8();
              if (b & 128) {
                v += b & 127;
                v <<= 7;
              } else {
                return v + b;
              }
            }
            throw new Error(
              "0x" + this.position.toString(16) + ": Variable integer length cannot exceed 4 bytes"
            );
          },
          readBytes: function(length) {
            var bytes = [];
            for (; 0 < length; length--) {
              bytes.push(this.readUint8());
            }
            return bytes;
          },
          pos: function() {
            return "0x" + (this.buffer.byteOffset + this.position).toString(16);
          },
          end: function() {
            return this.position === this.buffer.byteLength;
          }
        };
        startAt = 0;
      }
      if (0 < startAt) {
        while (startAt--) {
          stream.readUint8();
        }
      }
      return {
        // Read the next event
        next: function() {
          if (stream.end()) {
            return null;
          }
          event = {
            // Memoize the event index
            index: stream.pos(),
            // Read the delta time
            delta: stream.readVarInt()
          };
          eventTypeByte = stream.readUint8();
          if (240 === (eventTypeByte & 240)) {
            if (eventTypeByte === MIDIEvents2.EVENT_META) {
              event.type = MIDIEvents2.EVENT_META;
              event.subtype = stream.readUint8();
              event.length = stream.readVarInt();
              switch (event.subtype) {
                case MIDIEvents2.EVENT_META_SEQUENCE_NUMBER:
                  if (strictMode && 2 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.msb = stream.readUint8();
                  event.lsb = stream.readUint8();
                  return event;
                case MIDIEvents2.EVENT_META_TEXT:
                case MIDIEvents2.EVENT_META_COPYRIGHT_NOTICE:
                case MIDIEvents2.EVENT_META_TRACK_NAME:
                case MIDIEvents2.EVENT_META_INSTRUMENT_NAME:
                case MIDIEvents2.EVENT_META_LYRICS:
                case MIDIEvents2.EVENT_META_MARKER:
                case MIDIEvents2.EVENT_META_CUE_POINT:
                  event.data = stream.readBytes(event.length);
                  return event;
                case MIDIEvents2.EVENT_META_MIDI_CHANNEL_PREFIX:
                  if (strictMode && 1 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.prefix = stream.readUint8();
                  return event;
                case MIDIEvents2.EVENT_META_END_OF_TRACK:
                  if (strictMode && 0 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  return event;
                case MIDIEvents2.EVENT_META_SET_TEMPO:
                  if (strictMode && 3 !== event.length) {
                    throw new Error(
                      stream.pos() + " Tempo meta event length must be 3."
                    );
                  }
                  event.tempo = (stream.readUint8() << 16) + (stream.readUint8() << 8) + stream.readUint8();
                  event.tempoBPM = 6e7 / event.tempo;
                  return event;
                case MIDIEvents2.EVENT_META_SMTPE_OFFSET:
                  if (strictMode && 5 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.hour = stream.readUint8();
                  if (strictMode && 23 < event.hour) {
                    throw new Error(
                      stream.pos() + " SMTPE offset hour value must be part of 0-23."
                    );
                  }
                  event.minutes = stream.readUint8();
                  if (strictMode && 59 < event.minutes) {
                    throw new Error(
                      stream.pos() + " SMTPE offset minutes value must be part of 0-59."
                    );
                  }
                  event.seconds = stream.readUint8();
                  if (strictMode && 59 < event.seconds) {
                    throw new Error(
                      stream.pos() + " SMTPE offset seconds value must be part of 0-59."
                    );
                  }
                  event.frames = stream.readUint8();
                  if (strictMode && 30 < event.frames) {
                    throw new Error(
                      stream.pos() + " SMTPE offset frames value must be part of 0-30."
                    );
                  }
                  event.subframes = stream.readUint8();
                  if (strictMode && 99 < event.subframes) {
                    throw new Error(
                      stream.pos() + " SMTPE offset subframes value must be part of 0-99."
                    );
                  }
                  return event;
                case MIDIEvents2.EVENT_META_KEY_SIGNATURE:
                  if (strictMode && 2 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.key = stream.readUint8();
                  if (strictMode && (-7 > event.key || 7 < event.key)) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.scale = stream.readUint8();
                  if (strictMode && 0 !== event.scale && 1 !== event.scale) {
                    throw new Error(
                      stream.pos() + " Key signature scale value must be 0 or 1."
                    );
                  }
                  return event;
                case MIDIEvents2.EVENT_META_TIME_SIGNATURE:
                  if (strictMode && 4 !== event.length) {
                    throw new Error(stream.pos() + " Bad metaevent length.");
                  }
                  event.data = stream.readBytes(event.length);
                  event.param1 = event.data[0];
                  event.param2 = event.data[1];
                  event.param3 = event.data[2];
                  event.param4 = event.data[3];
                  return event;
                case MIDIEvents2.EVENT_META_SEQUENCER_SPECIFIC:
                  event.data = stream.readBytes(event.length);
                  return event;
                default:
                  if (strictMode) {
                    throw new Error(
                      stream.pos() + " Unknown meta event type (" + event.subtype.toString(16) + ")."
                    );
                  }
                  event.data = stream.readBytes(event.length);
                  return event;
              }
            } else if (eventTypeByte === MIDIEvents2.EVENT_SYSEX || eventTypeByte === MIDIEvents2.EVENT_DIVSYSEX) {
              event.type = eventTypeByte;
              event.length = stream.readVarInt();
              event.data = stream.readBytes(event.length);
              return event;
            } else {
              if (strictMode) {
                throw new Error(
                  stream.pos() + " Unknown event type " + eventTypeByte.toString(16) + ", Delta: " + event.delta + "."
                );
              }
              event.type = eventTypeByte;
              event.badsubtype = stream.readVarInt();
              event.length = stream.readUint8();
              event.data = stream.readBytes(event.length);
              return event;
            }
          } else {
            if (0 === (eventTypeByte & 128)) {
              if (!MIDIEventType) {
                throw new Error(
                  stream.pos() + " Running status without previous event"
                );
              }
              MIDIEventParam1 = eventTypeByte;
            } else {
              MIDIEventType = eventTypeByte >> 4;
              MIDIEventChannel = eventTypeByte & 15;
              MIDIEventParam1 = stream.readUint8();
            }
            event.type = MIDIEvents2.EVENT_MIDI;
            event.subtype = MIDIEventType;
            event.channel = MIDIEventChannel;
            event.param1 = MIDIEventParam1;
            switch (MIDIEventType) {
              case MIDIEvents2.EVENT_MIDI_NOTE_OFF:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents2.EVENT_MIDI_NOTE_ON:
                event.param2 = stream.readUint8();
                if (!event.param2) {
                  event.subtype = MIDIEvents2.EVENT_MIDI_NOTE_OFF;
                  event.param2 = 127;
                }
                return event;
              case MIDIEvents2.EVENT_MIDI_NOTE_AFTERTOUCH:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents2.EVENT_MIDI_CONTROLLER:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents2.EVENT_MIDI_PROGRAM_CHANGE:
                return event;
              case MIDIEvents2.EVENT_MIDI_CHANNEL_AFTERTOUCH:
                return event;
              case MIDIEvents2.EVENT_MIDI_PITCH_BEND:
                event.param2 = stream.readUint8();
                return event;
              default:
                if (strictMode) {
                  throw new Error(
                    stream.pos() + " Unknown MIDI event type (" + MIDIEventType.toString(16) + ")."
                  );
                }
                return event;
            }
          }
        }
      };
    };
    MIDIEvents2.writeToTrack = function midiEventsWriteToTrack(events, destination, strictMode) {
      var index = 0;
      var i;
      var j;
      var k;
      var l;
      for (i = 0, j = events.length; i < j; i++) {
        if (events[i].delta >>> 28) {
          throw Error(
            "Event #" + i + ": Maximum delta time value reached (" + events[i].delta + "/134217728 max)"
          );
        }
        if (events[i].delta >>> 21) {
          destination[index++] = events[i].delta >>> 21 & 127 | 128;
        }
        if (events[i].delta >>> 14) {
          destination[index++] = events[i].delta >>> 14 & 127 | 128;
        }
        if (events[i].delta >>> 7) {
          destination[index++] = events[i].delta >>> 7 & 127 | 128;
        }
        destination[index++] = events[i].delta & 127;
        if (events[i].type === MIDIEvents2.EVENT_MIDI) {
          destination[index++] = (events[i].subtype << 4) + events[i].channel;
          destination[index++] = events[i].param1;
          if (-1 !== MIDIEvents2.MIDI_2PARAMS_EVENTS.indexOf(events[i].subtype)) {
            destination[index++] = events[i].param2;
          }
        } else {
          destination[index++] = events[i].type;
          if (events[i].type === MIDIEvents2.EVENT_META) {
            destination[index++] = events[i].subtype;
          }
          if (events[i].length >>> 28) {
            throw Error(
              "Event #" + i + ": Maximum length reached (" + events[i].length + "/134217728 max)"
            );
          }
          if (events[i].length >>> 21) {
            destination[index++] = events[i].length >>> 21 & 127 | 128;
          }
          if (events[i].length >>> 14) {
            destination[index++] = events[i].length >>> 14 & 127 | 128;
          }
          if (events[i].length >>> 7) {
            destination[index++] = events[i].length >>> 7 & 127 | 128;
          }
          destination[index++] = events[i].length & 127;
          if (events[i].type === MIDIEvents2.EVENT_META) {
            switch (events[i].subtype) {
              case MIDIEvents2.EVENT_META_SEQUENCE_NUMBER:
                destination[index++] = events[i].msb;
                destination[index++] = events[i].lsb;
                break;
              case MIDIEvents2.EVENT_META_TEXT:
              case MIDIEvents2.EVENT_META_COPYRIGHT_NOTICE:
              case MIDIEvents2.EVENT_META_TRACK_NAME:
              case MIDIEvents2.EVENT_META_INSTRUMENT_NAME:
              case MIDIEvents2.EVENT_META_LYRICS:
              case MIDIEvents2.EVENT_META_MARKER:
              case MIDIEvents2.EVENT_META_CUE_POINT:
                for (k = 0, l = events[i].length; k < l; k++) {
                  destination[index++] = events[i].data[k];
                }
                break;
              case MIDIEvents2.EVENT_META_MIDI_CHANNEL_PREFIX:
                destination[index++] = events[i].prefix;
                break;
              case MIDIEvents2.EVENT_META_END_OF_TRACK:
                break;
              case MIDIEvents2.EVENT_META_SET_TEMPO:
                destination[index++] = events[i].tempo >> 16;
                destination[index++] = events[i].tempo >> 8 & 255;
                destination[index++] = events[i].tempo & 255;
                break;
              case MIDIEvents2.EVENT_META_SMTPE_OFFSET:
                if (strictMode && 23 < events[i].hour) {
                  throw new Error(
                    "Event #" + i + ": SMTPE offset hour value must be part of 0-23."
                  );
                }
                destination[index++] = events[i].hour;
                if (strictMode && 59 < events[i].minutes) {
                  throw new Error(
                    "Event #" + i + ": SMTPE offset minutes value must be part of 0-59."
                  );
                }
                destination[index++] = events[i].minutes;
                if (strictMode && 59 < events[i].seconds) {
                  throw new Error(
                    "Event #" + i + ": SMTPE offset seconds value must be part of 0-59."
                  );
                }
                destination[index++] = events[i].seconds;
                if (strictMode && 30 < events[i].frames) {
                  throw new Error(
                    "Event #" + i + ": SMTPE offset frames amount must be part of 0-30."
                  );
                }
                destination[index++] = events[i].frames;
                if (strictMode && 99 < events[i].subframes) {
                  throw new Error(
                    "Event #" + i + ": SMTPE offset subframes amount must be part of 0-99."
                  );
                }
                destination[index++] = events[i].subframes;
                break;
              case MIDIEvents2.EVENT_META_KEY_SIGNATURE:
                if ("number" != typeof events[i].key || -7 > events[i].key || 7 < events[i].scale) {
                  throw new Error(
                    "Event #" + i + ":The key signature key must be between -7 and 7"
                  );
                }
                if ("number" !== typeof events[i].scale || 0 > events[i].scale || 1 < events[i].scale) {
                  throw new Error(
                    "Event #" + i + ":The key signature scale must be 0 or 1"
                  );
                }
                destination[index++] = events[i].key;
                destination[index++] = events[i].scale;
                break;
              case MIDIEvents2.EVENT_META_TIME_SIGNATURE:
              case MIDIEvents2.EVENT_META_SEQUENCER_SPECIFIC:
              default:
                for (k = 0, l = events[i].length; k < l; k++) {
                  destination[index++] = events[i].data[k];
                }
                break;
            }
          } else {
            for (k = 0, l = events[i].length; k < l; k++) {
              destination[index++] = events[i].data[k];
            }
          }
        }
      }
    };
    MIDIEvents2.getRequiredBufferLength = function(events) {
      var bufferLength = 0;
      var i = 0;
      var j;
      for (i = 0, j = events.length; i < j; i++) {
        bufferLength += events[i].delta >>> 21 ? 4 : events[i].delta >>> 14 ? 3 : events[i].delta >>> 7 ? 2 : 1;
        if (events[i].type === MIDIEvents2.EVENT_MIDI) {
          bufferLength++;
          bufferLength++;
          if (-1 !== MIDIEvents2.MIDI_2PARAMS_EVENTS.indexOf(events[i].subtype)) {
            bufferLength++;
          }
        } else {
          bufferLength++;
          if (events[i].type === MIDIEvents2.EVENT_META) {
            bufferLength++;
          }
          bufferLength += events[i].length >>> 21 ? 4 : events[i].length >>> 14 ? 3 : events[i].length >>> 7 ? 2 : 1;
          bufferLength += events[i].length;
        }
      }
      return bufferLength;
    };
    module.exports = MIDIEvents2;
  }
});

// node_modules/utf-8/src/UTF8.js
var require_UTF8 = __commonJS({
  "node_modules/utf-8/src/UTF8.js"(exports, module) {
    module.exports = {
      isNotUTF8,
      getCharLength,
      getCharCode,
      getStringFromBytes,
      getBytesForCharCode,
      setBytesFromCharCode,
      setBytesFromString
    };
    function isNotUTF8(bytes, byteOffset, byteLength) {
      try {
        getStringFromBytes(bytes, byteOffset, byteLength, true);
      } catch (e) {
        return true;
      }
      return false;
    }
    function getCharLength(theByte) {
      if (240 == (theByte & 240)) {
        return 4;
      } else if (224 == (theByte & 224)) {
        return 3;
      } else if (192 == (theByte & 192)) {
        return 2;
      } else if (theByte == (theByte & 127)) {
        return 1;
      }
      return 0;
    }
    function getCharCode(bytes, byteOffset, charLength) {
      var charCode = 0, mask = "";
      byteOffset = byteOffset || 0;
      if (bytes.length - byteOffset <= 0) {
        throw new Error("No more characters remaining in array.");
      }
      charLength = charLength || getCharLength(bytes[byteOffset]);
      if (charLength == 0) {
        throw new Error(
          bytes[byteOffset].toString(2) + " is not a significative byte (offset:" + byteOffset + ")."
        );
      }
      if (1 === charLength) {
        return bytes[byteOffset];
      }
      if (bytes.length - byteOffset < charLength) {
        throw new Error(
          "Expected at least " + charLength + " bytes remaining in array."
        );
      }
      mask = "00000000".slice(0, charLength) + 1 + "00000000".slice(charLength + 1);
      if (bytes[byteOffset] & parseInt(mask, 2)) {
        throw Error(
          "Index " + byteOffset + ": A " + charLength + " bytes encoded char cannot encode the " + (charLength + 1) + "th rank bit to 1."
        );
      }
      mask = "0000".slice(0, charLength + 1) + "11111111".slice(charLength + 1);
      charCode += (bytes[byteOffset] & parseInt(mask, 2)) << --charLength * 6;
      while (charLength) {
        if (128 !== (bytes[byteOffset + 1] & 128) || 64 === (bytes[byteOffset + 1] & 64)) {
          throw Error(
            "Index " + (byteOffset + 1) + ': Next bytes of encoded char must begin with a "10" bit sequence.'
          );
        }
        charCode += (bytes[++byteOffset] & 63) << --charLength * 6;
      }
      return charCode;
    }
    function getStringFromBytes(bytes, byteOffset, byteLength, strict) {
      var charLength, chars = [];
      byteOffset = byteOffset | 0;
      byteLength = "number" === typeof byteLength ? byteLength : bytes.byteLength || bytes.length;
      for (; byteOffset < byteLength; byteOffset++) {
        charLength = getCharLength(bytes[byteOffset]);
        if (byteOffset + charLength > byteLength) {
          if (strict) {
            throw Error(
              "Index " + byteOffset + ": Found a " + charLength + " bytes encoded char declaration but only " + (byteLength - byteOffset) + " bytes are available."
            );
          }
        } else {
          chars.push(
            String.fromCodePoint(getCharCode(bytes, byteOffset, charLength, strict))
          );
        }
        byteOffset += charLength - 1;
      }
      return chars.join("");
    }
    function getBytesForCharCode(charCode) {
      if (charCode < 128) {
        return 1;
      } else if (charCode < 2048) {
        return 2;
      } else if (charCode < 65536) {
        return 3;
      } else if (charCode < 2097152) {
        return 4;
      }
      throw new Error("CharCode " + charCode + " cannot be encoded with UTF8.");
    }
    function setBytesFromCharCode(charCode, bytes, byteOffset, neededBytes) {
      charCode = charCode | 0;
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      neededBytes = neededBytes || getBytesForCharCode(charCode);
      if (1 == neededBytes) {
        bytes[byteOffset] = charCode;
      } else {
        bytes[byteOffset++] = (parseInt("1111".slice(0, neededBytes), 2) << 8 - neededBytes) + (charCode >>> --neededBytes * 6);
        for (; neededBytes > 0; ) {
          bytes[byteOffset++] = charCode >>> --neededBytes * 6 & 63 | 128;
        }
      }
      return bytes;
    }
    function setBytesFromString(string, bytes, byteOffset, byteLength, strict) {
      string = string || "";
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      byteLength = "number" === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
      for (var i = 0, j = string.length; i < j; i++) {
        var neededBytes = getBytesForCharCode(string[i].codePointAt(0));
        if (strict && byteOffset + neededBytes > byteLength) {
          throw new Error(
            'Not enought bytes to encode the char "' + string[i] + '" at the offset "' + byteOffset + '".'
          );
        }
        setBytesFromCharCode(
          string[i].codePointAt(0),
          bytes,
          byteOffset,
          neededBytes,
          strict
        );
        byteOffset += neededBytes;
      }
      return bytes;
    }
  }
});

// node_modules/midifile/src/MIDIFile.js
var require_MIDIFile = __commonJS({
  "node_modules/midifile/src/MIDIFile.js"(exports, module) {
    "use strict";
    var MIDIFileHeader = require_MIDIFileHeader();
    var MIDIFileTrack = require_MIDIFileTrack();
    var MIDIEvents2 = require_MIDIEvents();
    var UTF8 = require_UTF8();
    function ensureArrayBuffer(buf) {
      if (buf) {
        if (buf instanceof ArrayBuffer) {
          return buf;
        }
        if (buf instanceof Uint8Array) {
          return new Uint8Array(buf).buffer;
        }
      }
      throw new Error("Unsupported buffer type, need ArrayBuffer or Uint8Array");
    }
    function MIDIFile2(buffer, strictMode) {
      var track;
      var curIndex;
      var i;
      var j;
      if (!buffer) {
        this.header = new MIDIFileHeader();
        this.tracks = [new MIDIFileTrack()];
      } else {
        buffer = ensureArrayBuffer(buffer);
        if (25 > buffer.byteLength) {
          throw new Error(
            "A buffer of a valid MIDI file must have, at least, a size of 25bytes."
          );
        }
        this.header = new MIDIFileHeader(buffer, strictMode);
        this.tracks = [];
        curIndex = MIDIFileHeader.HEADER_LENGTH;
        for (i = 0, j = this.header.getTracksCount(); i < j; i++) {
          if (strictMode && curIndex >= buffer.byteLength - 1) {
            throw new Error(
              "Couldn't find datas corresponding to the track #" + i + "."
            );
          }
          track = new MIDIFileTrack(buffer, curIndex, strictMode);
          this.tracks.push(track);
          curIndex += track.getTrackLength() + 8;
        }
        if (strictMode && curIndex !== buffer.byteLength) {
          throw new Error("It seems that the buffer contains too much datas.");
        }
      }
    }
    MIDIFile2.prototype.getEvents = function(type, subtype) {
      var events;
      var event;
      var playTime = 0;
      var filteredEvents = [];
      var format = this.header.getFormat();
      var tickResolution = this.header.getTickResolution();
      var i;
      var j;
      var trackParsers;
      var smallestDelta;
      if (1 !== format || 1 === this.tracks.length) {
        for (i = 0, j = this.tracks.length; i < j; i++) {
          playTime = 2 === format && playTime ? playTime : 0;
          events = MIDIEvents2.createParser(
            this.tracks[i].getTrackContent(),
            0,
            false
          );
          event = events.next();
          while (event) {
            playTime += event.delta ? event.delta * tickResolution / 1e3 : 0;
            if (event.type === MIDIEvents2.EVENT_META) {
              if (event.subtype === MIDIEvents2.EVENT_META_SET_TEMPO) {
                tickResolution = this.header.getTickResolution(event.tempo);
              }
            }
            if ((!type || event.type === type) && (!subtype || event.subtype && event.subtype === subtype)) {
              event.playTime = playTime;
              filteredEvents.push(event);
            }
            event = events.next();
          }
        }
      } else {
        trackParsers = [];
        smallestDelta = -1;
        for (i = 0, j = this.tracks.length; i < j; i++) {
          trackParsers[i] = {};
          trackParsers[i].parser = MIDIEvents2.createParser(
            this.tracks[i].getTrackContent(),
            0,
            false
          );
          trackParsers[i].curEvent = trackParsers[i].parser.next();
        }
        do {
          smallestDelta = -1;
          for (i = 0, j = trackParsers.length; i < j; i++) {
            if (trackParsers[i].curEvent) {
              if (-1 === smallestDelta || trackParsers[i].curEvent.delta < trackParsers[smallestDelta].curEvent.delta) {
                smallestDelta = i;
              }
            }
          }
          if (-1 !== smallestDelta) {
            for (i = 0, j = trackParsers.length; i < j; i++) {
              if (i !== smallestDelta && trackParsers[i].curEvent) {
                trackParsers[i].curEvent.delta -= trackParsers[smallestDelta].curEvent.delta;
              }
            }
            event = trackParsers[smallestDelta].curEvent;
            playTime += event.delta ? event.delta * tickResolution / 1e3 : 0;
            if (event.type === MIDIEvents2.EVENT_META) {
              if (event.subtype === MIDIEvents2.EVENT_META_SET_TEMPO) {
                tickResolution = this.header.getTickResolution(event.tempo);
              }
            }
            if ((!type || event.type === type) && (!subtype || event.subtype && event.subtype === subtype)) {
              event.playTime = playTime;
              event.track = smallestDelta;
              filteredEvents.push(event);
            }
            trackParsers[smallestDelta].curEvent = trackParsers[smallestDelta].parser.next();
          }
        } while (-1 !== smallestDelta);
      }
      return filteredEvents;
    };
    MIDIFile2.prototype.getMidiEvents = function() {
      return this.getEvents(MIDIEvents2.EVENT_MIDI);
    };
    MIDIFile2.prototype.getLyrics = function() {
      var events = this.getEvents(MIDIEvents2.EVENT_META);
      var texts = [];
      var lyrics = [];
      var event;
      var i;
      var j;
      for (i = 0, j = events.length; i < j; i++) {
        event = events[i];
        if (event.subtype === MIDIEvents2.EVENT_META_LYRICS) {
          lyrics.push(event);
        } else if (event.subtype === MIDIEvents2.EVENT_META_TEXT) {
          if ("@" === String.fromCharCode(event.data[0])) {
            if ("T" === String.fromCharCode(event.data[1])) {
            } else if ("I" === String.fromCharCode(event.data[1])) {
            } else if ("L" === String.fromCharCode(event.data[1])) {
            }
          } else if (0 === String.fromCharCode.apply(String, event.data).indexOf("words")) {
            texts.length = 0;
          } else if (0 !== event.playTime) {
            texts.push(event);
          }
        }
      }
      if (2 < lyrics.length) {
        texts = lyrics;
      } else if (!texts.length) {
        texts = [];
      }
      try {
        texts.forEach(function(event2) {
          event2.text = UTF8.getStringFromBytes(event2.data, 0, event2.length, true);
        });
      } catch (e) {
        texts.forEach(function(event2) {
          event2.text = event2.data.map(function(c) {
            return String.fromCharCode(c);
          }).join("");
        });
      }
      return texts;
    };
    MIDIFile2.prototype.getTrackEvents = function(index) {
      var event;
      var events = [];
      var parser;
      if (index > this.tracks.length || 0 > index) {
        throw Error("Invalid track index (" + index + ")");
      }
      parser = MIDIEvents2.createParser(
        this.tracks[index].getTrackContent(),
        0,
        false
      );
      event = parser.next();
      do {
        events.push(event);
        event = parser.next();
      } while (event);
      return events;
    };
    MIDIFile2.prototype.setTrackEvents = function(index, events) {
      var bufferLength;
      var destination;
      if (index > this.tracks.length || 0 > index) {
        throw Error("Invalid track index (" + index + ")");
      }
      if (!events || !events.length) {
        throw Error("A track must contain at least one event, none given.");
      }
      bufferLength = MIDIEvents2.getRequiredBufferLength(events);
      destination = new Uint8Array(bufferLength);
      MIDIEvents2.writeToTrack(events, destination);
      this.tracks[index].setTrackContent(destination);
    };
    MIDIFile2.prototype.deleteTrack = function(index) {
      if (index > this.tracks.length || 0 > index) {
        throw Error("Invalid track index (" + index + ")");
      }
      this.tracks.splice(index, 1);
      this.header.setTracksCount(this.tracks.length);
    };
    MIDIFile2.prototype.addTrack = function(index) {
      var track;
      if (index > this.tracks.length || 0 > index) {
        throw Error("Invalid track index (" + index + ")");
      }
      track = new MIDIFileTrack();
      if (index === this.tracks.length) {
        this.tracks.push(track);
      } else {
        this.tracks.splice(index, 0, track);
      }
      this.header.setTracksCount(this.tracks.length);
    };
    MIDIFile2.prototype.getContent = function() {
      var bufferLength;
      var destination;
      var origin;
      var i;
      var j;
      var k;
      var l;
      var m;
      var n;
      bufferLength = MIDIFileHeader.HEADER_LENGTH;
      for (i = 0, j = this.tracks.length; i < j; i++) {
        bufferLength += this.tracks[i].getTrackLength() + 8;
      }
      destination = new Uint8Array(bufferLength);
      origin = new Uint8Array(
        this.header.datas.buffer,
        this.header.datas.byteOffset,
        MIDIFileHeader.HEADER_LENGTH
      );
      for (i = 0, j = MIDIFileHeader.HEADER_LENGTH; i < j; i++) {
        destination[i] = origin[i];
      }
      for (k = 0, l = this.tracks.length; k < l; k++) {
        origin = new Uint8Array(
          this.tracks[k].datas.buffer,
          this.tracks[k].datas.byteOffset,
          this.tracks[k].datas.byteLength
        );
        for (m = 0, n = this.tracks[k].datas.byteLength; m < n; m++) {
          destination[i++] = origin[m];
        }
      }
      return destination.buffer;
    };
    MIDIFile2.Header = MIDIFileHeader;
    MIDIFile2.Track = MIDIFileTrack;
    module.exports = MIDIFile2;
  }
});

// src/load-midi.js
var import_midifile = __toESM(require_MIDIFile());
var import_midievents = __toESM(require_MIDIEvents());
function getRanges(notes) {
  const ranges = [];
  const pressedNotes = /* @__PURE__ */ new Map();
  for (const note of notes) {
    if (note.subtype === import_midievents.default.EVENT_MIDI_NOTE_ON) {
      pressedNotes.set(note.param1, note);
    } else if (note.subtype === import_midievents.default.EVENT_MIDI_NOTE_OFF) {
      const startNote = pressedNotes.get(note.param1);
      const duration = note.playTime - startNote.playTime;
      note.playTime = startNote.playTime + duration * 0.8;
      ranges.push({
        startNote,
        endNote: note
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
    return isBetween(start1, start2, end2) || isBetween(end1, start2, end2) || isBetween(start2, start1, end1) || isBetween(end2, start1, end1);
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
function list(...inner) {
  return `\\left[${inner}\\right]`;
}
function voices2desmosFast(voices) {
  const time2index = (t) => Math.floor(t / 50);
  const timeTruncate = (t) => Math.floor((t - 50 * time2index(t)) / 50 * 254) + 1;
  return `V\\left(x\\right)=${list(
    ...voices.map((v) => {
      const regions = new Array(1e4).fill(0).map((v2) => []);
      let x = 0;
      for (const range of v) {
        const startRegion = time2index(range.startNote.playTime);
        const endRegion = time2index(range.endNote.playTime);
        regions[startRegion].push({
          note: range.startNote.param1,
          time: timeTruncate(range.startNote.playTime)
        });
        for (let i = startRegion + 1; i <= endRegion; i++) {
          regions[i].push({
            note: range.startNote.param1,
            time: 1
          });
        }
        regions[endRegion].push({
          note: 0,
          time: timeTruncate(range.endNote.playTime)
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
async function convertMidiToDesmos(midi) {
  const midifile = new import_midifile.default(midi);
  const events = midifile.getEvents();
  const ranges = getRanges(events);
  const voices = getAllVoices(ranges);
  return voices2desmosFast(voices);
}

// src/main.js
var input = document.getElementById("input");
var output = document.getElementById("output");
input.addEventListener("change", async (e) => {
  const file = input.files[0];
  const str = await convertMidiToDesmos(await file.arrayBuffer());
  output.value = str;
});
//# sourceMappingURL=main.js.map
