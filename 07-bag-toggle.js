document.querySelectorAll("details.bagbox").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll("details.bagbox").forEach(o=>{if(o!==d)o.open=false})}))
window.arena=function(){log("⚔️ Đấu trường: cập nhật tiếp theo.")};
