let playhead = {
  shapes: [],
  x: 36,
  y: 100,
}

let chords = []
let collisionCheckers = []

let chordList = [
  {
    name: "I",
    notes: [53, 56, 60, 63]
  },
  {
    name: "ii",
    notes: [55, 58, 61, 65]
  },
  {
    name: "iii",
    notes: [56, 60, 63, 67]
  },
  {
    name: "IV",
    notes: [58, 61, 65, 68]
  },
  {
    name: "V",
    notes: [60, 63, 67, 70]
  },
  {
    name: "vi",
    notes: [61, 65, 68, 72]
  },
  {
    name: "vii",
    notes: [63, 67, 70, 74]
  }
]

let midiOut = null;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // create canvas 720x405
  createCanvas(720, 405);

  // create a chord object
  chords.push(new chord(38, 122, "I"));
  chords.push(new chord(370, 122, "V"));

  // run getNotes() on the chord object
  for (let i = 0; i < chords.length; i++) {
    chords[i].getNotes();
    chords[i].createChordButtons();
  }
  
  // create a collision checker for each chord
  for (let i = 0; i < chords.length; i++) {
    collisionCheckers.push(false);
  }

  // Accessing MIDI with webmidi.js
  WebMidi
    .enable()
    .then(onMidiEnabled)
    .catch(err => alert(err));

}

function draw() {
  background(0);

  // console.log(midiOut.channels)

  background(0);
    
  // grid
  stroke(255);
  line(36, 100, 36, height-100);
  line(width - 36, 100, width - 36, height-100);

  // display chords
  for (let i = 0; i < chords.length; i++) {
      chords[i].display();
  }

  // playhead
  // create a playhead shape, which is a combination of a small circle on top and a line on the bottom
  fill(255)
  stroke(255)
  playhead.shapes.push(ellipse(playhead.x, playhead.y, 10, 10));
  playhead.shapes.push(line(playhead.x, playhead.y, playhead.x, height - 100));

  playhead.x += 1;

  if (playhead.x > width - 36) {
      playhead.x = 36;
  }

  // check collision between chord and playhead
  for (let i = 0; i < chords.length; i++) {
      // use collide2d library to check collision between the playhead line and chord
      if (collideLineRect(playhead.x, playhead.y, playhead.x, height - 100, chords[i].x, chords[i].y, 644/2-10, 160)) {
        if (collisionCheckers[i] == false) {
          chords[i].activate();
          collisionCheckers[i] = true;
          // Iterate through the notes array and send noteOn messages
          for (let j = 0; j < chords[i].notes.length; j++) {
            midiOut.channels[1].sendNoteOn(chords[i].notes[j], 127);
          }

          // midiOut.channels[1].sendNoteOn(48, 127);
          // midiOut.channels[1].sendNoteOn(51, 127);
          // midiOut.channels[1].sendNoteOn(54, 127);
        }
      } else {
        if (collisionCheckers[i] == true) {
          chords[i].deactivate();
          collisionCheckers[i] = false;

          // Iterate through the notes array and send noteOff messages
          for (let j = 0; j < chords[i].notes.length; j++) {
            midiOut.channels[1].sendNoteOff(chords[i].notes[j]);
          }

          // midiOut.channels[1].sendNoteOff(48);
          // midiOut.channels[1].sendNoteOff(51);
          // midiOut.channels[1].sendNoteOff(54);
        }
      }
  }

  // check if a chordButton is clicked and run changeChord() on the chord object
  for (let i = 0; i < chords.length; i++) {
    chords[i].changeChord();
  }
}

function mousePressed() {
  let chordsCleared = false

  // Check if playhead is over a chord and the mouse is over a chordButton contained within, log the name of the chord
  for (let i = 0; i < chords.length; i++) {
    if (collideLineRect(playhead.x, playhead.y, playhead.x, height - 100, chords[i].x, chords[i].y, 644/2-10, 160)) {
      for (let j = 0; j < chords[i].chordButtons.length; j++) {
        if (chords[i].chordButtons[j].clicked() != undefined) {
          // Stop the chord
          // Iterate through the notes array and send noteOff messages
          for (let k = 0; k < chords[i].notes.length; k++) {
            midiOut.channels[1].sendNoteOff(chords[i].notes[k]);
          }

          // chordsCleared = true;

          console.log(chords[i].notes)

          // Clear the notes array of this chord
          chords[i].notes = [];

          // Change the name of the chord to the name of the chordButton that was clicked
          chords[i].name = chords[i].chordButtons[j].clicked();

          // Get the notes from the chordList array
          chords[i].getNotes();

          // Iterate through the notes array and send noteOn messages
          for (let k = 0; k < chords[i].notes.length; k++) {
            midiOut.channels[1].sendNoteOn(chords[i].notes[k]);
          }

          console.log(chords[i].notes)

          // // Run getNotes
          // chords[i].getNotes();

          // if (chordsCleared == true) {
          //   // Start notes from the new array
          //   for (let k = 0; k < chords[i].notes.length; k++) {
          //     midiOut.channels[1].sendNoteOn(chords[i].notes[k], 127);
          //   }

          //   chordsCleared = false;
          // }
          
          // // Change the name of the chord to the name of the chordButton that was clicked
          // chords[i].name = chords[i].chordButtons[j].clicked();

          // // Iterate through the notes array and send noteOn messages
          // for (let k = 0; k < chords[i].notes.length; k++) {
          //   midiOut.channels[1].sendNoteOn(chords[i].notes[k], 127);
          // }
        }
      }
    }
  }


}

function chord(x, y, name) {
  this.x = x;
  this.y = y;
  this.name = name;
  this.stroke = 0;
  this.notes = []
  this.chordButtons = []

  this.getNotes = function() {
    // get notes from chordList based on name
    for (let i = 0; i < chordList.length; i++) {
      if (chordList[i].name == this.name) {
        this.notes = chordList[i].notes;
      }
    }
  }

  this.createChordButtons = function() {
    // Create a chord button for each chord in the chordList array and place it above the chord in a horizontal row with an 8px gap between them
    for (let i = 0; i < chordList.length; i++) {
      this.chordButtons.push(new chordButton(this.x + i * 44, this.y - 44, chordList[i].name));
    }
  }

  this.activate = function() {
      this.stroke = 255;
  }

  this.deactivate = function() {
      this.stroke = 0;
      // midiOut.channels[1].sendNoteOff(48);
  }

  this.changeChord = function() {
    let chordCleared = false;

    // when a chordButton from the chordButtons array is clicked, change the name of the chord and get the notes from the chordList array
    for (let i = 0; i < this.chordButtons.length; i++) {
      if (this.chordButtons[i].clicked() != undefined) {
        this.name = this.chordButtons[i].clicked();
        // When the playhead is over the chord, stop the chord
        // if (collideLineRect(playhead.x, playhead.y, playhead.x, height - 100, this.x, this.y, 644/2-10, 160)) {
        //   // Stop the chord
        //   // Iterate through the notes array and send noteOff messages
        //   for (let j = 0; j < this.notes.length; j++) {
        //     midiOut.channels[1].sendNoteOff(this.notes[j]);
        //   }

        //   chordsCleared = true;
        // }
        this.notes = []
        this.getNotes();

        // if (chordsCleared == true) {
        //   // Start notes from the new array
        //   for (let j = 0; j < this.notes.length; j++) {
        //     midiOut.channels[1].sendNoteOn(this.notes[j], 127);
        //   }

        //   chordsCleared = false;
        // }

        // Start notes from the new array
        // for (let j = 0; j < this.notes.length; j++) {
        //   midiOut.channels[1].sendNoteOn(this.notes[j], 127);
        // }
      }
    }
  }

  this.display = function() {
    // rectangle
    fill(100);
    stroke(this.stroke)
    rect(this.x, this.y, 644/2-10, 160,24);

    // draw the chordbuttons
    for (let i = 0; i < this.chordButtons.length; i++) {
      this.chordButtons[i].display();
      this.chordButtons[i].hoverState();
    }

    // put the name of the chord as text in the middle of the rectangle
    fill(255);
    noStroke();
    textSize(32);
    textAlign(CENTER, CENTER);
    text(this.name, this.x + (644/2-10)/2, this.y + 160/2);
  }
}

function chordButton(x, y, name) {
  this.x = x;
  this.y = y;
  this.name = name;
  this.background = 100;
  this.textBackground = 255;

  this.hoverState = function() {
    // check if mouse is over the button
    if (mouseX > this.x && mouseX < this.x + 36 && mouseY > this.y && mouseY < this.y + 36) {
      this.background = 255;
      this.textBackground = 0;
    } else {
      this.background = 100;
      this.textBackground = 255;
    } 
  }

  this.clicked = function() {
    // check if mouse is over the button and clicked
    if (mouseX > this.x && mouseX < this.x + 36 && mouseY > this.y && mouseY < this.y + 36 && mouseIsPressed) {
      return this.name
    }
  }

  this.display = function() {
    fill(this.background);
    stroke(0);
    rect(this.x, this.y, 36, 36, 8);

    // Write the name of the chord on top of the button
    fill(this.textBackground);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.name, this.x + 18, this.y + 18);
  }
}

function onMidiEnabled() {
  console.log("WebMidi enabled!") 

  // Inputs
  console.log("Inputs:") 
  WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));
  
  // Outputs
  console.log("Outputs:") 
  WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));

  midiOut = WebMidi.getOutputByName("IAC Driver Bus 1");
}