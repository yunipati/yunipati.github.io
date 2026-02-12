(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let player = { x: W/2, y: H-50, w: 36, h: 12, speed: 5 };
  let bullets = [], enemies = [];
  let keys = {}, frame = 0, spawnRate = 70, score = 0, gameOver = false;
  let shootCooldown = 0;

  const scoreEl = document.getElementById('score');
  const goEl = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const restartBtn = document.getElementById('restart');

  function rand(min,max){ return Math.random()*(max-min)+min }

  function init(){
    bullets = []; enemies = []; keys = {}; frame = 0; score = 0; gameOver = false; shootCooldown = 0;
    player.x = W/2; scoreEl.textContent = '0'; goEl.classList.add('hidden');
    requestAnimationFrame(loop);
  }

  function spawnEnemy(){
    const w = rand(24,56);
    enemies.push({ x: rand(8, W-w-8), y: -20, w, h: w*0.6, speed: rand(1.2,3.2), hp: 1 });
  }

  function update(){
    frame++;
    if(++shootCooldown>6) shootCooldown = 6;

    // move player
    if(keys.left) player.x -= player.speed;
    if(keys.right) player.x += player.speed;
    player.x = Math.max(16, Math.min(W-16, player.x));

    // shooting
    if(keys.shoot && shootCooldown>=6){ bullets.push({ x: player.x, y: player.y-10, r:4, s:8 }); shootCooldown = 0 }

    // bullets
    for(let i=bullets.length-1;i>=0;i--){ bullets[i].y -= bullets[i].s; if(bullets[i].y < -10) bullets.splice(i,1) }

    // spawn enemies
    if(frame % spawnRate === 0) spawnEnemy();
    if(frame % 1200 === 0 && spawnRate>30) spawnRate -= 3;

    // enemies
    for(let i=enemies.length-1;i>=0;i--){
      const e = enemies[i]; e.y += e.speed;
      // collide with bullets
      for(let j=bullets.length-1;j>=0;j--){
        const b = bullets[j];
        if(rectCircleCollide(e.x,e.y,e.w,e.h,b.x,b.y,b.r)){
          enemies.splice(i,1); bullets.splice(j,1); score += 10; scoreEl.textContent = score; break;
        }
      }
      if(i>=0 && e.y > H+20){ enemies.splice(i,1); }
      // collide with player
      if(i>=0 && rectsOverlap(e.x,e.y,e.w,e.h, player.x- player.w/2, player.y - player.h/2, player.w, player.h)){
        endGame(); return; }
    }
  }

  function rectCircleCollide(rx,ry,rw,rh,cx,cy,cr){
    const closestX = Math.max(rx, Math.min(cx, rx+rw));
    const closestY = Math.max(ry, Math.min(cy, ry+rh));
    const dx = cx - closestX, dy = cy - closestY;
    return (dx*dx + dy*dy) <= cr*cr;
  }

  function rectsOverlap(x1,y1,w1,h1,x2,y2,w2,h2){
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // player (triangle)
    ctx.fillStyle = '#6ef';
    ctx.beginPath(); ctx.moveTo(player.x, player.y-12); ctx.lineTo(player.x-18, player.y+10); ctx.lineTo(player.x+18, player.y+10); ctx.closePath(); ctx.fill();

    // bullets
    ctx.fillStyle = '#ffd'; for(const b of bullets){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }

    // enemies
    ctx.fillStyle = '#f66'; for(const e of enemies){ ctx.fillRect(e.x, e.y, e.w, e.h); }

    // score is in DOM
  }

  function loop(){ if(gameOver) return; update(); draw(); requestAnimationFrame(loop); }

  function endGame(){ gameOver = true; finalScoreEl.textContent = score; goEl.classList.remove('hidden'); }

  // input
  window.addEventListener('keydown', e => { if(e.code==='ArrowLeft' || e.key==='a') keys.left = true; if(e.code==='ArrowRight' || e.key==='d') keys.right = true; if(e.code==='Space') keys.shoot = true; });
  window.addEventListener('keyup', e => { if(e.code==='ArrowLeft' || e.key==='a') keys.left = false; if(e.code==='ArrowRight' || e.key==='d') keys.right = false; if(e.code==='Space') keys.shoot = false; });

  // touch / click for mobile: tap left/right halves to move, double-tap to shoot
  let lastTap = 0;
  canvas.addEventListener('touchstart', (ev)=>{
    ev.preventDefault(); const t = ev.touches[0]; const rect = canvas.getBoundingClientRect(); const x = t.clientX - rect.left;
    if(x < W/2){ keys.left = true; } else { keys.right = true; }
    const now = Date.now(); if(now - lastTap < 300){ keys.shoot = true; setTimeout(()=>keys.shoot=false,80); }
    lastTap = now;
  }, {passive:false});
  canvas.addEventListener('touchend', ()=>{ keys.left=false; keys.right=false });

  restartBtn.addEventListener('click', init);

  // start
  init();

})();
