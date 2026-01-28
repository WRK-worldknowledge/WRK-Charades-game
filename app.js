
let allData=[], gameData=[], i=0, score=0, time=60, timer;
let mode='train', gameType='code-to-city';
let tiltState='neutral';

const failSound = new Audio("fail.mp3");

const moduleNames={
 'AFR':'Africa','EURW':'Western Europe','EURO':'Eastern Europe',
 'AM':'America','AUS':'Oceania','ASIA':'Asia'
};

fetch('iata.json').then(r=>r.json()).then(d=>{
 allData=d;
 const mods=[...new Set(d.map(x=>x.module))];
 const c=document.getElementById('modules');
 mods.forEach(m=>{
  c.innerHTML+=`<label><input type="checkbox" value="${m}" checked> ${moduleNames[m]||m}</label>`;
 });
});

function setMode(m){
 mode=m;
 document.getElementById('modules').style.display = m==='exam' ? 'none':'block';
}

function setGameType(t){ gameType=t; }

function startGame(){
 const checked=[...document.querySelectorAll('#modules input:checked')].map(x=>x.value);
 gameData = mode==='exam' ? allData.slice() : allData.filter(x=>checked.includes(x.module));
 gameData.sort(()=>Math.random()-0.5);

 document.getElementById('start').classList.add('hidden');
 document.getElementById('end').classList.add('hidden');
 document.getElementById('hint').classList.add('hidden');
 document.getElementById('game').classList.remove('hidden');

 score=0; i=0; time=60;
 timer=setInterval(tick,1000);
 initTilt();
 show();
}

function tick(){
 time--;
 document.getElementById('timer').innerText=`Time: ${time}s | Score: ${score}`;
 if(time<=0){ end(); }
}

function show(){
 if(i>=gameData.length){i=0;}
 const item=gameData[i];
 document.getElementById('code').innerText = (gameType==='city-to-code') ? item.city : item.code;
}

function flash(type){
 document.body.classList.add(type);
 setTimeout(()=>document.body.classList.remove(type),350);
}

function good(){
 if (navigator.vibrate) navigator.vibrate(60);
 score++;
 flash('flash-good');
 i++;
 show();
}

function skip(){
 if (navigator.vibrate) navigator.vibrate([100, 40, 100]);
 try { failSound.play(); } catch(e) {}

 flash('flash-bad');
 const item=gameData[i];
 const hint=document.getElementById('hint');
 hint.innerText = (gameType==='city-to-code') ? item.code + " — " + item.country : item.city + " — " + item.country;
 document.getElementById('game').classList.add('hidden');
 hint.classList.remove('hidden');

 setTimeout(()=>{
   hint.classList.add('hidden');
   document.getElementById('game').classList.remove('hidden');
   i++;
   show();
 },3000);
}

function end(){
 clearInterval(timer);
 document.getElementById('game').classList.add('hidden');
 document.getElementById('end').classList.remove('hidden');
 document.getElementById('score').innerText=`Final score: ${score}`;
}

function resetGame(){
 clearInterval(timer);
 tiltState='neutral';
 document.getElementById('end').classList.add('hidden');
 document.getElementById('game').classList.add('hidden');
 document.getElementById('hint').classList.add('hidden');
 document.getElementById('start').classList.remove('hidden');
}

function initTilt(){
 window.addEventListener("deviceorientation", handleTilt, true);
}

function handleTilt(e){
 const gamma = e.gamma; // gebruik links/rechts as i.p.v. beta
 if(gamma === null) return;

 // Drempels afgestemd op telefoon tegen voorhoofd (landscape)
 const FORWARD = -18;   // voorover = goed
 const BACK = 18;       // achterover = skip
 const NEUTRAL_MIN = -6;
 const NEUTRAL_MAX = 6;

 // Reset alleen als hij echt neutraal is
 if(gamma > NEUTRAL_MIN && gamma < NEUTRAL_MAX){
   tiltState = 'neutral';
   return;
 }

 // Voorover = goed
 if(gamma < FORWARD && tiltState === 'neutral'){
   tiltState = 'forward';
   good();
 }

 // Achterover = skip
 else if(gamma > BACK && tiltState === 'neutral'){
   tiltState = 'back';
   skip();
 }
}

