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

let myWANIP = 'localhost';
let myPort = '3000';

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
    nameBuffer.fill(this.mR, this.mG, this.mB);
    nameBuffer.textSize(28);
    nameBuffer.text(this.name,this.x, this.y);
  }
}

function setup() {
  socket = io.connect('http://'+myWANIP+':'+myPort);

  createCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight));
  canvasDesigner(true,true);

  socketEvents();

  setInterval(function() {
    mayResize = true;
    if (delayResize) {
      delayResize = false;
      canvasDesigner(false,true);
    }
  },350);
}

function windowResized() {
  if (mayResize) {
    resizeCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight), false);
    canvasDesigner(false,true);
    mayResize = false;
  } else {
    delayResize = true;
  }
}

function canvasDesigner(drawLeft,create) {
  if (create) {
    if (Math.floor(window.innerWidth-window.innerWidth/2) <= Math.floor(window.innerHeight-window.innerHeight/4)) {
      rightBuffer = createGraphics(Math.floor(window.innerWidth/2), Math.floor(window.innerWidth/2));
      preBuffer   = createGraphics(Math.floor(window.innerWidth/2), Math.floor(window.innerWidth/2));
      drawingSize = Math.floor(window.innerWidth/2);
    } else {
      rightBuffer = createGraphics(Math.floor(window.innerHeight/2+window.innerHeight/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
      preBuffer   = createGraphics(Math.floor(window.innerHeight/2+window.innerHeight/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
      drawingSize = Math.floor(window.innerHeight/2+window.innerHeight/4);
    }
    leftBuffer  = createGraphics(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
    lowerBuffer = createGraphics(Math.floor(window.innerWidth-window.innerWidth/4), Math.floor(window.innerHeight/4));
    nameBuffer  = createGraphics(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight));
  } else {
    if (Math.floor(window.innerWidth-window.innerWidth/2) <= Math.floor(window.innerHeight-window.innerHeight/4)) {
      rightBuffer.width  = Math.floor(window.innerWidth/2);
      rightBuffer.height = Math.floor(window.innerWidth/2);
      preBuffer.width    = Math.floor(window.innerWidth/2);
      preBuffer.height   = Math.floor(window.innerWidth/2);
      drawingSize        = Math.floor(window.innerWidth/2);
    } else {
      rightBuffer.width  = Math.floor(window.innerHeight/2+window.innerHeight/4);
      rightBuffer.height = Math.floor(window.innerHeight/2+window.innerHeight/4);
      preBuffer.width    = Math.floor(window.innerHeight/2+window.innerHeight/4);
      preBuffer.height   = Math.floor(window.innerHeight/2+window.innerHeight/4);
      drawingSize        = Math.floor(window.innerHeight/2+window.innerHeight/4);
    }
    leftBuffer.width     = Math.floor(window.innerWidth/4);
    leftBuffer.height    = Math.floor(window.innerHeight/2+window.innerHeight/4);
    lowerBuffer.width    = Math.floor(window.innerWidth-window.innerWidth/4);
    lowerBuffer.height   = Math.floor(window.innerHeight/4);
    nameBuffer.width     = Math.floor(window.innerWidth/4);
    nameBuffer.height    = Math.floor(window.innerHeight);
  }
  drawRightBuffer();
  drawPreBuffer();
  drawLowerBuffer();
  drawNameBuffer();
  if (drawLeft) {
    drawLeftBuffer();
  }
  if (mayDraw) {
    socket.emit('clear',{room: myRoom});
    rightBuffer.background(51);
  } else {
    rightBuffer.background(51);
  }
}

function draw() {
  mR = rSlider.value();
  mG = gSlider.value();
  mB = bSlider.value();
  myRawStroke = sSlider.value();

  myStroke = Math.floor(sSlider.value()/100 * drawingSize);
  leftBuffer.background(mR, mG, mB);
  preBuffer.clear();

  if (
    mouseX >= Math.floor(window.innerWidth/4) &&
    mouseX <= Math.floor(window.innerWidth-window.innerWidth/4) &&
    mouseY >= Math.floor(0) &&
    mouseY <= Math.floor(window.innerHeight-window.innerHeight/4)
  ) {
    noCursor();
    push();
    preBuffer.noFill();
    preBuffer.stroke(mR, mG, mB);
    preBuffer.rectMode(CENTER);
    preBuffer.rect(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke,myStroke,20);

    preBuffer.noFill();
    preBuffer.stroke(255);
    preBuffer.circle(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke/2);
    pop();
  } else {
    cursor();
  }

  image(leftBuffer, 0, 0);
  image(rightBuffer, Math.floor(window.innerWidth/4), 0);
  image(preBuffer, Math.floor(window.innerWidth/4), 0);
  image(lowerBuffer, 0, Math.floor(window.innerHeight-window.innerHeight/4));
  image(nameBuffer, Math.floor(window.innerWidth-window.innerWidth/4), 0);
}

function socketEvents() {
  nameHandler();

  socket.on('mouse', data => {
    rightBuffer.noStroke();
    let ourX = Math.floor(data.x/100 * drawingSize);
    let ourY = Math.floor(data.y/100 * drawingSize);
    let ourS = Math.floor(data.stroke/100 * drawingSize);
    push();
    rightBuffer.fill(data.r,data.g,data.b);
    rightBuffer.rectMode(CENTER);
    rightBuffer.rect(ourX,ourY,ourS,ourS,20);
    pop();
  });

  socket.on('clear', data => rightBuffer.background(51));

  socket.on('leave', data => {
    for (let i = 0; i < members.length; i++) {
      if (members[i].id == data.id) {
        members.splice(i, 1);
        nameBuffer.background(160);
      }
    }
  });
}

function mouseDragged() {
  if (mayDraw) {
    if (mouseX >= Math.floor(window.innerWidth/4)) {
      push();
      rightBuffer.noStroke();
      rightBuffer.fill(mR, mG, mB);
      rightBuffer.rectMode(CENTER);
      rightBuffer.rect(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke,myStroke,20);
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

function drawRightBuffer() {
  background(210);
}

function drawLeftBuffer() {
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
      rightBuffer.background(51);
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
    rightBuffer.background(51);
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

function drawLowerBuffer() {
  lowerBuffer.background(80);
}

function drawNameBuffer() {
  nameBuffer.background(160);
}

function drawPreBuffer() {
  preBuffer.clear();
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
          nameBuffer.background(160);
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
    nameBuffer.background(160);
    for (let i = 0; i < members.length; i++) {
      members[i].show();
    }
  });
}
