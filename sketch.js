
let bg;                //Store the background color
let colorSet;          //Store all colors
let rings = [];       //Save the random parameters (position/radius/color matching) of each circle

function setup() {
  //Create a canvas as large as the current browser window
  createCanvas(windowWidth, windowHeight);

  colorSet = [
    color(10,13,24),     // bg
    color(255, 90, 0),   // hot orange
    color(255, 0, 110),  // magenta
    color(80, 220, 100), // mint
    color(255, 200, 0),  // yellow
    color(0, 210, 255),  // cyan
    color(140,110,255),  // violet
    color(255, 80,170),  // pink
    color(255,120, 40),  // orange2
    color(40, 255,200)   // aqua
  ];
  bg = colorSet[0];
  
  generateLayout(); 
}

function draw() {
  // Change: Set the background with an alpha value of 10 to have a visible trail,
  background(0, 10);
  push();

  //===== New: This part is to add canvas effect =====
  translate(width/2, height/2);  //Move the original position to the centre of the canvas
   
   // Let the canvas harmonic rotate over time
   // Reference:https://editor.p5js.org/ks1439/sketches/jiL7AeR0T
   let harmonicRate1 = frameCount/550 * TWO_PI;
   let angle1 = sin(harmonicRate1) * 0.5;
   rotate(angle1);

   // Zoom canvas to create a jumping effect
   let rate = frameCount/200 * TWO_PI;
   let s = 1 + 0.1 * sin(rate * 1.5);
   scale(s);
   
   // Move the position back
   translate(-width/2, -height/2);

   let i = 0;
  for (let ring of rings){
    // Fall progress t (0-1) : Used to control the scaling and fading of halos
    // The circular figure starts from the top of the canvas and approaches 1 after passing through it
    const t = constrain((ring.y + ring.r) / (height + ring.r * 2), 0, 1);
    //constrain() It is used to limit the calculated progress value within the range of 0 to 1 to avoid exceeding the interval.
    // reference：https://p5js.org/reference/#/p5/constrain

    //===== New: Make the circle sway slightly with time respectively =====
    let time = millis() * 0.001;  // This function is to get the current time with second. // Reference:https://p5js.org/reference/p5/millis/
    let sway = sin(time * 2 + ring.x * 0.05) * 1.2;
    ring.x += sway;

    // Add size pulse effect
    let pulseRate = frameCount/160 * TWO_PI;
    let pulse = 1 + 0.3 * sin(pulseRate + i * 0.6);  // Use i to make circles pulse respectively 
    let currentR = ring.r * pulse;

    // Make transparency change over time
    let alphaRate = frameCount/315 * TWO_PI;
    let alphaPulse = map(
      sin(alphaRate + i * 0.6),
      -1, 1, 80, 170
    );

    //===== Change: Add currentR and alphaPulse to draw function so that the circle can be drawn with updated size and transparency =====
    // Draw halos 
    drawAura(ring, t, currentR, alphaPulse);

    //Make the circle sway itself
    push();
    translate(ring.x, ring.y);
    rotate(sin( time * 3 + ring.y * 0.01) * 0.15);

    //The circular figure maintains a fixed size (does not scale with t)
      if (ring.style === 'dots') {
      drawDotMandala(ring, currentR,alphaPulse);
    } else {
      drawCircle(ring, currentR, alphaPulse);
    }
    pop();
    i++;

    // Update the falling position
    fallAndReset(ring);     
  }
  pop();  //Refresh canvas state
}

//The halo amplifies and fades out as it falls
function drawAura(ring, t, currentR, alphaPulse) {
  if (t <= 0) return;

  // Select a color from the palette
  const c = ring.palette[1];

  // Change: which is to make alpha change over time
  const alpha = alphaPulse * (1 - t);

  // Change: which is to make the aura bigger as the circle falls
  const rr = currentR * (1 + 1.6 * t);

  noStroke();
  fill(red(c), green(c), blue(c), alpha);
  circle(ring.x, ring.y, rr * 2);
}

//Control the drop and reset of the circular graphic
function fallAndReset(ring){
  ring.y += ring.vy;  // Update the position through speed

  if (ring.y > height + ring.r){ //When the circle extends beyond the canvas
    ring.y =- ring.r;  //Let the small ball keep falling
    ring.x = random(ring.r, width-ring.r); //Random x position
    ring.vy = random(1,3);  //New falling velocity
    
    //random color
    ring.palette = [
      random(colorSet.slice(1)),//Slice is to remove the background color and leave the rest
      random(colorSet.slice(1)),//Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
      random(colorSet.slice(1)),
      random(colorSet.slice(1)),
      random(colorSet.slice(1)),
    ];
  }
}


// ===== generate the data of the circle (position/radius/color scheme) =====
function generateLayout(){
  rings = [];
  const S = min(width, height);

  // The quantity of the two types of circles
  const N_SPOKES = 5;
  const N_DOTS   = 7;

  // The size range of the two types of circles
  const Rmin_spokes = S * 0.06;
  const Rmax_spokes = S * 0.09;
  const Rmin_dots   = S * 0.05;
  const Rmax_dots   = S * 0.08;

  const pool = colorSet.slice(1);  // Color library (excluding background)

  // 1.Spokes type: 
  // It has spokes, an outer ring and a dot matrix ring, with a double-layer dot ending at the center.
  for (let i = 0; i < N_SPOKES; i++){
    let r = random(Rmin_spokes, Rmax_spokes);
    let x = random(r + 20, width  - r - 20);
    let y = random(- height, height);
    let vy = random(3.8, 4.5); //falling velocity
    let palette = [
      random(pool),
      random(pool),
      random(pool),
      random(pool),
      random(pool)
    ];
     rings.push({ x, y, r, palette, style: 'spokes', vy });
  }

  // Dots type: A circle composed of concentric dot matrix rings and radiating rays.
  for (let i = 0; i < N_DOTS; i++){
    let r = random(Rmin_dots, Rmax_dots);
    let x = random(r + 20, width  - r - 20);
    let y = random(r + 20, height - r - 20);
    let vy = random(2.5, 3.5);
    let palette = [
      random(pool),
      random(pool),
      random(pool),
      random(pool),
      random(pool)
    ];
    rings.push({ x, y, r, palette, style: 'dots', vy });
  }
}

// ===== Change in window size=====
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  generateLayout();
}

// ===== Change: Update the size and transparency over time with currentR and alphaPulse in the following part =====
// ===== draw a Spokes type circle (outer ring/spoke/middle ring/lattice/center cap) =====
function drawCircle(ring, currentR, alphaPulse){
  // outer ring
  strokeWeight(max(2, currentR * 0.08));
  stroke(ring.palette[0], alphaPulse);
  noFill();
  circle(0, 0, currentR * 2);

  // spoke
  let nSpokes = 15;  //Number of lines
  strokeWeight(2);
  stroke(ring.palette[1], alphaPulse);

  for (let i = 0; i < nSpokes; i++){
    let ang = i * TWO_PI / nSpokes; 
    let x1 = currentR * 0.12 * cos(ang);
    let y1 = currentR * 0.12 * sin(ang);
    let x2 = currentR * 0.88 * cos(ang);
    let y2 = currentR * 0.88 * sin(ang);
    line(x1, y1, x2, y2);
  }

    // middle ring
  strokeWeight(max(2, currentR * 0.04));
  stroke(ring.palette[2], alphaPulse);
  noFill();
  circle(0, 0, currentR * 1.2);


  // lattice
  // lattice A（outer ring）
  noStroke();
  fill(ring.palette[3], alphaPulse);       // The original color
  let dotsA = max(7, int(currentR / 5));  
  let rA = currentR * 0.38;

  for (let i = 0; i < dotsA; i++){
    let a = i * TWO_PI / dotsA;
    let x = rA * cos(a);
    let y = rA * sin(a);
    circle(x, y, 7);           // fixed size
  }


  // lattice B（inter ring）
  noStroke();
  fill(ring.palette[1], alphaPulse);       // Use the spoke color to create a sense of layering
  let dotsB = max(3, int(currentR / 5));
  let rB = currentR * 0.26;      // The radius is significantly larger than the inner circle

  for (let i = 0; i < dotsB; i++){
    let a = i * TWO_PI / dotsB; 
    let x = rB * cos(a);
    let y = rB * sin(a);
    circle(x, y, 6);           
  }


  // center cap
  noStroke();
  fill(ring.palette[4], alphaPulse);
  circle(0, 0, currentR * 0.24);
  fill(random(colorSet));
  circle(0, 0, currentR * 0.12);
}

// ===== draw a Dots type circle (outer ring/spoke/middle ring/lattice/center cap) =====
function drawDotMandala(ring, currentR, alphaPulse){

    // spoke
  let nSpokes = 8;  //Number of lines
  strokeWeight(2);
  stroke(ring.palette[1], alphaPulse);

  for (let i = 0; i < nSpokes; i++){
    let ang = i * TWO_PI / nSpokes; 
    let x1 = currentR * 0.12 * cos(ang);
    let y1 = currentR * 0.12 * sin(ang);
    let x2 = currentR * 0.80 * cos(ang);
    let y2 = currentR * 0.80 * sin(ang);
    line(x1, y1, x2, y2);
  }


  // ---- inter ring ----
  let n1 = 8;                      // The number of inner circle points
  let r1 = currentR * 0.22;          // Inner circle radius
  let s1 = currentR * 0.10;          // The size of the inner circle point
  fill(ring.palette[2], alphaPulse);

  for (let i = 0; i < n1; i++){
    let a = i * TWO_PI / n1;
    let x = r1 * cos(a);
    let y = r1 * sin(a);
    circle(x, y, s1);
  }

  //---- middle ring ----
  let n2 = 19;
  let r2 = currentR * 0.52;
  let s2 = currentR * 0.08;
  fill(ring.palette[3], alphaPulse);

  for (let i = 0; i < n2; i++){
    let a = i * TWO_PI / n2;
    let x = r2 * cos(a);
    let y = r2 * sin(a);
    circle(x, y, s2);
  }

  // ---- outer ring ----
  let n3 = 24;
  let r3 = currentR * 0.55;
  let s3 = currentR * 0.09;
  fill(ring.palette[4], alphaPulse);

  for (let i = 0; i < n3; i++){
    let a = i * TWO_PI / n3;
    let x = r3 * cos(a);
    let y = r3 * sin(a);
    circle(x, y, s3);
  }

  // small circle in the center
  fill(ring.palette[0], alphaPulse);
  circle(0, 0, currentR * 0.20);
}