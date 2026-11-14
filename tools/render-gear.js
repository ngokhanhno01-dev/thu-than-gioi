/* Chụp thử buff bộ trang bị bằng node-canvas (không cần Chromium). Chạy ở gốc repo: npm i canvas && node tools/render-gear.js shield */
const {createCanvas}=require('canvas'),fs=require('fs'),P=require('path');
const root=P.join(__dirname,'..')+'/';global.window=global;
global.document={createElement:()=>createCanvas(10,10)};
const load=f=>(0,eval)(fs.readFileSync(root+f,'utf8'));
load('31-combat-fx.js');load('41-gear-aura.js');load('42-gear-pixel.js');
const kind=process.argv[2]||'shield',outDir=root+'tools/tam/';fs.mkdirSync(outDir,{recursive:true});
/* gọi thẳng để lộ lỗi (backGear nuốt lỗi) */
{const g=createCanvas(360,240).getContext('2d');
 for(const [T,e,q] of [[3.1,10,0],[.7,.7,1],[5.3,.2,.9]]){try{window.TTGGearAura[kind](g,85,q,T,e,TTGCombatFX.engine)}catch(err){console.log('LOI',kind,T,e,q,err.stack.split('\n').slice(0,3).join(' | '));process.exitCode=1}}}
for(const [label,el] of [['rest',10],['enter',.7]]){
 const cv=createCanvas(360,240),g=cv.getContext('2d');
 g.fillStyle='#1b2236';g.fillRect(0,0,360,240);g.fillStyle='#2a3350';g.fillRect(0,203,360,40);
 TTGCombatFX.drawBack(g,3.1,el,0,{startBuffs:[{kind}],zoneBuff:null},0,0,100,100,0,0);
 g.fillStyle='#d8b06a';g.beginPath();g.ellipse(85,165,22,34,0,0,Math.PI*2);g.fill();   /* thú giả */
 const big=createCanvas(720,480),G=big.getContext('2d');G.imageSmoothingEnabled=false;G.drawImage(cv,0,0,720,480);
 fs.writeFileSync(outDir+`gear_${kind}_${label}.png`,big.toBuffer('image/png'));
}
