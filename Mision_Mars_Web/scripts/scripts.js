let particles = [];
let simState = 'idle'; // idle, launch, warp, approach, landed
let rocketY;
let marsZ = -5000;
let warpTimer = 0;

function setup() {
  let canvas = createCanvas(displayWidth, windowHeight, WEBGL);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  for (let i = 0; i < 800; i++) {
    particles.push(new Particle());
  }
  rocketY = height / 2 + 200;
}

function draw() {
  if (simState === 'landed') {
      background(160, 40, 0); // Mars surface color
  } else {
      background(0);
  }

  // Add lights for 3D
  ambientLight(100);
  pointLight(255, 255, 255, 0, -200, 200);

  // --- Particle Logic ---
  if (simState === 'warp') {
      for (let particle of particles) {
          particle.warp();
      }
  } else if (simState !== 'landed') {
      for (let particle of particles) {
          particle.display();
          particle.move();
      }
  }

  // --- Simulation States ---
  if (simState === 'launch') {
      // Earth at bottom
      noStroke();
      fill(0, 100, 255);
      push();
      translate(0, height / 2 + 400, -500);
      rotateX(frameCount * 0.01);
      sphere(800);
      pop();

      // Rocket moves up
      rocketY = lerp(rocketY, 0, 0.05);
      drawRocket(0, rocketY, 0);

      if (abs(rocketY) < 5) {
          simState = 'warp';
          warpTimer = 0;
      }
  } else if (simState === 'warp') {
      // Rocket shakes at center
      drawRocket(random(-2, 2), random(-2, 2), 0);
      warpTimer++;
      if (warpTimer > 200) { // Warp duration
          simState = 'approach';
          marsZ = -5000;
      }
  } else if (simState === 'approach') {
      // Mars approaches
      noStroke();
      fill(200, 50, 0);
      push();
      translate(0, 0, marsZ);
      rotateY(frameCount * 0.01);
      sphere(400);
      pop();
      
      marsZ += 30;
      drawRocket(0, 0, 0);

      if (marsZ > -600) {
          simState = 'landed';
          document.getElementById('mars-message').style.display = 'block';
          document.getElementById('return-mission-btn').style.display = 'block';
      }
  } else if (simState === 'landed') {
      // Ground
      push();
      translate(0, 200, 0);
      rotateX(HALF_PI);
      fill(140, 30, 0);
      plane(3000, 3000);
      pop();
      
      drawRocket(0, 150, 0);
  }
}

function drawRocket(x, y, z) {
    push();
    translate(x, y, z);
    rotateZ(PI); // Flip to point up
    rotateY(frameCount * 0.05); // Spin
    noStroke();
    
    // Low Poly Body
    fill(220);
    cylinder(15, 60);
    
    // Nose Cone
    push();
    translate(0, 40, 0);
    fill(255, 0, 0);
    cone(15, 30);
    pop();

    // Fins
    fill(150);
    // Simple box fins
    box(50, 10, 2);
    box(2, 10, 50);

    // Flame
    if (simState === 'launch' || simState === 'warp') {
        translate(0, -40, 0);
        rotateX(PI);
        fill(255, 100, 0);
        cone(10, 40 + random(10));
    }
    pop();
}

class Particle {
  constructor() {
    // 3D coordinates centered
    this.pos = createVector(random(-width, width), random(-height, height), random(-2000, 1000));
    this.size = random(0.5, 2);
    this.alpha = random(150, 255);
    this.noiseOffset = random(0, 1000);
    this.rate = random(-1, 1); 
    this.vertRate = random(-1, 1); 
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(255, this.alpha);
    sphere(this.size);
    pop();
  }

  move() {
    let noiseValue = noise(this.noiseOffset);
    this.pos.x += map(noiseValue, 0, 1, -1, 1) * this.rate;
    this.pos.y += map(noiseValue, 0, 1, -1, 1) * this.vertRate;
    
    // Wrap around logic for centered coordinates
    if (this.pos.x > width) this.pos.x = -width;
    if (this.pos.x < -width) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = -height;
    if (this.pos.y < -height) this.pos.y = height;

    this.noiseOffset += 0.01;
  }

  warp() {
      stroke(255);
      strokeWeight(2);
      
      // Move towards camera (positive Z)
      this.pos.z += 60;
      
      // Draw streak line
      let streakLength = 300;
      line(this.pos.x, this.pos.y, this.pos.z, this.pos.x, this.pos.y, this.pos.z - streakLength);
      
      // Reset if passes camera
      if (this.pos.z > 500) {
          this.pos.z = -2000;
          this.pos.x = random(-width, width);
          this.pos.y = random(-height, height);
      }
  }
}

const sitePages = [
    { name: 'Search', link: '#search' },
    { name: 'test1', link: 'pages/test1.html' },
    { name: 'test2', link: 'pages/test2.html'},
    { name: 'Home', link: 'index.html' },
    { name: 'About', link: 'pages/about.html' },
    { name: 'Projects', link: 'pages/projects.html' },
    { name: 'Contact', link: 'pages/contact.html' }
];

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerHTML = `
        <div class="hamburger-menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>`;
    const navMenuHTML = `
        <nav class="nav-menu">
            <ul></ul>
        </nav>`;
    const searchHTML = `
        <div id="search-overlay">
            <input type="text" placeholder="Search...">
            <button id="close-search">&times;</button>
        </div>`;
    
    document.body.insertAdjacentHTML('afterbegin', navMenuHTML);
    document.body.insertAdjacentHTML('afterbegin', hamburgerHTML);
    document.body.insertAdjacentHTML('afterbegin', searchHTML);

    const isInPagesFolder = window.location.pathname.toLowerCase().includes('/pages/');
    // Character
    const characterImageSrc = isInPagesFolder ? '../Among-Us.png' : 'Among-Us.png';
    const characterHTML = `<img src="${characterImageSrc}" id="ejected-character" alt="Ejected character" style="display: none;">`;
    document.body.insertAdjacentHTML('beforeend', characterHTML);
    // Sound Effect
    const soundSrc = isInPagesFolder ? '../among-us-eject-sound-effect.mp3' : 'among-us-eject-sound-effect.mp3';
    const audioHTML = `<audio id="eject-sound" src="${soundSrc}" preload="auto"></audio>`;
    document.body.insertAdjacentHTML('beforeend', audioHTML);
    // Impostor Message
    const impostorMessageHTML = `<div id="impostor-message">Red Was The Impostor</div>`;
    document.body.insertAdjacentHTML('beforeend', impostorMessageHTML);

    // Mars Message
    const marsMessageHTML = `<div id="mars-message">You landed on Mars.<br>Explore.</div>`;
    document.body.insertAdjacentHTML('beforeend', marsMessageHTML);

    // Start Mission Button
    const btnHTML = `<button id="start-mission-btn">Start Mission</button>`;
    document.body.insertAdjacentHTML('beforeend', btnHTML);

    // Return Mission Button
    const returnBtnHTML = `<button id="return-mission-btn">Return to Earth</button>`;
    document.body.insertAdjacentHTML('beforeend', returnBtnHTML);

    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    const menuList = navMenu.querySelector('ul');

    sitePages.forEach(page => {
        const li = document.createElement('li');

        if (page.link === '#search') {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = page.name;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('search-overlay').classList.add('active');
                navMenu.classList.remove('active');
            });
            li.appendChild(a);
        } else {
            let adjustedLink = page.link;
            if (isInPagesFolder && !page.link.startsWith('http') && !page.link.startsWith('#')) {
                adjustedLink = '../' + page.link;
            }
            li.innerHTML = `<a href="${adjustedLink}">${page.name}</a>`;
        }
        
        menuList.appendChild(li);
    });

    const showMenu = () => navMenu.classList.add('active');
    const hideMenu = () => setTimeout(() => {
        if (!navMenu.matches(':hover') && !hamburger.matches(':hover')) {
            navMenu.classList.remove('active');
        }
    }, 200);

    hamburger.addEventListener('mouseenter', showMenu);
    hamburger.addEventListener('mouseleave', hideMenu);
    navMenu.addEventListener('mouseleave', hideMenu);

    document.getElementById('close-search').addEventListener('click', () => {
        document.getElementById('search-overlay').classList.remove('active');
    });

    // --- Search Functionality (Google) ---
    const searchInput = document.querySelector('#search-overlay input');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            if (query) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            }
        }
    });

    // --- Start Mission Logic ---
    document.getElementById('start-mission-btn').addEventListener('click', () => {
        simState = 'launch';
        rocketY = height / 2 + 200;
        document.getElementById('start-mission-btn').style.display = 'none'; // Hide button
    });

    // --- Return Mission Logic ---
    document.getElementById('return-mission-btn').addEventListener('click', () => {
        simState = 'idle';
        document.getElementById('return-mission-btn').style.display = 'none';
        document.getElementById('mars-message').style.display = 'none';
        document.getElementById('start-mission-btn').style.display = 'block';
    });

    // --- Among Us Ejection Animation ---
    // Press 'e' to trigger the animation
    document.addEventListener('keydown', (event) => {
        // Check 1: Is the keydown event firing? You should see this in the console for every key press.
        console.log(`Key pressed: ${event.key}`);

        if (event.key === 'e') {
            const character = document.getElementById('ejected-character');
            // Check 2: Did we find the image element? This should log the <img> tag. If it's null, the HTML is the issue.
            console.log('Attempting to find #ejected-character:', character);
            
            // Check if character exists and is not already animating
            if (character && !character.classList.contains('ejecting')) {
                // Check 3: Are we trying to trigger the animation? You should see this if the element was found.
                console.log('Triggering ejection animation...');
                
                // Play sound effect
                const ejectSound = document.getElementById('eject-sound');
                if (ejectSound) {
                    ejectSound.currentTime = 0; // Rewind to start in case it's played again quickly
                    ejectSound.play();
                }

                character.style.display = 'block'; // Make it visible before animating
                character.classList.add('ejecting');

                // After animation ends, hide it and remove the class to allow re-triggering
                character.addEventListener('animationend', () => {
                    // Show the impostor message
                    const impostorMessage = document.getElementById('impostor-message');
                    impostorMessage.classList.add('show');
                    impostorMessage.addEventListener('animationend', () => impostorMessage.classList.remove('show'), { once: true });

                    character.classList.remove('ejecting');
                    character.style.display = 'none';
                }, { once: true });
            }
        }
    });
});
