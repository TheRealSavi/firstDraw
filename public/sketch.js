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
let drawingSize;

class member {
  constructor() {
  this.x = 0;
  this.y = 0;
  this.mR = 100;
  this.mG = 0;
  this.mB = 255;
  this.name = "noname";
  this.id="noid";
  }
  show() {
    nameBuffer.fill(this.mR, this.mG, this.mB);
    nameBuffer.textSize(28);
    nameBuffer.text(this.name,this.x, this.y);
  }
}

function setup() {
  socket = io.connect('http://97.95.117.48:3001');

  createCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight));
  canvasDesigner(true,true);

  socketEvents();
}

function windowResized() {
  resizeCanvas(Math.floor(window.innerWidth), Math.floor(window.innerHeight), false);
  canvasDesigner(false,true);
}

function canvasDesigner(drawLeft,create) {
  if (create) {
    if (Math.floor(window.innerWidth-window.innerWidth/2) <= Math.floor(window.innerHeight-window.innerHeight/4)) {
      rightBuffer = createGraphics(Math.floor(window.innerWidth/2), Math.floor(window.innerWidth/2));
      drawingSize = Math.floor(window.innerWidth/2);
    } else {
      rightBuffer = createGraphics(Math.floor(window.innerHeight/2+window.innerHeight/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
      drawingSize = Math.floor(window.innerHeight/2+window.innerHeight/4);
    }

    leftBuffer  = createGraphics(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
    lowerBuffer = createGraphics(Math.floor(window.innerWidth-window.innerWidth/4), Math.floor(window.innerHeight/4));
    nameBuffer  = createGraphics(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight));
  } else {
    if (Math.floor(window.innerWidth-window.innerWidth/2) <= Math.floor(window.innerHeight-window.innerHeight/4)) {
      rightBuffer.size(Math.floor(window.innerWidth/2), Math.floor(window.innerWidth/2));
      drawingSize = Math.floor(window.innerWidth/2);
    } else {
      rightBuffer.size(Math.floor(window.innerHeight/2+window.innerHeight/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
      drawingSize = Math.floor(window.innerHeight/2+window.innerHeight/4);
    }

    leftBuffer.size(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight/2+window.innerHeight/4));
    lowerBuffer.size(Math.floor(window.innerWidth-window.innerWidth/4), Math.floor(window.innerHeight/4));
    nameBuffer.size(Math.floor(window.innerWidth/4), Math.floor(window.innerHeight));
  }
  drawRightBuffer();
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
  myStroke = Math.floor(sSlider.value()/100 * drawingSize);
  myRawStroke = sSlider.value();
  leftBuffer.background(mR, mG, mB);
  image(leftBuffer, 0, 0);
  image(rightBuffer, Math.floor(window.innerWidth/4), 0);
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
    rightBuffer.fill(data.r,data.g,data.b);
    rightBuffer.rect(ourX,ourY,ourS,ourS);
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
    rightBuffer.noStroke();
    rightBuffer.fill(mR, mG, mB);
    rightBuffer.rect(mouseX-Math.floor(window.innerWidth/4),mouseY,myStroke,myStroke);

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

function drawRightBuffer() {
  background(200);
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
