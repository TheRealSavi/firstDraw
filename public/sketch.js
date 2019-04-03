let socket;
let rSlider, gSlider, bSlider, sSlider;
let mR, mG, mB;
let cButton, eButton, upButton, swButton, ranButton;
let myStroke, myRawStroke;
let inputName, inputRoom;
let myRoom;
let mayDraw = false;
let members=[];
let rName;
let mayResize = true;
let delayResize = false;
let drawingSize;
let pointers=[];

class member {
  constructor() {
  this.x  = 0;
  this.y  = 0;
  this.mR = 100;
  this.mG = 0;
  this.mB = 255;
  this.name = "noname";
  this.id   = "noid";
  }
  show() {
    for (var i = 0; i < pointers.length; i++) {
      if (pointers[i].name == "name") {
        fill(this.mR, this.mG, this.mB);
        textSize(28);
        let naX = this.x + pointers[i].x
        text(this.name,naX, this.y);
      }
    }

  }
}

class locationPointer {
  constructor(data) {
    this.name = data.type;
    this.c    = data.shade;
  }
  resize() {
    switch(this.name) {
      case "right":
        this.x = Math.floor(window.innerWidth/4);
        this.y = 0;
        if (Math.floor(window.innerWidth-window.innerWidth/2) <= Math.floor(window.innerHeight-window.innerHeight/4)) {
          this.w = Math.floor(window.innerWidth/2);
          this.h = Math.floor(window.innerWidth/2);
          drawingSize = Math.floor(window.innerWidth/2);
        } else {
          this.w = Math.floor(window.innerHeight/2+window.innerHeight/4);
          this.h = Math.floor(window.innerHeight/2+window.innerHeight/4);
          drawingSize = Math.floor(window.innerHeight/2+window.innerHeight/4);
        }
      break;
      case "left":
        this.x = 0;
        this.y = 0;
        this.w = Math.floor(window.innerWidth/4);
        this.h = Math.floor(window.innerHeight/2+window.innerHeight/4);
      break;
      case "lower":
        this.x = 0;
        this.y = Math.floor(window.innerHeight-window.innerHeight/4);
        this.w = Math.floor(window.innerWidth-window.innerWidth/4);
        this.h = Math.floor(window.innerHeight/4);
      break;
      case "name":
        this.x = Math.floor(window.innerWidth-window.innerWidth/4);
        this.y = 0;
        this.w = Math.floor(window.innerWidth/4);
        this.h = Math.floor(window.innerHeight);
      break;
    }
    this.update();
  }
  update() {
    noStroke();
    fill(this.c);
    rect(this.x, this.y, this.w, this.h);
  }
  recolor(r, g, b) {
    if (this.name == "left") {
      noStroke();
      fill(r, g, b);
      rect(this.x, this.y, this.w, this.h);
    }
  }
}

function setup() {
  socket = io.connect('http://97.95.117.48:3001');

  createCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight));

  pointers.push(new locationPointer({type:"left",  shade:51}));
  pointers.push(new locationPointer({type:"right", shade:0}));
  pointers.push(new locationPointer({type:"lower", shade:80}));
  pointers.push(new locationPointer({type:"name",  shade:160}));

  for (let i = 0; i < pointers.length; i++) {
    pointers[i].resize();
  }

  drawControls();

  socketEvents();

  setInterval(function() {
    mayResize = true;
    if (delayResize) {
      delayResize = false;
      for (let i = 0; i < pointers.length; i++) {
        pointers[i].resize();
      }
    }
  },350);
}

function windowResized() {
  if (mayResize) {
    resizeCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight), false);
    for (var i = 0; i < pointers.length; i++) {
      pointers[i].resize();
    }
    mayResize = false;
  } else {
    delayResize = true;
  }
}

function draw() {
  mR = rSlider.value();
  mG = gSlider.value();
  mB = bSlider.value();
  myRawStroke = sSlider.value();

  myStroke = Math.floor(sSlider.value()/100 * drawingSize);

  for (var i = 0; i < pointers.length; i++) {
    pointers[i].recolor(mR, mG, mB);
  }

  // if (
  //   mouseX >= Math.floor(window.innerWidth/4) &&
  //   mouseX <= Math.floor(window.innerWidth-window.innerWidth/4) &&
  //   mouseY >= Math.floor(0) &&
  //   mouseY <= Math.floor(window.innerHeight-window.innerHeight/4)
  // ) {
  //   noCursor();
  //   preBuffer.noFill();
  //   preBuffer.stroke(mR, mG, mB);
  //   preBuffer.rectMode(CENTER);
  //   preBuffer.rect(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke,myStroke,20);
  //
  //   preBuffer.noFill();
  //   preBuffer.stroke(255);
  //   preBuffer.circle(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke/2);
  // } else {
  //   cursor();
  // }

// image(preBuffer, Math.floor(window.innerWidth/4), 0); //clear
}

function socketEvents() {
  nameHandler();

  socket.on('mouse', data => {
    noStroke();
    let ourX = Math.floor(data.x/100 * drawingSize) + Math.floor(window.innerWidth/4);
    let ourY = Math.floor(data.y/100 * drawingSize);
    let ourS = Math.floor(data.stroke/100 * drawingSize);
    fill(data.r,data.g,data.b);
    push();
    rectMode(CENTER);
    rect(ourX,ourY,ourS,ourS,20);
    pop();
  });

  socket.on('clear', data => {
    //background(51)
    for (let i = 0; i < pointers.length; i++) {
      pointers[i].resize();
    }
  });

  socket.on('leave', data => {
    for (let i = 0; i < members.length; i++) {
      if (members[i].id == data.id) {
        members.splice(i, 1);
        //background(160);
        for (let j = 0; j < pointers.length; j++) {
          pointers[j].resize();
        }
      }
    }
  });
}

function mouseDragged() {
  if (mayDraw) {
    if (mouseX >= Math.floor(window.innerWidth/4)) {
      noStroke();
      fill(mR, mG, mB);
      push();
      rectMode(CENTER);
      rect(mouseX,mouseY,myStroke,myStroke,20);
      pop();

      let relativeX = Math.floor(((mouseX-Math.floor(window.innerWidth/4))/drawingSize)*100);
      let relativeY = Math.floor((mouseY/drawingSize)*100);

      socket.emit('mouse',{
        x: relativeX,
        y: relativeY,
        r: mR , g: mG , b: mB,
        stroke: myRawStroke,
        room: myRoom
      });
    }
  }
}

function drawControls() {
  rSlider = createSlider(0, 255, 100);
  rSlider.position(20, 20);
  gSlider = createSlider(0, 255, 0);
  gSlider.position(20, 50);
  bSlider = createSlider(0, 255, 255);
  bSlider.position(20, 80);
  sSlider = createSlider(1, 50, 5);
  sSlider.position(20, 110);

  cButton = createButton("Clear Screen");
  cButton.position(20,160);
  cButton.mousePressed(function() {
    if (mayDraw) {
      socket.emit('clear',{room: myRoom});
      //background(51);
      for (let i = 0; i < pointers.length; i++) {
        pointers[i].resize();
      }
    }
  });

  eButton = createButton("Eraser");
  eButton.position(120,160);
  eButton.mousePressed(function() {
    rSlider.value(51);
    gSlider.value(51);
    bSlider.value(51);
  });

  socket.emit('rName', function(data) {
    rName = data[0];
    inputName = createInput(rName);
    inputName.position(20, 200);
  });

  ranButton = createButton("Randomize");
  ranButton.position(20,225);

  upButton = createButton("Connect");
  upButton.position(20,280);

  inputRoom = createInput("Room");
  inputRoom.position(20, 250);

  swButton = createButton("Switch Room");
  swButton.position(20,281);
  swButton.hide();

  swButton.mousePressed(function() {
    myRoom = inputRoom.value();
    socket.emit('switchJoin', {room: myRoom});
    socket.emit('clear',{room: myRoom});
    for (let i = 0; i < pointers.length; i++) {
      pointers[i].resize();
    }
    members=[];
  });

  ranButton.mousePressed(function() {
    socket.emit('rName', function(data) {
      rName = data[0];
      inputName.value(rName);
    });
  });

  upButton.mousePressed(function() {
    upButton.hide();
    swButton.show();
    myRoom = inputRoom.value();
    mayDraw = true;

    socket.emit('roomJoin', {room: myRoom});
    socket.emit('clear',{room: myRoom});

    socket.emit('newName',{
      name: inputName.value(),
      user: socket.id,
      cR: mR, cG: mG, cB: mB,
      room: myRoom
    });

    setInterval(function() {
      socket.emit('newName',{
        name: inputName.value(),
        user: socket.id,
        cR: mR, cG: mG, cB: mB,
        room: myRoom
      });
    },3000);
  });
}

function updateName(data,me,y) {
  members[me].x=20;
  members[me].y=y;
  members[me].mR=data.cR;
  members[me].mG=data.cG;
  members[me].mB=data.cB;
  members[me].name=data.name;
  members[me].id=data.user;
  members[me].show();
}

function nameHandler() {
  socket.on('newName', function(data) {
    if (members.length == 0) {
      members.push(new member());
      let margin = members.length * 28 + 10;
      let me = members.length-1;
      updateName(data,me,margin);
    } else {
      for (let i = members.length-1; i > -1; i--) {
        if (members[i].id == data.user) {
          let margin = (i+1) * 28 + 10;
          updateName(data,i,margin);
          //background(160);
          for (let j = 0; j < pointers.length; j++) {
            pointers[j].resize();
          }
          for (let i = 0; i < members.length; i++) {
            members[i].show();
          }
          return;
        } else {
          if (i == 0) {
            members.push(new member());
            let margin = members.length * 28 + 10;
            let me = members.length-1;
            updateName(data,me,margin);
          }
        }
      }
    }
    //background(160);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i].resize();
    }
    for (let i = 0; i < members.length; i++) {
      members[i].show();
    }
  });
}
