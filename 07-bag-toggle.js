document.querySelectorAll("details.bagbox").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll("details.bagbox").forEach(o=>{if(o!==d)o.open=false})}))
// window.arena được 26-arena.js ghi đè — không còn placeholder
