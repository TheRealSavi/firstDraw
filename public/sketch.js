let socket;
let rSlider, gSlider, bSlider, sSlider;
let mR, mG, mB;
let cButton,eButton,upButton;
let myStroke;
let inputName;
let mayDraw = false;
let members=[];

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
  createCanvas(1000, 800);
  background(51);

  socket = io.connect('http://97.95.117.48:3000');

  leftBuffer  = createGraphics(200, 600);
  rightBuffer = createGraphics(600, 600);
  lowerBuffer = createGraphics(800, 200);
  nameBuffer  = createGraphics(200, 800);
  drawLeftBuffer();
  drawRightBuffer();
  drawLowerBuffer();
  drawNameBuffer();
  socketEvents();
  socket.emit('clear',{});
}

function draw() {
  mR = rSlider.value();
  mG = gSlider.value();
  mB = bSlider.value();
  myStroke = sSlider.value();
  leftBuffer.background(mR, mG, mB);
  image(leftBuffer, 0, 0);
  image(rightBuffer, 200, 0);
  image(lowerBuffer, 0, 600);
  image(nameBuffer, 800, 0);
}

function socketEvents() {
  nameHandler();

  socket.on('mouse', data => {
    noStroke();
    fill(data.r,data.g,data.b);
    rect(data.x,data.y,data.stroke,data.stroke);
  });

  socket.on('clear', data => background(51));

  socket.on('leave', data => {
    for (var i = 0; i < members.length; i++) {
      if (members[i].id == data.id) {
        members.splice(i, 1);
        nameBuffer.background(160);
      }
    }
  });
}

function mouseDragged() {
  if (mayDraw) {
    noStroke();
    fill(mR, mG, mB);
    rect(mouseX,mouseY,myStroke,myStroke);

    socket.emit('mouse',{
      x: mouseX,
      y: mouseY,
      r: mR , g: mG , b: mB,
      stroke: myStroke
    });
  }
}

function drawRightBuffer() {
}

function drawLeftBuffer() {
  rSlider = createSlider(0, 255, 100);
  rSlider.position(20, 20);
  gSlider = createSlider(0, 255, 0);
  gSlider.position(20, 50);
  bSlider = createSlider(0, 255, 255);
  bSlider.position(20, 80);
  sSlider = createSlider(1, 65, 10);
  sSlider.position(20, 110);

  cButton = createButton("Clear Screen");
  cButton.position(20,160);
  cButton.mousePressed(function() {
    socket.emit('clear',{});
    background(51);
  });

  eButton = createButton("Eraser");
  eButton.position(120,160);
  eButton.mousePressed(function() {
    rSlider.value(51);
    gSlider.value(51);
    bSlider.value(51);
  });

  inputName = createInput("Name");
  inputName.position(20, 200);
  upButton = createButton("Connect");
  upButton.position(20,230);

  upButton.mousePressed(function() {
    upButton.hide();
    mayDraw = true;
    socket.emit('newName',{
      name: inputName.value(),
      user: socket.id,
      cR: mR, cG: mG, cB: mB
    });
    setInterval(function() {
      socket.emit('newName',{
        name: inputName.value(),
        user: socket.id,
        cR: mR, cG: mG, cB: mB
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
