
/* ===== Quái & Boss ===== */
/* 17 vùng: mỗi vùng gồm 5 quái thường + 1 boss. */
const VAN_KIEP_ZONES = [
  { name:'Tuyết Nguyên', buff:{stat:'def',pct:6,label:'Hàn Giáp',desc:'+6% Thủ'}, mobs:['Băng Vĩ Linh Miêu','Tuyết Giáp Bọ','Băng Tinh Chồn','Lam Vũ Tuyết Điêu','Bạch Sương U Linh'],bosses:['Băng Tủy Tướng Quân'], lore:'Gió tuyết che kín dấu chân, chỉ để lộ những vệt linh lực xanh bạc.' },
  { name:'Sương Cốc', buff:{stat:'regen',pct:4,label:'Sương Tức',desc:'+4% Hồi phục'}, mobs:['Sương Vũ Lộc','Mù Sương Dơi','Vụ Giáp Ngưu','Bạch Thủy Ếch','Sương Nham Thiềm'],bosses:['Vạn Trượng Vụ Thú'], lore:'Làn sương dày làm méo tiếng động và đánh thức linh vật trong khe đá.' },
  { name:'Vân Đảo', buff:{stat:'mag',pct:6,label:'Vân Linh',desc:'+6% Linh lực'}, mobs:['Vân Miên Phi Điểu','Phù Thạch Thạch Nhân','Vân Tước','Tinh Vân Mộc Linh','Mộng Vân Hạc'],bosses:['Vân Hải Kình Vương'], lore:'Những đảo đá trôi giữa mây gọi các linh thú bay lượn về tụ hội.' },
  { name:'Phong Nguyên', buff:{stat:'spd',pct:7,label:'Phong Hành',desc:'+7% Tốc độ'}, mobs:['Liệt Phong Ảnh Báo','Bão Cát Sa Tích','Phong Nhận Bọ Ngựa','Hạc Lưu Phong','Phi Diệp Mộc Tinh'],bosses:['Phong Tai Cự Linh'], lore:'Luồng gió xoáy mang theo bụi linh thạch và những sinh vật săn mồi.' },
  { name:'Lôi Vực', buff:{stat:'crit',pct:6,label:'Lôi Kích',desc:'+6% Chí mạng'}, mobs:['Lôi Nha Tê','Sấm Vảy Thằn Lằn','Lôi Tâm Thạch Nhân','Tử Điện Ưng','Lôi Tơ Nhện'],bosses:['Thiên Lôi Đốc Quân'], lore:'Sấm chớp tích tụ trong tầng mây, khiến giáp và móng vuốt phát sáng.' },
  { name:'Nguyệt Cung', buff:{stat:'eva',pct:6,label:'Nguyệt Ảnh',desc:'+6% Né tránh'}, mobs:['Nguyệt Ảnh Miêu','Ngân Quang Dơi','Nguyệt Quế Mộc Tinh','Nguyệt Sa Thủy Xà','Tinh Đăng Cú'],bosses:['Nguyệt Thực Tế Quân'], lore:'Ánh trăng biến bóng cây thành lối đi, còn những chiếc bóng bắt đầu chuyển động.' },
  { name:'Dương Sơn', buff:{stat:'atk',pct:6,label:'Dương Diệm',desc:'+6% Công'}, mobs:['Thổ Nham Sơn Hùng','Dương Quang Bọ Hung','Lửa Vàng Sơn Miêu','Hỏa Châm Nhím','Đồi Cát Cự Nhện'],bosses:['Dương Diệm Sơn Chủ'], lore:'Nắng gắt nung đỏ vách núi, đánh thức những sinh vật trú sâu dưới lòng đất.' },
  { name:'Huyền Uyên', buff:{stat:'def',pct:8,label:'Uyên Giáp',desc:'+8% Thủ'}, mobs:['U Uyên Ma Chồn','Hố Sâu Thạch Trùng','Tịch Ảnh Dơi','Hắc Thạch Dạ Xoa','Vạn Tơ U Xà'],bosses:['Huyền Uyên Trấn Giới'], lore:'Hố sâu nuốt mất ánh sáng, chỉ còn những đốm mắt dõi theo kẻ lạc đường.' },
  { name:'Kim Khoáng', buff:{stat:'def',pct:7,label:'Kim Cương',desc:'+7% Thủ'}, mobs:['Kim Giáp Tê','Bạc Cánh Bọ','Thiếc Giáp Tê Tê','Ngân Nha Chuột','Cổ Kim Cự Kê'],bosses:['Kim Sơn Khai Mạch'], lore:'Mạch quặng cổ rung lên, gọi bầy sinh vật khoáng thạch về bảo vệ tổ.' },
  { name:'Ngọc Động', buff:{stat:'def',pct:6,label:'Ngọc Hộ',desc:'+6% Thủ'}, mobs:['Bích Ngọc Thạch Tằm','Ngọc Tâm Ếch','Huyết Ngọc Miêu','Lưu Ly Thủy Xà','Lam Ngọc Cú'],bosses:['Ngọc Tủy Thánh Thể'], lore:'Tinh thể trong vách động cộng hưởng, tạo lớp hộ thể quanh các linh vật.' },
  { name:'Thanh Lâm', buff:{stat:'regen',pct:5,label:'Mộc Linh',desc:'+2.5% Hồi phục mỗi lượt'}, mobs:["Linh Chi Lộc","Bách Diệp Thạch Ếch","Rêu Giáp Sơn Dê","Sương Mộc Nhện","Rừng Sâu Báo"],bosses:["Cổ Thụ Thủ Lâm"], lore:'Rễ cây quấn quanh đá cổ, hút linh khí và chữa lành mọi vết thương.' },
  { name:'Xích Hỏa Địa', buff:{stat:'atk',pct:6,label:'Xích Diệm',desc:'+6% Công'}, mobs:["Nham Tích Viêm Giáp","Hồng Nham Bọ Cạp","Dung Nham Tê","Hỏa Tâm Thạch Nhân","Thiêu Đốt Sa Lang"],bosses:["Nham Hạch Thái Thú"], lore:'Khe dung nham phun trào, để lộ những vảy giáp đỏ rực dưới tro tàn.' },
  { name:'Hắc Ám Lâm', buff:{stat:'eva',pct:6,label:'U Ảnh',desc:'+6% Né tránh'}, mobs:["Hắc Diệp Cốt Thú","Bóng Đêm Bọ","Mộng Yểm Mộc Linh","U Hỏa Cự Miêu","Mộ Lâm Thạch Quỷ"],bosses:["Hắc Nhật Tàn Quân"], lore:'Rừng đen không có bình minh; ma ảnh trỗi dậy mỗi khi linh lực chạm đất.' },
  { name:'Tử Tinh Hải', buff:{stat:'crit',pct:7,label:'Tinh Quang',desc:'+7% Chí mạng'}, mobs:["Tử Tinh Hải Ngư","Phấn Tinh Bọ","Tử Tinh Cự Ốc","Hắc Thủy Cá Đao","Thủy Tinh Hạc"],bosses:["Thủy Tinh Hải Vương"], lore:'Ánh sao phản chiếu dưới đáy biển, dẫn những sinh vật cổ xưa trồi lên.' },
  { name:'Thiên Không', buff:{stat:'spd',pct:7,label:'Thiên Vũ',desc:'+7% Tốc độ'}, mobs:["Vân Tầng Phi Mã","Thiên Trụ Thạch Nhân","Lam Vũ Hạc","Tinh Khe Dơi","Cánh Bạc Chim Ưng"],bosses:["Thiên Không Vương"], lore:'Tầng mây mỏng mở ra đường bay đến những cột đá lơ lửng trên cao.' },
  { name:'Linh Hoa Viên', buff:{stat:'mag',pct:7,label:'Hoa Linh',desc:'+7% Linh lực'}, mobs:['Hồng Liên Phấn Điệp','Mộc Lan Cự Ong','Ngọc Diệp Tinh','Thủy Tiên Thủy Xà','Lục Tán Cự Ếch'],bosses:['Bách Hoa Tiên Chủ'], lore:'Hương hoa làm dịu độc khí, nhưng phấn sáng cũng báo hiệu lãnh địa có chủ.' },
  { name:'Thần Điện', buff:{stat:'atk',pct:8,label:'Thần Ân',desc:'+8% Công'}, mobs:['Thần Điện Kim Tượng','Thần Văn Thiên Xà','Thánh Ấn Bạch Hạc','Trụ Đá Khổng Lồ','Thần Quang Mộc Linh'],bosses:['Thập Nhị Quang Tướng'], lore:'Cổ tự phát sáng dưới nền điện, đánh thức những hộ vệ đã ngủ qua nhiều kỷ nguyên.' }
];

const VAN_KIEP_ZONE_SKILLS=[0,10,1,3,4,9,11,8,8,9,12,11,14,4,3,10,16];
const VAN_KIEP_PALETTES=[
  {dark:'#294b73',base:'#78bde5',light:'#d8f7ff',accent:'#69dfff',glow:'#a7f3ff'},
  {dark:'#263b3a',base:'#5e9189',light:'#d9fff2',accent:'#9fd9c8',glow:'#d0f5e8'},
  {dark:'#352a66',base:'#8172c4',light:'#f0ddff',accent:'#c9a8ff',glow:'#f3e6ff'},
  {dark:'#194b37',base:'#48a878',light:'#d9ffe8',accent:'#82f0bb',glow:'#a0ffd0'},
  {dark:'#252044',base:'#6657a2',light:'#fff4b4',accent:'#ffe53a',glow:'#fff3a0'},
  {dark:'#20254f',base:'#5967b4',light:'#f0f2ff',accent:'#a8b8ff',glow:'#e2e5ff'},
  {dark:'#54200e',base:'#c06a30',light:'#fff0b0',accent:'#ffa030',glow:'#ffd17a'},
  {dark:'#10101f',base:'#383852',light:'#c1c1dd',accent:'#5a6cff',glow:'#c04aff'},
  {dark:'#49320b',base:'#b88a28',light:'#fff2b8',accent:'#e0b038',glow:'#ffe16b'},
  {dark:'#073d31',base:'#259a7a',light:'#d8fff0',accent:'#18e0b0',glow:'#9affdf'},
  {dark:'#163b21',base:'#458a40',light:'#f0ffc0',accent:'#8be04a',glow:'#bcf47a'},
  {dark:'#45120c',base:'#a3381f',light:'#ffc070',accent:'#ff5a1e',glow:'#ff9b4e'},
  {dark:'#211326',base:'#533a63',light:'#e5c6ee',accent:'#b0206a',glow:'#ff4a6a'},
  {dark:'#32104e',base:'#6d35a0',light:'#ffd0ff',accent:'#b45cff',glow:'#e5a6ff'},
  {dark:'#315d88',base:'#78add9',light:'#ffffff',accent:'#6ac4ff',glow:'#bce7ff'},
  {dark:'#512344',base:'#b04a8c',light:'#ffe0f0',accent:'#ff7ac0',glow:'#ffc6e5'},
  {dark:'#4a3408',base:'#a8842a',light:'#ffffff',accent:'#fff0a0',glow:'#ffe485'}
];
const VAN_KIEP_FORMS=[
  {form:'wolf',look:'hu',bl:'hu',pr:[.90,1.05,.88,1.18,.92],eva:7,crit:3,stun:0,regen:0,skill:3,t:.84},
  {form:'mushroom',look:'long',bl:'long',pr:[1.04,.82,1.02,.78,1.18],eva:0,crit:0,stun:0,regen:3,skill:12,t:.88},
  {form:'lava',look:'tuoc',bl:'tuoc',pr:[1.10,1.18,.90,.86,1.02],eva:0,crit:4,stun:5,regen:0,skill:11,t:.82},
  {form:'beetle',look:'vu',bl:'ho',pr:[1.08,.86,1.30,.72,.78],eva:0,crit:2,stun:0,regen:0,skill:9,t:.92},
  {form:'bear',look:'ho',bl:'lan',pr:[1.42,1.08,1.10,.62,.76],eva:0,crit:0,stun:5,regen:0,skill:16,t:.78},
  {form:'demon',look:'tuoc',bl:'hu',pr:[.92,1.12,.88,1.04,1.18],eva:4,crit:7,stun:2,regen:0,skill:4,t:.84},
  {form:'winged',look:'tuoc',bl:'tuoc',pr:[.84,1.02,.80,1.34,1.10],eva:7,crit:5,stun:0,regen:0,skill:3,t:.83},
  {form:'serpent',look:'long',bl:'vu',pr:[1.00,1.02,.96,1.12,1.02],eva:4,crit:2,stun:3,regen:1,skill:0,t:.84},
  {form:'crab',look:'vu',bl:'ho',pr:[1.16,.92,1.24,.68,.82],eva:0,crit:0,stun:3,regen:0,skill:7,t:.90},
  {form:'golem',look:'lan',bl:'lan',pr:[1.32,1.00,1.32,.55,.88],eva:0,crit:0,stun:4,regen:1,skill:8,t:.81},
  {form:'moth',look:'hu',bl:'hu',pr:[.82,.96,.78,1.16,1.22],eva:8,crit:4,stun:0,regen:1,skill:10,t:.82},
  {form:'tree',look:'long',bl:'long',pr:[1.16,.84,1.06,.72,1.18],eva:0,crit:0,stun:0,regen:4,skill:12,t:.85},
  {form:'fish',look:'vu',bl:'vu',pr:[.98,.96,.90,1.22,1.06],eva:6,crit:2,stun:0,regen:1,skill:0,t:.82},
  {form:'crystal',look:'lan',bl:'ho',pr:[1.00,1.12,1.22,.70,1.06],eva:0,crit:5,stun:0,regen:0,skill:8,t:.88},
  {form:'turtle',look:'vu',bl:'vu',pr:[1.30,.76,1.40,.52,.90],eva:0,crit:0,stun:2,regen:2,skill:9,t:.92},
  {form:'stag',look:'lan',bl:'lan',pr:[1.08,.98,1.00,.94,1.08],eva:2,crit:3,stun:4,regen:1,skill:16,t:.82},
  {form:'scorpion',look:'tuoc',bl:'tuoc',pr:[.96,1.14,.94,.98,.90],eva:2,crit:4,stun:6,regen:0,skill:11,t:.82},
  {form:'spirit',look:'hu',bl:'hu',pr:[.88,.94,.86,1.10,1.28],eva:8,crit:4,stun:0,regen:2,skill:14,t:.80},
  {form:'flower',look:'long',bl:'long',pr:[.92,.88,.92,.86,1.28],eva:2,crit:3,stun:0,regen:3,skill:10,t:.82},
  {form:'dragon',look:'tuoc',bl:'tuoc',pr:[1.10,1.18,1.04,.90,1.12],eva:0,crit:5,stun:4,regen:0,skill:11,t:.79}
];
const VAN_KIEP_BOSS_PROFILES=[
  {form:'golem',look:'lan',bl:'lan',pr:[1.42,1.14,1.28,.74,1.02],eva:2,crit:6,stun:8,regen:2,skill:9,t:.72},
  {form:'dragon',look:'tuoc',bl:'tuoc',pr:[1.28,1.34,1.08,.96,1.20],eva:3,crit:9,stun:5,regen:1,skill:4,t:.70},
  {form:'demon',look:'hu',bl:'hu',pr:[1.38,1.30,1.20,1.02,1.30],eva:7,crit:12,stun:9,regen:2,skill:16,t:.66}
];
const VAN_KIEP_SPECIALS={
  'Băng Vĩ Linh Miêu':{form:'cat',look:'hu',bl:'hu',pr:[1,1.2,.8,1.3,.7],t:.86,eva:10,crit:0,stun:0,regen:0,pal:{dark:'#294b73',base:'#78bde5',light:'#d8f7ff',accent:'#69dfff',glow:'#a7f3ff'}},
  'Linh Chi Lộc':{form:'fungalStag',look:'long',bl:'long',pr:[1.2,.8,1.2,.8,1],t:.88,eva:0,crit:0,stun:0,regen:4,pal:{dark:'#24533d',base:'#46a96a',light:'#d9ffb0',accent:'#fa9b78',glow:'#baff83'}},
  'Nham Tích Viêm Giáp':{form:'lizard',look:'lan',bl:'tuoc',pr:[1.3,1.1,1.2,.5,.9],t:.79,eva:0,crit:0,stun:12,regen:0,pal:{dark:'#43282b',base:'#895148',light:'#e5a067',accent:'#ff6729',glow:'#ffd052'}},
  'Kim Giáp Tê':{form:'rhino',look:'vu',bl:'ho',pr:[.9,1,1.5,.8,.8],t:.99,eva:0,crit:15,stun:0,regen:0,pal:{dark:'#583d12',base:'#c18a24',light:'#fff0a0',accent:'#74d7d3',glow:'#ffe16b'}},
  'Thổ Nham Sơn Hùng':{form:'bear',look:'ho',bl:'lan',pr:[1.5,1.2,1,.6,.7],t:.70,eva:0,crit:0,stun:10,regen:0,pal:{dark:'#51331f',base:'#95623a',light:'#e5c48d',accent:'#78bd75',glow:'#a8df73'}},
  'U Vực Ma Quân':{form:'wraith',look:'tuoc',bl:'hu',pr:[1.5,1.2,1,.8,1.1],t:.5,eva:12,crit:10,stun:10,regen:0,pal:{dark:'#28153a',base:'#68408a',light:'#d1a7f0',accent:'#ff4668',glow:'#df6bff'}}
};
const VAN_KIEP_PHASE1_SPECIALS={
  "Băng Vĩ Linh Miêu":{form:"cat",bl:"vu",pr:[0.9,1.02,0.82,1.35,0.81],t:0.86,eva:12,crit:5,stun:0,regen:0,ks:[3,0]},
  "Tuyết Giáp Bọ":{form:"beetle",bl:"ho",pr:[1.12,0.82,1.38,0.64,0.84],t:0.92,eva:0,crit:1,stun:2,regen:0,ks:[9,2]},
  "Băng Tinh Chồn":{form:"weasel",bl:"vu",pr:[0.85,0.95,0.82,1.4,0.9],t:0.85,eva:11,crit:6,stun:0,regen:0,ks:[4,3]},
  "Lam Vũ Tuyết Điêu":{form:"eagle",bl:"hu",pr:[0.83,0.92,0.78,1.46,1.02],t:0.84,eva:12,crit:6,stun:0,regen:0,ks:[0,4]},
  "Bạch Sương U Linh":{form:"spirit",bl:"hu",pr:[0.88,0.82,0.88,1.02,1.42],t:0.82,eva:8,crit:6,stun:1,regen:1,ks:[14,10]},
  "Băng Tủy Tướng Quân":{form:"minotaur",bl:"vu",pr:[1.28,1.12,1.28,0.78,1.24],t:0.7,eva:2,crit:7,stun:8,regen:2,ks:[9,16,8]},
  "Sương Vũ Lộc":{form:"stag",bl:"long",pr:[1.08,0.8,1.0,1.12,0.92],t:0.88,eva:4,crit:2,stun:2,regen:4,ks:[12,10]},
  "Mù Sương Dơi":{form:"bat",bl:"hu",pr:[0.82,0.94,0.78,1.48,0.96],t:0.82,eva:13,crit:7,stun:0,regen:0,ks:[4,0]},
  "Vụ Giáp Ngưu":{form:"ox",bl:"ho",pr:[1.32,0.9,1.34,0.62,0.8],t:0.86,eva:0,crit:0,stun:5,regen:0,ks:[2,7]},
  "Bạch Thủy Ếch":{form:"frog",bl:"vu",pr:[0.98,0.94,0.9,1.16,0.94],t:0.84,eva:5,crit:2,stun:0,regen:1,ks:[12,1]},
  "Sương Nham Thiềm":{form:"toad",bl:"lan",pr:[1.2,0.78,1.28,0.64,1.0],t:0.9,eva:0,crit:1,stun:5,regen:2,ks:[10,2]},
  "Vạn Trượng Vụ Thú":{form:"spirit",bl:"hu",pr:[1.3,1.1,1.18,0.88,1.28],t:0.7,eva:4,crit:7,stun:5,regen:3,ks:[11,14,0]},
  "Vân Miên Phi Điểu":{form:"dragon",bl:"hu",pr:[0.9,1.02,0.82,1.34,0.94],t:0.84,eva:7,crit:5,stun:1,regen:0,ks:[3,0]},
  "Phù Thạch Thạch Nhân":{form:"golem",bl:"lan",pr:[1.36,0.9,1.42,0.58,0.8],t:0.82,eva:0,crit:0,stun:6,regen:1,ks:[9,2]},
  "Vân Tước":{form:"sparrow",bl:"vu",pr:[0.8,0.92,0.76,1.48,1.02],t:0.83,eva:13,crit:7,stun:0,regen:0,ks:[4,3]},
  "Tinh Vân Mộc Linh":{form:"tree",bl:"long",pr:[1.05,0.8,1.0,0.72,1.42],t:0.84,eva:1,crit:2,stun:0,regen:5,ks:[12,10]},
  "Mộng Vân Hạc":{form:"crane",bl:"vu",pr:[0.84,0.92,0.8,1.42,0.95],t:0.82,eva:8,crit:4,stun:0,regen:0,ks:[0,4]},
  "Vân Hải Kình Vương":{form:"whale",bl:"vu",pr:[1.4,1.08,1.3,0.74,1.2],t:0.7,eva:2,crit:5,stun:8,regen:2,ks:[2,7,16]},
  "Liệt Phong Ảnh Báo":{form:"panther",bl:"hu",pr:[0.88,1.26,0.82,1.35,0.72],t:0.82,eva:10,crit:11,stun:0,regen:0,ks:[4,8]},
  "Bão Cát Sa Tích":{form:"lizard",bl:"lan",pr:[0.98,1.1,1.12,0.96,0.88],t:0.86,eva:1,crit:3,stun:3,regen:0,ks:[11,9]},
  "Phong Nhận Bọ Ngựa":{form:"mantis",bl:"ho",pr:[0.88,1.3,0.78,1.18,0.84],t:0.84,eva:6,crit:12,stun:0,regen:0,ks:[3,8]},
  "Hạc Lưu Phong":{form:"crane",bl:"vu",pr:[0.82,0.92,0.78,1.48,0.95],t:0.82,eva:10,crit:4,stun:0,regen:0,ks:[0,1]},
  "Phi Diệp Mộc Tinh":{form:"tree",bl:"long",pr:[1.04,0.84,1.02,0.74,1.36],t:0.84,eva:1,crit:2,stun:0,regen:5,ks:[12,10]},
  "Phong Tai Cự Linh":{form:"golem",bl:"long",pr:[1.36,1.16,1.25,0.82,1.2],t:0.7,eva:4,crit:8,stun:6,regen:3,ks:[16,3,11]},
  "Lôi Nha Tê":{form:"rhino",bl:"ho",pr:[1.38,1.1,1.2,0.7,0.66],t:0.9,eva:0,crit:4,stun:5,regen:0,ks:[2,8]},
  "Sấm Vảy Thằn Lằn":{form:"lizard",bl:"tuoc",pr:[0.98,1.24,0.9,1.08,0.86],t:0.84,eva:3,crit:10,stun:2,regen:0,ks:[11,4]},
  "Lôi Tâm Thạch Nhân":{form:"golem",bl:"lan",pr:[1.34,0.92,1.4,0.58,0.84],t:0.82,eva:0,crit:0,stun:5,regen:1,ks:[9,2]},
  "Tử Điện Ưng":{form:"eagle",bl:"tuoc",pr:[0.82,1.02,0.78,1.46,0.92],t:0.82,eva:11,crit:8,stun:0,regen:0,ks:[4,3]},
  "Lôi Tơ Nhện":{form:"spider",bl:"long",pr:[0.86,1.12,0.82,1.3,0.9],t:0.84,eva:9,crit:7,stun:2,regen:0,ks:[0,14]},
  "Thiên Lôi Đốc Quân":{form:"minotaur",bl:"ho",pr:[1.28,1.26,1.18,0.92,1.18],t:0.69,eva:4,crit:10,stun:7,regen:1,ks:[8,16,4]}
};
Object.assign(VAN_KIEP_SPECIALS,VAN_KIEP_PHASE1_SPECIALS);
const VAN_KIEP_PHASE2_SPECIALS={"Nguyệt Ảnh Miêu":{"role":"sát thủ","form":"cat","bl":"hu","pr":[0.92,1.16,0.84,1.2,0.92],"t":0.84,"eva":12,"crit":8,"stun":0,"regen":0,"ks":[4,8],"look":"hu","min":31,"pal":{"dark":"#222744","base":"#5967b4","light":"#c3c8e4","accent":"#a8b8ff","glow":"#e2e5ff"}},"Ngân Quang Dơi":{"role":"phi hành","form":"bat","bl":"vu","pr":[0.82,0.9,0.78,1.4,1.12],"t":0.82,"eva":14,"crit":6,"stun":0,"regen":1,"ks":[0,14],"look":"vu","min":32,"pal":{"dark":"#404661","base":"#a8b8ff","light":"#e0e5ff","accent":"#e2e5ff","glow":"#e2e5ff"}},"Nguyệt Quế Mộc Tinh":{"role":"hỗ trợ","form":"tree","bl":"long","pr":[1.12,0.82,1.02,0.72,1.3],"t":0.86,"eva":2,"crit":1,"stun":0,"regen":5,"ks":[12,9],"look":"long","min":33,"pal":{"dark":"#222744","base":"#5967b4","light":"#c3c8e4","accent":"#a8b8ff","glow":"#e2e5ff"}},"Nguyệt Sa Thủy Xà":{"role":"khống chế","form":"serpent","bl":"tuoc","pr":[0.96,1.04,0.92,1.08,1.06],"t":0.84,"eva":8,"crit":4,"stun":3,"regen":1,"ks":[1,3],"look":"tuoc","min":34,"pal":{"dark":"#404661","base":"#a8b8ff","light":"#e0e5ff","accent":"#e2e5ff","glow":"#e2e5ff"}},"Tinh Đăng Cú":{"role":"pháp sư","form":"owl","bl":"lan","pr":[0.9,0.94,0.88,1.18,1.24],"t":0.83,"eva":10,"crit":6,"stun":0,"regen":0,"ks":[7,4],"look":"lan","min":35,"pal":{"dark":"#222744","base":"#5967b4","light":"#c3c8e4","accent":"#a8b8ff","glow":"#e2e5ff"}},"Nguyệt Thực Tế Quân":{"role":"boss cân bằng","form":"minotaur","bl":"hu","pr":[1.35,1.22,1.18,1.08,1.28],"t":0.68,"eva":5,"crit":8,"stun":8,"regen":3,"ks":[9,14,16],"look":"hu","min":31,"pal":{"dark":"#404661","base":"#a8b8ff","light":"#e0e5ff","accent":"#e2e5ff","glow":"#e2e5ff"}},"Thổ Nham Sơn Hùng":{"role":"đỡ đòn","form":"bear","bl":"lan","pr":[1.48,1.18,1.28,0.58,0.78],"t":0.72,"eva":0,"crit":2,"stun":12,"regen":1,"ks":[2,8],"look":"lan","min":37,"pal":{"dark":"#392516","base":"#95623a","light":"#d9c6b8","accent":"#78bd75","glow":"#a8df73"}},"Dương Quang Bọ Hung":{"role":"giáp nặng","form":"beetle","bl":"ho","pr":[1.0,1.1,1.28,0.78,0.88],"t":0.88,"eva":0,"crit":6,"stun":2,"regen":0,"ks":[9,4],"look":"ho","min":38,"pal":{"dark":"#613d12","base":"#ffa030","light":"#ffddb4","accent":"#ffd17a","glow":"#ffd17a"}},"Lửa Vàng Sơn Miêu":{"role":"đột kích","form":"cat","bl":"tuoc","pr":[0.9,1.18,0.86,1.22,0.92],"t":0.82,"eva":8,"crit":10,"stun":0,"regen":0,"ks":[3,12],"look":"tuoc","min":39,"pal":{"dark":"#492812","base":"#c06a30","light":"#e8c9b4","accent":"#ffa030","glow":"#ffd17a"}},"Hỏa Châm Nhím":{"role":"phản kích","form":"porcupine","bl":"vu","pr":[1.04,0.92,1.08,0.74,1.02],"t":0.89,"eva":2,"crit":2,"stun":4,"regen":1,"ks":[7,11],"look":"vu","min":40,"pal":{"dark":"#613d12","base":"#ffa030","light":"#ffddb4","accent":"#ffd17a","glow":"#ffd17a"}},"Đồi Cát Cự Nhện":{"role":"sát thủ","form":"spider","bl":"hu","pr":[0.92,1.08,0.94,1.18,1.04],"t":0.83,"eva":10,"crit":8,"stun":2,"regen":0,"ks":[0,16],"look":"hu","min":41,"pal":{"dark":"#492812","base":"#c06a30","light":"#e8c9b4","accent":"#ffa030","glow":"#ffd17a"}},"Dương Diệm Sơn Chủ":{"role":"boss đấu sĩ","form":"golem","bl":"lan","pr":[1.42,1.32,1.36,0.76,1.1],"t":0.68,"eva":2,"crit":7,"stun":10,"regen":3,"ks":[8,11,2],"look":"lan","min":37,"pal":{"dark":"#613d12","base":"#ffa030","light":"#ffddb4","accent":"#ffd17a","glow":"#ffd17a"}},"U Uyên Ma Chồn":{"role":"đột kích","form":"weasel","bl":"hu","pr":[0.88,1.1,0.82,1.24,1.16],"t":0.8,"eva":12,"crit":8,"stun":0,"regen":1,"ks":[0,12],"look":"hu","min":43,"pal":{"dark":"#15151f","base":"#383852","light":"#b7b7c1","accent":"#5a6cff","glow":"#c04aff"}},"Hố Sâu Thạch Trùng":{"role":"đỡ đòn","form":"caterpillar","bl":"lan","pr":[1.2,0.9,1.3,0.55,0.86],"t":0.94,"eva":0,"crit":0,"stun":5,"regen":2,"ks":[2,7],"look":"lan","min":44,"pal":{"dark":"#222961","base":"#5a6cff","light":"#c4caff","accent":"#c04aff","glow":"#c04aff"}},"Tịch Ảnh Dơi":{"role":"phi hành","form":"bat","bl":"vu","pr":[0.84,0.94,0.82,1.3,1.12],"t":0.81,"eva":13,"crit":7,"stun":1,"regen":0,"ks":[4,14],"look":"vu","min":45,"pal":{"dark":"#15151f","base":"#383852","light":"#b7b7c1","accent":"#5a6cff","glow":"#c04aff"}},"Hắc Thạch Dạ Xoa":{"role":"đấu sĩ","form":"goblin","bl":"ho","pr":[1.18,1.12,1.1,0.88,0.92],"t":0.86,"eva":0,"crit":3,"stun":6,"regen":0,"ks":[8,11],"look":"ho","min":46,"pal":{"dark":"#222961","base":"#5a6cff","light":"#c4caff","accent":"#c04aff","glow":"#c04aff"}},"Vạn Tơ U Xà":{"role":"khống chế","form":"serpent","bl":"vu","pr":[0.98,1.02,0.96,1.16,1.02],"t":0.85,"eva":9,"crit":5,"stun":3,"regen":1,"ks":[1,9],"look":"vu","min":47,"pal":{"dark":"#15151f","base":"#383852","light":"#b7b7c1","accent":"#5a6cff","glow":"#c04aff"}},"Huyền Uyên Trấn Giới":{"role":"boss pháp sư","form":"wraith","bl":"hu","pr":[1.48,1.3,1.2,1.02,1.35],"t":0.68,"eva":9,"crit":10,"stun":10,"regen":2,"ks":[16,14,8],"look":"hu","min":43,"pal":{"dark":"#222961","base":"#5a6cff","light":"#c4caff","accent":"#c04aff","glow":"#c04aff"}},"Kim Giáp Tê":{"role":"đỡ đòn","form":"rhino","bl":"ho","pr":[1.36,1.08,1.42,0.65,0.68],"t":0.88,"eva":0,"crit":4,"stun":7,"regen":0,"ks":[2,11],"look":"ho","min":49,"pal":{"dark":"#49340e","base":"#c18a24","light":"#e9d5b0","accent":"#74d7d3","glow":"#ffe16b"}},"Bạc Cánh Bọ":{"role":"phi hành","form":"beetle","bl":"tuoc","pr":[0.94,1.12,0.9,1.24,1.02],"t":0.82,"eva":8,"crit":9,"stun":0,"regen":0,"ks":[3,4],"look":"tuoc","min":50,"pal":{"dark":"#554315","base":"#e0b038","light":"#f4e3b7","accent":"#ffe16b","glow":"#ffe16b"}},"Thiếc Giáp Tê Tê":{"role":"giáp nặng","form":"armadillo","bl":"vu","pr":[1.26,0.82,1.38,0.68,0.78],"t":0.93,"eva":1,"crit":0,"stun":2,"regen":2,"ks":[9,16],"look":"vu","min":51,"pal":{"dark":"#46340f","base":"#b88a28","light":"#e5d5b2","accent":"#e0b038","glow":"#ffe16b"}},"Ngân Nha Chuột":{"role":"sát thủ","form":"rat","bl":"hu","pr":[0.84,1.02,0.8,1.38,1.14],"t":0.8,"eva":13,"crit":6,"stun":0,"regen":1,"ks":[0,12],"look":"hu","min":52,"pal":{"dark":"#554315","base":"#e0b038","light":"#f4e3b7","accent":"#ffe16b","glow":"#ffe16b"}},"Cổ Kim Cự Kê":{"role":"đấu sĩ","form":"rooster","bl":"lan","pr":[1.1,0.96,1.08,0.94,1.12],"t":0.84,"eva":4,"crit":5,"stun":4,"regen":2,"ks":[7,8],"look":"lan","min":53,"pal":{"dark":"#46340f","base":"#b88a28","light":"#e5d5b2","accent":"#e0b038","glow":"#ffe16b"}},"Kim Sơn Khai Mạch":{"role":"boss hộ vệ","form":"minotaur","bl":"ho","pr":[1.38,1.28,1.42,0.84,1.08],"t":0.7,"eva":2,"crit":8,"stun":8,"regen":2,"ks":[2,4,9],"look":"ho","min":49,"pal":{"dark":"#554315","base":"#e0b038","light":"#f4e3b7","accent":"#ffe16b","glow":"#ffe16b"}},"Bích Ngọc Thạch Tằm":{"role":"hỗ trợ","form":"caterpillar","bl":"long","pr":[1.08,0.84,1.14,0.74,1.32],"t":0.85,"eva":2,"crit":2,"stun":0,"regen":4,"ks":[9,12],"look":"long","min":54,"pal":{"dark":"#0e3b2e","base":"#259a7a","light":"#b1dbcf","accent":"#18e0b0","glow":"#9affdf"}},"Ngọc Tâm Ếch":{"role":"hồi phục","form":"frog","bl":"vu","pr":[1.0,0.94,0.94,1.04,1.08],"t":0.84,"eva":5,"crit":2,"stun":2,"regen":2,"ks":[2,14],"look":"vu","min":55,"pal":{"dark":"#095543","base":"#18e0b0","light":"#acf4e3","accent":"#9affdf","glow":"#9affdf"}},"Huyết Ngọc Miêu":{"role":"đột kích","form":"cat","bl":"ho","pr":[0.94,1.18,0.88,1.1,0.92],"t":0.82,"eva":8,"crit":9,"stun":0,"regen":0,"ks":[4,11],"look":"ho","min":56,"pal":{"dark":"#0e3b2e","base":"#259a7a","light":"#b1dbcf","accent":"#18e0b0","glow":"#9affdf"}},"Lưu Ly Thủy Xà":{"role":"khống chế","form":"serpent","bl":"vu","pr":[0.98,1.02,0.96,1.16,1.04],"t":0.84,"eva":10,"crit":5,"stun":3,"regen":1,"ks":[0,3],"look":"vu","min":57,"pal":{"dark":"#095543","base":"#18e0b0","light":"#acf4e3","accent":"#9affdf","glow":"#9affdf"}},"Lam Ngọc Cú":{"role":"pháp sư","form":"owl","bl":"tuoc","pr":[0.88,0.9,0.84,1.16,1.26],"t":0.83,"eva":9,"crit":4,"stun":0,"regen":1,"ks":[1,8],"look":"tuoc","min":58,"pal":{"dark":"#0e3b2e","base":"#259a7a","light":"#b1dbcf","accent":"#18e0b0","glow":"#9affdf"}},"Ngọc Tủy Thánh Thể":{"role":"boss hộ thể","form":"crystal","bl":"long","pr":[1.32,1.24,1.26,0.94,1.34],"t":0.69,"eva":5,"crit":8,"stun":7,"regen":3,"ks":[12,14,16],"look":"long","min":54,"pal":{"dark":"#095543","base":"#18e0b0","light":"#acf4e3","accent":"#9affdf","glow":"#9affdf"}}};
Object.assign(VAN_KIEP_SPECIALS,VAN_KIEP_PHASE2_SPECIALS); const VAN_KIEP_PHASE3_SPECIALS={
  "Linh Chi Lộc": {
    "role": "Hỗ trợ",
    "form": "fungalStag",
    "bl": "long",
    "pr": [
      1.16,
      0.82,
      1.12,
      0.84,
      1.12
    ],
    "t": 0.89,
    "eva": 2,
    "crit": 1,
    "stun": 0,
    "regen": 5,
    "ks": [
      12,
      10
    ],
    "look": "long",
    "min": 60,
    "pal": {
      "dark": "#225133",
      "base": "#46a96a",
      "light": "#94cda9",
      "accent": "#fa9b78",
      "glow": "#baff83"
    }
  },
  "Bách Diệp Thạch Ếch": {
    "role": "Phòng ngự",
    "form": "frog",
    "bl": "vu",
    "pr": [
      1.08,
      0.84,
      1.28,
      0.72,
      0.92
    ],
    "t": 0.92,
    "eva": 4,
    "crit": 2,
    "stun": 2,
    "regen": 1,
    "ks": [
      9,
      2
    ],
    "look": "vu",
    "min": 61,
    "pal": {
      "dark": "#436c24",
      "base": "#8be04a",
      "light": "#bced96",
      "accent": "#bcf47a",
      "glow": "#bcf47a"
    }
  },
  "Rêu Giáp Sơn Dê": {
    "role": "Đỡ đòn",
    "form": "goat",
    "bl": "ho",
    "pr": [
      1.38,
      0.88,
      1.22,
      0.66,
      0.78
    ],
    "t": 0.88,
    "eva": 0,
    "crit": 2,
    "stun": 6,
    "regen": 1,
    "ks": [
      4,
      3
    ],
    "look": "ho",
    "min": 62,
    "pal": {
      "dark": "#21421f",
      "base": "#458a40",
      "light": "#93bb90",
      "accent": "#8be04a",
      "glow": "#bcf47a"
    }
  },
  "Sương Mộc Nhện": {
    "role": "Khống chế",
    "form": "spider",
    "bl": "tuoc",
    "pr": [
      0.9,
      1.12,
      0.88,
      1.2,
      0.96
    ],
    "t": 0.84,
    "eva": 10,
    "crit": 6,
    "stun": 5,
    "regen": 0,
    "ks": [
      14,
      0
    ],
    "look": "tuoc",
    "min": 63,
    "pal": {
      "dark": "#436c24",
      "base": "#8be04a",
      "light": "#bced96",
      "accent": "#bcf47a",
      "glow": "#bcf47a"
    }
  },
  "Rừng Sâu Báo": {
    "role": "Sát thủ",
    "form": "panther",
    "bl": "hu",
    "pr": [
      0.84,
      1.22,
      0.86,
      1.3,
      0.82
    ],
    "t": 0.82,
    "eva": 12,
    "crit": 10,
    "stun": 0,
    "regen": 0,
    "ks": [
      8,
      1
    ],
    "look": "hu",
    "min": 64,
    "pal": {
      "dark": "#21421f",
      "base": "#458a40",
      "light": "#93bb90",
      "accent": "#8be04a",
      "glow": "#bcf47a"
    }
  },
  "Cổ Thụ Thủ Lâm": {
    "role": "Thủ lĩnh",
    "form": "tree",
    "bl": "lan",
    "pr": [
      1.42,
      1.08,
      1.34,
      0.76,
      1.28
    ],
    "t": 0.5,
    "eva": 3,
    "crit": 5,
    "stun": 8,
    "regen": 4,
    "ks": [
      16,
      7,
      15
    ],
    "look": "lan",
    "min": 60,
    "pal": {
      "dark": "#436c24",
      "base": "#8be04a",
      "light": "#bced96",
      "accent": "#bcf47a",
      "glow": "#bcf47a"
    }
  },
  "Nham Tích Viêm Giáp": {
    "role": "Đấu sĩ",
    "form": "lizard",
    "bl": "tuoc",
    "pr": [
      1.18,
      1.12,
      1.16,
      0.82,
      0.88
    ],
    "t": 0.86,
    "eva": 1,
    "crit": 5,
    "stun": 7,
    "regen": 0,
    "ks": [
      11,
      9
    ],
    "look": "tuoc",
    "min": 66,
    "pal": {
      "dark": "#422723",
      "base": "#895148",
      "light": "#bb9a95",
      "accent": "#ff6729",
      "glow": "#ffd052"
    }
  },
  "Hồng Nham Bọ Cạp": {
    "role": "Sát thủ",
    "form": "scorpion",
    "bl": "ho",
    "pr": [
      0.94,
      1.24,
      0.92,
      1.14,
      0.86
    ],
    "t": 0.84,
    "eva": 6,
    "crit": 11,
    "stun": 3,
    "regen": 0,
    "ks": [
      4,
      8
    ],
    "look": "ho",
    "min": 67,
    "pal": {
      "dark": "#7a2b0e",
      "base": "#ff5a1e",
      "light": "#ff9f7d",
      "accent": "#ff9b4e",
      "glow": "#ff9b4e"
    }
  },
  "Dung Nham Tê": {
    "role": "Đỡ đòn",
    "form": "rhino",
    "bl": "lan",
    "pr": [
      1.32,
      0.92,
      1.36,
      0.66,
      0.82
    ],
    "t": 0.84,
    "eva": 0,
    "crit": 2,
    "stun": 6,
    "regen": 1,
    "ks": [
      2,
      7
    ],
    "look": "lan",
    "min": 68,
    "pal": {
      "dark": "#4e1b0f",
      "base": "#a3381f",
      "light": "#ca8c7d",
      "accent": "#ff5a1e",
      "glow": "#ff9b4e"
    }
  },
  "Hỏa Tâm Thạch Nhân": {
    "role": "Pháp vệ",
    "form": "golem",
    "bl": "hu",
    "pr": [
      1.12,
      0.9,
      1.4,
      0.72,
      1.08
    ],
    "t": 0.9,
    "eva": 1,
    "crit": 3,
    "stun": 5,
    "regen": 2,
    "ks": [
      15,
      1
    ],
    "look": "hu",
    "min": 69,
    "pal": {
      "dark": "#7a2b0e",
      "base": "#ff5a1e",
      "light": "#ff9f7d",
      "accent": "#ff9b4e",
      "glow": "#ff9b4e"
    }
  },
  "Thiêu Đốt Sa Lang": {
    "role": "Phi hành",
    "form": "wolf",
    "bl": "vu",
    "pr": [
      0.92,
      1.18,
      0.9,
      1.16,
      0.96
    ],
    "t": 0.84,
    "eva": 9,
    "crit": 8,
    "stun": 0,
    "regen": 0,
    "ks": [
      0,
      3
    ],
    "look": "vu",
    "min": 70,
    "pal": {
      "dark": "#4e1b0f",
      "base": "#a3381f",
      "light": "#ca8c7d",
      "accent": "#ff5a1e",
      "glow": "#ff9b4e"
    }
  },
  "Nham Hạch Thái Thú": {
    "role": "Thủ lĩnh",
    "form": "crocodile",
    "bl": "long",
    "pr": [
      1.44,
      1.28,
      1.3,
      0.82,
      1.14
    ],
    "t": 0.55,
    "eva": 3,
    "crit": 7,
    "stun": 10,
    "regen": 1,
    "ks": [
      16,
      10,
      14
    ],
    "look": "long",
    "min": 66,
    "pal": {
      "dark": "#7a2b0e",
      "base": "#ff5a1e",
      "light": "#ff9f7d",
      "accent": "#ff9b4e",
      "glow": "#ff9b4e"
    }
  },
  "Hắc Diệp Cốt Thú": {
    "role": "Cận chiến",
    "form": "skeleton",
    "bl": "hu",
    "pr": [
      1.06,
      1.1,
      1.16,
      0.86,
      1.05
    ],
    "t": 0.82,
    "eva": 4,
    "crit": 5,
    "stun": 5,
    "regen": 1,
    "ks": [
      14,
      10
    ],
    "look": "hu",
    "min": 72,
    "pal": {
      "dark": "#281c30",
      "base": "#533a63",
      "light": "#9b8da5",
      "accent": "#b0206a",
      "glow": "#ff4a6a"
    }
  },
  "Bóng Đêm Bọ": {
    "role": "Sát thủ",
    "form": "beetle",
    "bl": "tuoc",
    "pr": [
      0.94,
      1.12,
      0.96,
      1.2,
      0.88
    ],
    "t": 0.85,
    "eva": 11,
    "crit": 7,
    "stun": 1,
    "regen": 0,
    "ks": [
      3,
      8
    ],
    "look": "tuoc",
    "min": 73,
    "pal": {
      "dark": "#540f33",
      "base": "#b0206a",
      "light": "#d17ea9",
      "accent": "#ff4a6a",
      "glow": "#ff4a6a"
    }
  },
  "Mộng Yểm Mộc Linh": {
    "role": "Hỗ trợ",
    "form": "tree",
    "bl": "long",
    "pr": [
      1,
      0.82,
      1.08,
      0.8,
      1.3
    ],
    "t": 0.9,
    "eva": 2,
    "crit": 3,
    "stun": 0,
    "regen": 5,
    "ks": [
      12,
      9
    ],
    "look": "long",
    "min": 74,
    "pal": {
      "dark": "#281c30",
      "base": "#533a63",
      "light": "#9b8da5",
      "accent": "#b0206a",
      "glow": "#ff4a6a"
    }
  },
  "U Hỏa Cự Miêu": {
    "role": "Sát thủ",
    "form": "panther",
    "bl": "ho",
    "pr": [
      0.9,
      1.24,
      0.88,
      1.22,
      0.9
    ],
    "t": 0.84,
    "eva": 9,
    "crit": 10,
    "stun": 1,
    "regen": 0,
    "ks": [
      4,
      0
    ],
    "look": "ho",
    "min": 75,
    "pal": {
      "dark": "#540f33",
      "base": "#b0206a",
      "light": "#d17ea9",
      "accent": "#ff4a6a",
      "glow": "#ff4a6a"
    }
  },
  "Mộ Lâm Thạch Quỷ": {
    "role": "Khống chế",
    "form": "golem",
    "bl": "lan",
    "pr": [
      1.34,
      0.98,
      1.4,
      0.72,
      0.94
    ],
    "t": 0.75,
    "eva": 0,
    "crit": 1,
    "stun": 7,
    "regen": 2,
    "ks": [
      2,
      7
    ],
    "look": "lan",
    "min": 76,
    "pal": {
      "dark": "#281c30",
      "base": "#533a63",
      "light": "#9b8da5",
      "accent": "#b0206a",
      "glow": "#ff4a6a"
    }
  },
  "Hắc Nhật Tàn Quân": {
    "role": "Thủ lĩnh ma quân",
    "form": "demon",
    "bl": "vu",
    "pr": [
      1.45,
      1.3,
      1.28,
      0.88,
      1.28
    ],
    "t": 0.525,
    "eva": 6,
    "crit": 9,
    "stun": 9,
    "regen": 2,
    "ks": [
      8,
      1,
      15
    ],
    "look": "vu",
    "min": 72,
    "pal": {
      "dark": "#540f33",
      "base": "#b0206a",
      "light": "#d17ea9",
      "accent": "#ff4a6a",
      "glow": "#ff4a6a"
    }
  },
  "Tử Tinh Hải Ngư": {
    "role": "Phi hành",
    "form": "fish",
    "bl": "vu",
    "pr": [
      0.96,
      1.02,
      0.92,
      1.22,
      1.1
    ],
    "t": 0.86,
    "eva": 9,
    "crit": 5,
    "stun": 1,
    "regen": 1,
    "ks": [
      0,
      14
    ],
    "look": "vu",
    "min": 78,
    "pal": {
      "dark": "#34194d",
      "base": "#6d35a0",
      "light": "#aa8ac8",
      "accent": "#b45cff",
      "glow": "#e5a6ff"
    }
  },
  "Phấn Tinh Bọ": {
    "role": "Phòng ngự",
    "form": "beetle",
    "bl": "tuoc",
    "pr": [
      1.12,
      0.9,
      1.26,
      0.82,
      0.92
    ],
    "t": 0.91,
    "eva": 2,
    "crit": 2,
    "stun": 3,
    "regen": 1,
    "ks": [
      9,
      2
    ],
    "look": "tuoc",
    "min": 79,
    "pal": {
      "dark": "#562c7a",
      "base": "#b45cff",
      "light": "#d4a0ff",
      "accent": "#e5a6ff",
      "glow": "#e5a6ff"
    }
  },
  "Tử Tinh Cự Ốc": {
    "role": "Đỡ đòn",
    "form": "snail",
    "bl": "long",
    "pr": [
      1.28,
      0.82,
      1.42,
      0.56,
      1.06
    ],
    "t": 0.93,
    "eva": 0,
    "crit": 1,
    "stun": 2,
    "regen": 4,
    "ks": [
      12,
      10
    ],
    "look": "long",
    "min": 80,
    "pal": {
      "dark": "#34194d",
      "base": "#6d35a0",
      "light": "#aa8ac8",
      "accent": "#b45cff",
      "glow": "#e5a6ff"
    }
  },
  "Hắc Thủy Cá Đao": {
    "role": "Sát thủ",
    "form": "swordfish",
    "bl": "ho",
    "pr": [
      0.9,
      1.26,
      0.82,
      1.34,
      0.92
    ],
    "t": 0.84,
    "eva": 11,
    "crit": 12,
    "stun": 0,
    "regen": 0,
    "ks": [
      3,
      4
    ],
    "look": "ho",
    "min": 81,
    "pal": {
      "dark": "#562c7a",
      "base": "#b45cff",
      "light": "#d4a0ff",
      "accent": "#e5a6ff",
      "glow": "#e5a6ff"
    }
  },
  "Thủy Tinh Hạc": {
    "role": "Hỗ trợ",
    "form": "crane",
    "bl": "hu",
    "pr": [
      0.86,
      0.88,
      0.84,
      1.3,
      1.26
    ],
    "t": 0.86,
    "eva": 10,
    "crit": 5,
    "stun": 0,
    "regen": 2,
    "ks": [
      7,
      11
    ],
    "look": "hu",
    "min": 82,
    "pal": {
      "dark": "#34194d",
      "base": "#6d35a0",
      "light": "#aa8ac8",
      "accent": "#b45cff",
      "glow": "#e5a6ff"
    }
  },
  "Thủy Tinh Hải Vương": {
    "role": "Thủ lĩnh hải vực",
    "form": "whale",
    "bl": "lan",
    "pr": [
      1.46,
      1.22,
      1.34,
      0.84,
      1.24
    ],
    "t": 0.525,
    "eva": 3,
    "crit": 7,
    "stun": 8,
    "regen": 3,
    "ks": [
      8,
      1,
      13
    ],
    "look": "lan",
    "min": 78,
    "pal": {
      "dark": "#562c7a",
      "base": "#b45cff",
      "light": "#d4a0ff",
      "accent": "#e5a6ff",
      "glow": "#e5a6ff"
    }
  },
  "Vân Tầng Phi Mã": {
    "role": "Phi hành",
    "form": "horse",
    "bl": "vu",
    "pr": [
      0.92,
      1.02,
      0.9,
      1.34,
      0.96
    ],
    "t": 0.84,
    "eva": 12,
    "crit": 6,
    "stun": 0,
    "regen": 0,
    "ks": [
      4,
      0
    ],
    "look": "vu",
    "min": 84,
    "pal": {
      "dark": "#3a5368",
      "base": "#78add9",
      "light": "#b1cfe9",
      "accent": "#6ac4ff",
      "glow": "#bce7ff"
    }
  },
  "Thiên Trụ Thạch Nhân": {
    "role": "Đỡ đòn",
    "form": "golem",
    "bl": "lan",
    "pr": [
      1.4,
      0.92,
      1.42,
      0.68,
      1.02
    ],
    "t": 0.8,
    "eva": 0,
    "crit": 1,
    "stun": 8,
    "regen": 2,
    "ks": [
      9,
      2
    ],
    "look": "lan",
    "min": 85,
    "pal": {
      "dark": "#335e7a",
      "base": "#6ac4ff",
      "light": "#a9ddff",
      "accent": "#bce7ff",
      "glow": "#bce7ff"
    }
  },
  "Lam Vũ Hạc": {
    "role": "Phi hành",
    "form": "crane",
    "bl": "tuoc",
    "pr": [
      0.84,
      0.96,
      0.82,
      1.44,
      1.04
    ],
    "t": 0.83,
    "eva": 12,
    "crit": 7,
    "stun": 0,
    "regen": 0,
    "ks": [
      3,
      8
    ],
    "look": "tuoc",
    "min": 86,
    "pal": {
      "dark": "#3a5368",
      "base": "#78add9",
      "light": "#b1cfe9",
      "accent": "#6ac4ff",
      "glow": "#bce7ff"
    }
  },
  "Tinh Khe Dơi": {
    "role": "Sát thủ",
    "form": "bat",
    "bl": "hu",
    "pr": [
      0.84,
      1.08,
      0.82,
      1.4,
      1.08
    ],
    "t": 0.82,
    "eva": 14,
    "crit": 8,
    "stun": 0,
    "regen": 0,
    "ks": [
      11,
      14
    ],
    "look": "hu",
    "min": 87,
    "pal": {
      "dark": "#335e7a",
      "base": "#6ac4ff",
      "light": "#a9ddff",
      "accent": "#bce7ff",
      "glow": "#bce7ff"
    }
  },
  "Cánh Bạc Chim Ưng": {
    "role": "Sát thủ",
    "form": "eagle",
    "bl": "long",
    "pr": [
      0.86,
      1.08,
      0.82,
      1.42,
      1.02
    ],
    "t": 0.83,
    "eva": 12,
    "crit": 9,
    "stun": 0,
    "regen": 1,
    "ks": [
      1,
      7
    ],
    "look": "long",
    "min": 88,
    "pal": {
      "dark": "#3a5368",
      "base": "#78add9",
      "light": "#b1cfe9",
      "accent": "#6ac4ff",
      "glow": "#bce7ff"
    }
  },
  "Thiên Không Vương": {
    "role": "Thủ lĩnh thiên không",
    "form": "dragon",
    "bl": "ho",
    "pr": [
      1.42,
      1.28,
      1.24,
      0.94,
      1.3
    ],
    "t": 0.575,
    "eva": 5,
    "crit": 9,
    "stun": 8,
    "regen": 1,
    "ks": [
      16,
      12,
      10
    ],
    "look": "ho",
    "min": 84,
    "pal": {
      "dark": "#335e7a",
      "base": "#6ac4ff",
      "light": "#a9ddff",
      "accent": "#bce7ff",
      "glow": "#bce7ff"
    }
  }
}; Object.assign(VAN_KIEP_SPECIALS,VAN_KIEP_PHASE3_SPECIALS);
const VAN_KIEP_PHASE4_SPECIALS={
  "Hồng Liên Phấn Điệp": {
    "role": "Sát thủ phấn hoa",
    "form": "moth",
    "bl": "hu",
    "pr": [
      0.88,
      1.08,
      0.82,
      1.3,
      1.1
    ],
    "t": 0.82,
    "eva": 10,
    "crit": 8,
    "stun": 0,
    "regen": 0,
    "ks": [
      4,
      3
    ],
    "min": 90,
    "pal": {
      "dark": "#3b1c34",
      "base": "#b04a8c",
      "light": "#ffc6e5",
      "accent": "#ff7ac0",
      "glow": "#ffc6e5"
    }
  },
  "Mộc Lan Cự Ong": {
    "role": "Đấu sĩ hộ hoa",
    "form": "bee",
    "bl": "tuoc",
    "pr": [
      1.08,
      1.12,
      1.02,
      0.9,
      0.98
    ],
    "t": 0.85,
    "eva": 4,
    "crit": 5,
    "stun": 3,
    "regen": 1,
    "ks": [
      9,
      8
    ],
    "min": 91,
    "pal": {
      "dark": "#5c213d",
      "base": "#ff7ac0",
      "light": "#ffc6e5",
      "accent": "#ffc6e5",
      "glow": "#ffc6e5"
    }
  },
  "Ngọc Diệp Tinh": {
    "role": "Hỗ trợ linh mộc",
    "form": "spirit",
    "bl": "long",
    "pr": [
      1.02,
      0.9,
      1.04,
      0.88,
      1.34
    ],
    "t": 0.98,
    "eva": 2,
    "crit": 2,
    "stun": 0,
    "regen": 5,
    "ks": [
      12,
      10
    ],
    "min": 92,
    "pal": {
      "dark": "#3b1c34",
      "base": "#b04a8c",
      "light": "#ffc6e5",
      "accent": "#ff7ac0",
      "glow": "#ffc6e5"
    }
  },
  "Thủy Tiên Thủy Xà": {
    "role": "Khống chế thủy linh",
    "form": "serpent",
    "bl": "vu",
    "pr": [
      1.02,
      1.0,
      1.0,
      0.98,
      1.16
    ],
    "t": 0.87,
    "eva": 7,
    "crit": 3,
    "stun": 5,
    "regen": 2,
    "ks": [
      1,
      11
    ],
    "min": 93,
    "pal": {
      "dark": "#5c213d",
      "base": "#ff7ac0",
      "light": "#ffc6e5",
      "accent": "#ffc6e5",
      "glow": "#ffc6e5"
    }
  },
  "Lục Tán Cự Ếch": {
    "role": "Đỡ đòn",
    "form": "frog",
    "bl": "lan",
    "pr": [
      1.28,
      0.86,
      1.24,
      0.68,
      0.94
    ],
    "t": 0.91,
    "eva": 1,
    "crit": 1,
    "stun": 3,
    "regen": 2,
    "ks": [
      2,
      7
    ],
    "min": 94,
    "pal": {
      "dark": "#3b1c34",
      "base": "#b04a8c",
      "light": "#ffc6e5",
      "accent": "#ff7ac0",
      "glow": "#ffc6e5"
    }
  },
  "Bách Hoa Tiên Chủ": {
    "role": "Boss hoa linh",
    "form": "flower",
    "bl": "hu",
    "pr": [
      1.34,
      1.12,
      1.28,
      0.92,
      1.32
    ],
    "t": 0.66,
    "eva": 7,
    "crit": 8,
    "stun": 7,
    "regen": 3,
    "ks": [
      12,
      10,
      16
    ],
    "min": 90,
    "pal": {
      "dark": "#5c213d",
      "base": "#ff7ac0",
      "light": "#ffc6e5",
      "accent": "#ffc6e5",
      "glow": "#ffc6e5"
    }
  },
  "Thần Điện Kim Tượng": {
    "role": "Hộ vệ kim tượng",
    "form": "golem",
    "bl": "ho",
    "pr": [
      1.32,
      1.02,
      1.36,
      0.66,
      1.02
    ],
    "t": 0.84,
    "eva": 0,
    "crit": 3,
    "stun": 7,
    "regen": 1,
    "ks": [
      2,
      9
    ],
    "min": 96,
    "pal": {
      "dark": "#43350a",
      "base": "#a8842a",
      "light": "#ffe485",
      "accent": "#fff0a0",
      "glow": "#ffe485"
    }
  },
  "Thần Văn Thiên Xà": {
    "role": "Khống chế thiên xà",
    "form": "serpent",
    "bl": "tuoc",
    "pr": [
      1.0,
      1.12,
      0.94,
      1.12,
      1.1
    ],
    "t": 0.96,
    "eva": 7,
    "crit": 7,
    "stun": 3,
    "regen": 0,
    "ks": [
      11,
      1
    ],
    "min": 97,
    "pal": {
      "dark": "#5a4a16",
      "base": "#fff0a0",
      "light": "#ffe485",
      "accent": "#ffe485",
      "glow": "#ffe485"
    }
  },
  "Thánh Ấn Bạch Hạc": {
    "role": "Hỗ trợ thánh ấn",
    "form": "crane",
    "bl": "long",
    "pr": [
      0.96,
      0.9,
      0.92,
      1.18,
      1.3
    ],
    "t": 0.86,
    "eva": 9,
    "crit": 5,
    "stun": 0,
    "regen": 4,
    "ks": [
      12,
      4
    ],
    "min": 98,
    "pal": {
      "dark": "#43350a",
      "base": "#a8842a",
      "light": "#ffe485",
      "accent": "#fff0a0",
      "glow": "#ffe485"
    }
  },
  "Trụ Đá Khổng Lồ": {
    "role": "Đỡ đòn",
    "form": "golem",
    "bl": "lan",
    "pr": [
      1.42,
      0.94,
      1.5,
      0.56,
      0.78
    ],
    "t": 0.93,
    "eva": 0,
    "crit": 0,
    "stun": 4,
    "regen": 2,
    "ks": [
      7,
      8
    ],
    "min": 99,
    "pal": {
      "dark": "#5a4a16",
      "base": "#fff0a0",
      "light": "#ffe485",
      "accent": "#ffe485",
      "glow": "#ffe485"
    }
  },
  "Thần Quang Mộc Linh": {
    "role": "Pháp sư mộc linh",
    "form": "tree",
    "bl": "hu",
    "pr": [
      1.04,
      0.98,
      1.0,
      0.98,
      1.32
    ],
    "t": 0.96,
    "eva": 5,
    "crit": 7,
    "stun": 1,
    "regen": 3,
    "ks": [
      10,
      14
    ],
    "min": 100,
    "pal": {
      "dark": "#43350a",
      "base": "#a8842a",
      "light": "#ffe485",
      "accent": "#fff0a0",
      "glow": "#ffe485"
    }
  },
  "Thập Nhị Quang Tướng": {
    "role": "Boss thống lĩnh thần điện",
    "form": "minotaur",
    "bl": "ho",
    "pr": [
      1.42,
      1.34,
      1.3,
      0.88,
      1.12
    ],
    "t": 0.65,
    "eva": 6,
    "crit": 12,
    "stun": 8,
    "regen": 1,
    "ks": [
      16,
      8,
      4
    ],
    "min": 96,
    "pal": {
      "dark": "#5a4a16",
      "base": "#fff0a0",
      "light": "#ffe485",
      "accent": "#ffe485",
      "glow": "#ffe485"
    }
  }
};
Object.assign(VAN_KIEP_SPECIALS,VAN_KIEP_PHASE4_SPECIALS);


const VAN_KIEP_SHAPE_FORMS=[
 'wolf','cat','panther','weasel','bear','ox','rhino','yak','boar','stag','deer','goat','horse','rabbit','rat','mole','monkey',
 'werewolf','goblin','skeleton','mummy','minotaur','priest','ghoul','demon','wraith','golem',
 'beetle','mantis','spider','scorpion','moth','caterpillar','snail',
 'bird','owl','vulture','crane','eagle','falcon','rooster','sparrow','raven','nightjar','bat','dragon',
 'serpent','lizard','crocodile','frog','toad','fish','swordfish','shark','whale','jellyfish','crab','turtle','armadillo','porcupine','bee',
 'mushroom','fungalStag','tree','flower','crystal','spirit','slime'
];
const VAN_KIEP_FORM_LABELS={
 wolf:'Sói',cat:'Linh miêu',panther:'Báo',weasel:'Chồn',bear:'Gấu',ox:'Trâu bò',rhino:'Tê giác',yak:'Bò lông dày',boar:'Heo rừng',stag:'Hươu sừng lớn',deer:'Nai',goat:'Dê núi',horse:'Ngựa',rabbit:'Thỏ',rat:'Chuột',mole:'Chuột chũi',monkey:'Khỉ',
 werewolf:'Nhân lang',goblin:'Goblin',skeleton:'Bộ xương',mummy:'Xác ướp',minotaur:'Ngưu nhân',priest:'Tế sư',ghoul:'Quỷ đói',demon:'Ma quỷ',wraith:'Oán linh',golem:'Thạch nhân',
 beetle:'Bọ giáp',mantis:'Bọ ngựa',spider:'Nhện',scorpion:'Bọ cạp',moth:'Bướm đêm',caterpillar:'Sâu tằm',snail:'Ốc khổng lồ',
 bird:'Chim săn',owl:'Cú',vulture:'Kền kền',crane:'Hạc',eagle:'Ưng',falcon:'Chim ưng',rooster:'Kê',sparrow:'Tước',raven:'Quạ',nightjar:'Dạ điểu',bat:'Dơi',dragon:'Long thú',
 serpent:'Rắn',lizard:'Thằn lằn',crocodile:'Cá sấu',frog:'Ếch',toad:'Thiềm thừ',fish:'Cá',swordfish:'Cá đao',shark:'Cá dữ',whale:'Cá voi',jellyfish:'Thủy mẫu',crab:'Cua',turtle:'Rùa',armadillo:'Tê tê',porcupine:'Nhím',bee:'Ong linh',
 mushroom:'Nấm linh',fungalStag:'Nai nấm linh chi',tree:'Mộc linh',flower:'Hoa linh',crystal:'Tinh thể',spirit:'Linh thể',slime:'Dịch nhầy'
};
const VAN_KIEP_FORM_RULES=[
 [/Thủy Tinh Hải Vương/,'shark'],[/Sao Vụ Thủy Mẫu/,'jellyfish'],[/Cá Đao/,'swordfish'],[/Bách Hoa Tiên Chủ/,'flower'],[/Linh Tôn/,'spirit'],
 [/Cánh Gió Thảo Linh/,'flower'],[/Tinh Thiết Kiếm Bọ/,'mantis'],[/Chuột Chũi/,'mole'],[/Hỏa Vũ Dực Thằn/,'dragon'],
 [/Dực Thằn/,'lizard'],[/Mây Bông Cự Cừu/,'yak'],[/Hắc Nhật Tàn Quân/,'skeleton'],
 [/Mộng Yểm Cổ Chủ/,'spirit'],[/Thần Điện Đại Tư Tế/,'priest'],[/Hồng Diệp Thạch Hươu/,'deer'],
 [/Lưu Ly Động Chủ/,'golem'],[/Vạn Tượng Kim Khôi/,'minotaur'],[/Cự Quặng Đế|Xích Thổ Tinh/,'crystal'],
 [/Bách Niên Mộc Vương/,'golem'],[/Vạn Diệp Thanh Linh|Vạn Hoa Bách Linh/,'spirit'],[/Thiên Hương Mẫu Hoàng/,'bee'],
 [/Bạch Cốt|Cốt Thú/,'skeleton'],[/Huyết Điểu|Kền Kền|Quạ/,'vulture'],[/Phấn Điệp|Điệp/,'moth'],
 [/Bọ Cạp/,'scorpion'],[/Bọ Ngựa/,'mantis'],[/Nhện/,'spider'],[/Dơi/,'bat'],[/Cú/,'owl'],
 [/Chuột Chũi/,'mole'],[/Chuột|Thử/,'rat'],[/Khỉ|Hầu|Vượn/,'monkey'],[/Thỏ/,'rabbit'],
 [/Hải Ngưu|Cự Kình|Hải Kình/,'whale'],[/Trâu|Ngưu|Bò/,'ox'],[/Tê Tê/,'armadillo'],[/Tê/,'rhino'],[/Cự Ốc|Ốc/,'snail'],[/Bạch Tuộc|Cua|Ngao/,'crab'],
 [/Kình|Kình Vương/,'whale'],[/(?:^| )Cá(?: |$)|Ngư|Thủy Mẫu/,'fish'],
 [/Hươu|Nai|Lộc/,'stag'],[/Sơn Dương|Dê/,'goat'],[/Hùng/,'bear'],[/Báo/,'panther'],[/Chồn/,'weasel'],[/Miêu|Mèo/,'cat'],
 [/Nhân Lang/,'werewolf'],[/Cẩu|Khuyển|Chó|Lang/,'wolf'],[/Sói/,'wolf'],[/Bọ Cánh|Bọ Hung|Kiếm Bọ|Giáp Bọ|Bọ/,'beetle'],
 [/Cốt|Xương|Bộ Xương/,'skeleton'],[/Goblin|Dạ Xoa/,'goblin'],[/Tư Tế/,'priest'],[/Tướng Quân|Đốc Quân|Trấn Tướng|Hộ Pháp|Thủ Vệ/,'minotaur'],[/Chúa Tể/,'demon'],
 [/Tử Tịch Ngục Chủ/,'skeleton'],[/Ma Quân|Ma Vương|Oán Linh|U Linh|Ảnh|Mộng Yểm|Tử Tịch|Ngục Chủ|Thôn Tinh|Vương|Đế/,'wraith'],
 [/Thằn Lằn|Tích|Viêm Giáp/,'lizard'],[/Cự Tích|Nham Tích|Cá Sấu/,'lizard'],[/Crocodile/,'crocodile'],
 [/Xà|Rắn|Mãng/,'serpent'],[/Cá Sấu|Ngạc/,'crocodile'],[/Thiềm/,'toad'],[/Ếch|Cóc/,'frog'],
 [/Tằm|Sâu/,'caterpillar'],[/Nấm|Linh Chi/,'mushroom'],
 [/Dạ Điểu/,'nightjar'],[/Hạc/,'crane'],[/Chim Ưng/,'falcon'],[/Ưng|Đại Bàng|Phi Ưng/,'eagle'],[/Tước/,'sparrow'],[/Cự Kê|Kê/,'rooster'],[/Điêu|Phi Điểu|Chim|Điểu/,'bird'],
 [/Rùa/,'turtle'],[/Tê Tê|Giáp Tê/,'armadillo'],[/Nhím/,'porcupine'],
 [/Mộc Lan Cự Ong|Cự Ong/,'bee'],[/Mầm Non Tinh|Ngọc Diệp Tinh/,'spirit'],[/Thụ|Mộc|Thảo|Diệp|Tùng|Đằng|Tảo|Rêu|Mầm Non|Lá|Hoa|Liên/,'tree'],
 [/Thủy Tinh Hải Vương/,'shark'],[/Sao Vụ Thủy Mẫu/,'jellyfish'],[/Cá Đao/,'swordfish'],[/Mộng Yểm Cổ Chủ/,'wraith'],[/Lưu Ly Động Chủ/,'golem'],[/Vạn Tượng Kim Khôi/,'minotaur'],[/Cự Quặng Đế|Xích Thổ Tinh/,'crystal'],[/Bách Niên Mộc Vương/,'golem'],[/Vạn Diệp Thanh Linh|Vạn Hoa Bách Linh/,'spirit'],[/Hồng Liên Phấn Điệp|Thiên Hương Mẫu Hoàng/,'moth'],
 [/Thạch|Tượng|Quặng|Kim|Khôi|Cự Linh|Nham|Tinh Thiết/,'golem'],[/Hổ Phách|Ngọc|Tinh Thể|Tử Tinh|Lưu Ly/,'crystal'],
 [/Cổ Thú|Cự Thú|Thái Thú|Cự Kình|Hải Vương/,'dragon']
];
function vanKiepFormFor(name,zoneIndex,slot,bossRank){
 for(const [pattern,form] of VAN_KIEP_FORM_RULES)if(pattern.test(name))return form;
 return VAN_KIEP_SHAPE_FORMS[(zoneIndex*11+slot*7+(bossRank==null?0:bossRank*13))%VAN_KIEP_SHAPE_FORMS.length];
}


const VAN_KIEP_ZONE_BOUNDS=VAN_KIEP_ZONES.map((z,i)=>({start:i===0?1:Math.ceil(i*100/VAN_KIEP_ZONES.length)+1,end:i===VAN_KIEP_ZONES.length-1?100:Math.ceil((i+1)*100/VAN_KIEP_ZONES.length)}));
const VAN_KIEP_ZONE_AT_LEVEL=lv=>Math.min(VAN_KIEP_ZONES.length-1,Math.floor((Math.max(1,Math.min(100,lv))-1)*VAN_KIEP_ZONES.length/100));
const VAN_KIEP_STAT_INDEX={hp:0,atk:1,def:2,spd:3,mag:4};
function vanKiepPalette(zoneIndex,slot){
  const p=VAN_KIEP_PALETTES[zoneIndex],v=slot%4;
  if(v===1)return{...p,accent:p.light,glow:p.accent};
  if(v===2)return{...p,base:p.accent,accent:p.glow};
  if(v===3)return{...p,light:p.glow,glow:p.light};
  return p;
}
function vanKiepSkills(zoneIndex,role,bossRank,special={}){
   if(Array.isArray(special.ks))return special.ks.slice(0,bossRank==null?2:3);
   const rankSkill=bossRank===0?9:bossRank===1?4:16;
  return [...new Set([VAN_KIEP_ZONE_SKILLS[zoneIndex],role.skill,bossRank==null?null:rankSkill].filter(x=>x!=null))].slice(0,bossRank==null?2:3);
}
const M=VAN_KIEP_ZONES.flatMap((zone,zoneIndex)=>{
  const {start,end}=VAN_KIEP_ZONE_BOUNDS[zoneIndex],width=end-start+1;
  const makeMob=(name,slot,bossRank=null)=>{
    const isBoss=bossRank!=null;
    const role=isBoss?VAN_KIEP_BOSS_PROFILES[bossRank]:VAN_KIEP_FORMS[(zoneIndex*3+slot)%VAN_KIEP_FORMS.length];
    const special=VAN_KIEP_SPECIALS[name]||{};
    const pr=(special.pr||role.pr).slice();
    const statIndex=VAN_KIEP_STAT_INDEX[zone.buff.stat];
    if(statIndex!=null)pr[statIndex]*=1+zone.buff.pct/100;
    const eva=(special.eva==null?role.eva:special.eva)+(zone.buff.stat==='eva'?zone.buff.pct:0);
    const crit=(special.crit==null?role.crit:special.crit)+(zone.buff.stat==='crit'?zone.buff.pct:0);
    const regen=(special.regen==null?role.regen:special.regen)+(zone.buff.stat==='regen'?zone.buff.pct/2:0);
    const formulaMin=isBoss?(zone.bosses.length===1?start:start+Math.floor((bossRank/(zone.bosses.length-1))*(width-1))):start+Math.floor((slot*width)/zone.mobs.length),min=special.min==null?formulaMin:special.min;
    return{
      n:name,sp:zoneIndex,zone:zoneIndex,role:special.role||role.form,bl:special.bl||role.bl,look:special.look||role.look,
      form:special.form||vanKiepFormFor(name,zoneIndex,slot,bossRank),boss:isBoss?1:0,bossRank,min,
      pr,aura:VAN_KIEP_ZONES[zoneIndex]&&((typeof SCN!=='undefined'&&SCN[zoneIndex])?SCN[zoneIndex][4]:'180,180,200'),
      pal:special.pal||vanKiepPalette(zoneIndex,slot),
      t:special.t==null?role.t:special.t,eva,
      crit,stun:special.stun==null?role.stun:special.stun,
      regen,ks:vanKiepSkills(zoneIndex,role,bossRank,special),
      buff:zone.buff,lore:zone.lore,rankLabel:isBoss?'Chủ vùng':'Quái vùng'
    };
  };
  return zone.mobs.map((name,slot)=>makeMob(name,slot)).concat(zone.bosses.map((name,slot)=>makeMob(name,10+slot,slot)));
});


const VAN_KIEP_MOB_SPRITE_DATA=Object.freeze({"Băng Vĩ Linh Miêu":"img-mobs-bang-vi-linh-mieu.png","Tuyết Giáp Bọ":"img-mobs-2-tuyet-giap-bo.png","Băng Tinh Chồn":"img-mobs-bang-tinh-chon.png","Lam Vũ Tuyết Điêu":"img-mobs-lam-vu-tuyet-dieu.png","Bạch Sương U Linh":"img-mobs-bach-suong-u-linh.png","Băng Tủy Tướng Quân":"img-mobs-bang-tuy-tuong-quan.png","Sương Vũ Lộc":"img-mobs-2-suong-vu-loc.png","Mù Sương Dơi":"img-mobs-mu-suong-doi.png","Vụ Giáp Ngưu":"img-mobs-2-vu-giap-nguu.png","Bạch Thủy Ếch":"img-mobs-bach-thuy-ech.png","Sương Nham Thiềm":"img-mobs-2-suong-nham-thiem.png","Vạn Trượng Vụ Thú":"img-mobs-2-van-truong-vu-thu.png","Vân Miên Phi Điểu":"img-mobs-2-van-mien-phi-dieu.png","Phù Thạch Thạch Nhân":"img-mobs-2-phu-thach-thach-nhan.png","Vân Tước":"img-mobs-2-van-tuoc.png","Tinh Vân Mộc Linh":"img-mobs-2-tinh-van-moc-linh.png","Mộng Vân Hạc":"img-mobs-mong-van-hac.png","Vân Hải Kình Vương":"img-mobs-2-van-hai-kinh-vuong.png","Liệt Phong Ảnh Báo":"img-mobs-liet-phong-anh-bao.png","Bão Cát Sa Tích":"img-mobs-bao-cat-sa-tich.png","Phong Nhận Bọ Ngựa":"img-mobs-2-phong-nhan-bo-ngua.png","Hạc Lưu Phong":"img-mobs-hac-luu-phong.png","Phi Diệp Mộc Tinh":"img-mobs-2-phi-diep-moc-tinh.png","Phong Tai Cự Linh":"img-mobs-2-phong-tai-cu-linh.png","Lôi Nha Tê":"img-mobs-loi-nha-te.png","Sấm Vảy Thằn Lằn":"img-mobs-2-sam-vay-than-lan.png","Lôi Tâm Thạch Nhân":"img-mobs-loi-tam-thach-nhan.png","Tử Điện Ưng":"img-mobs-2-tu-dien-ung.png","Lôi Tơ Nhện":"img-mobs-loi-to-nhen.png","Thiên Lôi Đốc Quân":"img-mobs-2-thien-loi-doc-quan.png","Nguyệt Ảnh Miêu":"img-mobs-2-nguyet-anh-mieu.png","Ngân Quang Dơi":"img-mobs-ngan-quang-doi.png","Nguyệt Quế Mộc Tinh":"img-mobs-2-nguyet-que-moc-tinh.png","Nguyệt Sa Thủy Xà":"img-mobs-2-nguyet-sa-thuy-xa.png","Tinh Đăng Cú":"img-mobs-2-tinh-dang-cu.png","Nguyệt Thực Tế Quân":"img-mobs-2-nguyet-thuc-te-quan.png","Thổ Nham Sơn Hùng":"img-mobs-2-tho-nham-son-hung.png","Dương Quang Bọ Hung":"img-mobs-duong-quang-bo-hung.png","Lửa Vàng Sơn Miêu":"img-mobs-lua-vang-son-mieu.png","Hỏa Châm Nhím":"img-mobs-hoa-cham-nhim.png","Đồi Cát Cự Nhện":"img-mobs-doi-cat-cu-nhen.png","Dương Diệm Sơn Chủ":"img-mobs-duong-diem-son-chu.png","U Uyên Ma Chồn":"img-mobs-2-u-uyen-ma-chon.png","Hố Sâu Thạch Trùng":"img-mobs-ho-sau-thach-trung.png","Tịch Ảnh Dơi":"img-mobs-2-tich-anh-doi.png","Hắc Thạch Dạ Xoa":"img-mobs-hac-thach-da-xoa.png","Vạn Tơ U Xà":"img-mobs-2-van-to-u-xa.png","Huyền Uyên Trấn Giới":"img-mobs-huyen-uyen-tran-gioi.png","Kim Giáp Tê":"img-mobs-kim-giap-te.png","Bạc Cánh Bọ":"img-mobs-bac-canh-bo.png","Thiếc Giáp Tê Tê":"img-mobs-2-thiec-giap-te-te.png","Ngân Nha Chuột":"img-mobs-ngan-nha-chuot.png","Cổ Kim Cự Kê":"img-mobs-co-kim-cu-ke.png","Kim Sơn Khai Mạch":"img-mobs-kim-son-khai-mach.png","Bích Ngọc Thạch Tằm":"img-mobs-bich-ngoc-thach-tam.png","Ngọc Tâm Ếch":"img-mobs-2-ngoc-tam-ech.png","Huyết Ngọc Miêu":"img-mobs-huyet-ngoc-mieu.png","Lưu Ly Thủy Xà":"img-mobs-luu-ly-thuy-xa.png","Lam Ngọc Cú":"img-mobs-lam-ngoc-cu.png","Ngọc Tủy Thánh Thể":"img-mobs-2-ngoc-tuy-thanh-the.png",
    "Linh Chi Lộc":"img-mobs-linh-chi-loc.png",
    "Bách Diệp Thạch Ếch":"img-mobs-bach-diep-thach-ech.png",
    "Rêu Giáp Sơn Dê":"img-mobs-2-reu-giap-son-de.png",
    "Sương Mộc Nhện":"img-mobs-2-suong-moc-nhen.png",
    "Rừng Sâu Báo":"img-mobs-2-rung-sau-bao.png",
    "Cổ Thụ Thủ Lâm":"img-mobs-co-thu-thu-lam.png",
    "Nham Tích Viêm Giáp":"img-mobs-2-nham-tich-viem-giap.png",
    "Hồng Nham Bọ Cạp":"img-mobs-hong-nham-bo-cap.png",
    "Dung Nham Tê":"img-mobs-dung-nham-te.png",
    "Hỏa Tâm Thạch Nhân":"img-mobs-hoa-tam-thach-nhan.png",
    "Thiêu Đốt Sa Lang":"img-mobs-2-thieu-dot-sa-lang.png",
    "Nham Hạch Thái Thú":"img-mobs-2-nham-hach-thai-thu.png",
    "Hắc Diệp Cốt Thú":"img-mobs-hac-diep-cot-thu.png",
    "Bóng Đêm Bọ":"img-mobs-bong-dem-bo.png",
    "Mộng Yểm Mộc Linh":"img-mobs-mong-yem-moc-linh.png",
    "U Hỏa Cự Miêu":"img-mobs-2-u-hoa-cu-mieu.png",
    "Mộ Lâm Thạch Quỷ":"img-mobs-mo-lam-thach-quy.png",
    "Hắc Nhật Tàn Quân":"img-mobs-hac-nhat-tan-quan.png",
    "Tử Tinh Hải Ngư":"img-mobs-2-tu-tinh-hai-ngu.png",
    "Phấn Tinh Bọ":"img-mobs-2-phan-tinh-bo.png",
    "Tử Tinh Cự Ốc":"img-mobs-2-tu-tinh-cu-oc.png",
    "Hắc Thủy Cá Đao":"img-mobs-hac-thuy-ca-dao.png",
    "Thủy Tinh Hạc":"img-mobs-2-thuy-tinh-hac.png",
    "Thủy Tinh Hải Vương":"img-mobs-2-thuy-tinh-hai-vuong.png",
    "Vân Tầng Phi Mã":"img-mobs-2-van-tang-phi-ma.png",
    "Thiên Trụ Thạch Nhân":"img-mobs-2-thien-tru-thach-nhan.png",
    "Lam Vũ Hạc":"img-mobs-lam-vu-hac.png",
    "Tinh Khe Dơi":"img-mobs-2-tinh-khe-doi.png",
    "Cánh Bạc Chim Ưng":"img-mobs-canh-bac-chim-ung.png",
    "Thiên Không Vương":"img-mobs-2-thien-khong-vuong.png",
  "Hồng Liên Phấn Điệp":"img-mobs-hong-lien-phan-diep.png",
  "Mộc Lan Cự Ong":"img-mobs-moc-lan-cu-ong.png",
  "Ngọc Diệp Tinh":"img-mobs-ngoc-diep-tinh.png",
  "Thủy Tiên Thủy Xà":"img-mobs-2-thuy-tien-thuy-xa.png",
  "Lục Tán Cự Ếch":"img-mobs-luc-tan-cu-ech.png",
  "Bách Hoa Tiên Chủ":"img-mobs-bach-hoa-tien-chu.png",
  "Thần Điện Kim Tượng":"img-mobs-2-than-dien-kim-tuong.png",
  "Thần Văn Thiên Xà":"img-mobs-2-than-van-thien-xa.png",
  "Thánh Ấn Bạch Hạc":"img-mobs-2-thanh-an-bach-hac.png",
  "Trụ Đá Khổng Lồ":"img-mobs-2-tru-da-khong-lo.png",
  "Thần Quang Mộc Linh":"img-mobs-2-than-quang-moc-linh.png",
  "Thập Nhị Quang Tướng":"img-mobs-2-thap-nhi-quang-tuong.png"
  });

(()=>{
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));let busy=false;
const mobLayer=document.createElement('canvas');mobLayer.width=128;mobLayer.height=128;
const mobCtx=mobLayer.getContext('2d');
function mobPixel(ctx,x,y,w,h,color,alpha=1){
 ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));ctx.globalAlpha=1;
}
function mobDiamond(ctx,x,y,size,color,dark){
 for(let row=0;row<size;row++){const half=Math.max(1,Math.floor((row<size/2?row+1:size-row)/2));mobPixel(ctx,x-half,y+row,half*2,1,dark);if(half>1)mobPixel(ctx,x-half+1,y+row,half*2-2,1,color)}
}
function mobEllipse(ctx,cx,top,width,height,color,step=3){
 for(let y=0;y<height;y+=step){const mid=y+Math.min(step,height-y)/2,t=(mid-height/2)/(height/2),
  half=Math.max(1,Math.round(width*.5*Math.sqrt(Math.max(0,1-t*t))));
  mobPixel(ctx,cx-half,top+y,half*2,Math.min(step,height-y),color)}
}
function drawCreatureBody(ctx,m,T){
 ctx.save();
 try{
 const p=m.pal,f=m.form,px=(x,y,w,h,c)=>mobPixel(ctx,x,y,w,h,c);
 const oval=(x,y,w,h,c=p.base)=>{mobEllipse(ctx,x,y,w+4,h+4,p.dark,2);mobEllipse(ctx,x,y+2,w,h-4,c,2)};
 const eye=(x,y)=>{px(x,y,4,4,p.dark);px(x+1,y+1,2,2,p.glow)};
 const leg=(x,y,w=6,h=18,c=p.base)=>{px(x,y,w+2,h,p.dark);px(x+1,y,w,h-2,c);px(x-1,y+h-2,w+4,3,p.dark)};
 const ear=(x,y,dir=1)=>{mobDiamond(ctx,x,y,11,p.accent,p.dark);px(x+dir,y+3,3,3,p.light)};
 const horn=(x,y,dir=1)=>{px(x,y,5,8,p.dark);px(x+dir*2,y-5,4,8,p.light);px(x+dir*4,y-9,3,6,p.glow)};
 const tail=(x,y,len=24,c=p.accent)=>{for(let i=0;i<len;i+=4)px(x-i,y-Math.floor(i/8),5,3,i%8?c:p.dark);mobDiamond(ctx,x-len,y-Math.floor(len/8)-2,8,p.light,p.dark)};
 const quad=(type)=>{
  const bulk=type==='bear'||type==='yak'||type==='ox'||type==='rhino',bodyY=bulk?49:54;
  leg(43,69,bulk?9:6,bulk?25:20);leg(58,70,bulk?8:5,bulk?25:20);leg(78,69,bulk?8:5,bulk?25:20);leg(92,67,bulk?8:5,bulk?25:20);
  oval(63,bodyY,bulk?51:47,bulk?31:23,type==='yak'?p.light:p.base);
  oval(type==='rhino'?94:90,bodyY-2,type==='boar'?26:22,21,type==='bear'?p.light:p.base);
  eye(type==='boar'?99:97,bodyY+5);
  if(type==='wolf'||type==='cat'||type==='panther'||type==='boar'||type==='rhino'||type==='lizard'||type==='crocodile')mobDiamond(ctx,108,bodyY+5,13,p.light,p.dark);
  if(type==='wolf'){ear(83,bodyY-14);ear(95,bodyY-14);tail(43,bodyY+6,27,p.accent);px(109,bodyY+14,8,2,p.dark)}
  if(type==='cat'||type==='panther'){ear(84,bodyY-15);ear(96,bodyY-15);for(let i=0;i<5;i++){const yy=bodyY+2+i*4,xx=40-i*3;mobDiamond(ctx,xx,yy,18-i,p.accent,p.dark)}px(108,bodyY+13,7,2,p.dark)}
  if(type==='weasel'){ear(85,bodyY-12);tail(42,bodyY+8,32,p.glow);px(96,bodyY+15,10,3,p.light);px(55,bodyY+1,3,5,p.accent);px(67,bodyY+2,3,5,p.accent)}
  if(type==='bear'){oval(91,bodyY-9,25,23,p.light);mobEllipse(ctx,84,bodyY-12,9,9,p.accent,2);mobEllipse(ctx,100,bodyY-12,9,9,p.accent,2);px(94,bodyY+11,13,5,p.light);px(48,bodyY+15,5,4,p.glow)}
  if(type==='ox'||type==='yak'){horn(83,bodyY-14,-1);horn(104,bodyY-14,1);if(type==='yak')for(let i=0;i<7;i++)px(48+i*7,bodyY+19,5,8,i%2?p.light:p.accent);px(104,bodyY+12,8,4,p.dark)}
  if(type==='rhino'){mobDiamond(ctx,109,bodyY-5,13,p.light,p.dark);mobDiamond(ctx,49,bodyY+1,16,p.accent,p.dark);px(64,bodyY+4,20,3,p.glow)}
  if(type==='boar'){mobDiamond(ctx,111,bodyY+10,9,p.light,p.dark);px(101,bodyY+15,4,6,p.glow);px(111,bodyY+15,4,6,p.glow);for(let i=0;i<6;i++)mobDiamond(ctx,50+i*7,bodyY-8,9,p.accent,p.dark)}
  if(type==='stag'||type==='goat'){horn(84,bodyY-16,-1);horn(101,bodyY-16,1);if(type==='stag'){px(78,bodyY-24,3,9,p.accent);px(75,bodyY-27,8,3,p.light);px(104,bodyY-24,3,9,p.accent);px(103,bodyY-27,8,3,p.light)}}
  if(type==='deer'){px(78,bodyY-21,3,10,p.accent);px(74,bodyY-25,9,3,p.light);px(102,bodyY-21,3,10,p.accent);px(100,bodyY-25,9,3,p.light);px(93,bodyY+13,5,3,p.glow)}
  if(type==='horse'){for(let i=0;i<7;i++)px(80+i*3,bodyY-8-i%2*3,4,13,p.accent);tail(42,bodyY+3,19,p.glow)}
  if(type==='armadillo'){oval(64,bodyY-5,41,30,p.accent);for(let i=0;i<5;i++)px(48+i*7,bodyY-4,3,27,p.dark);px(101,bodyY+9,12,5,p.light)}
  if(type==='porcupine'){for(let i=0;i<9;i++)mobDiamond(ctx,45+i*6,bodyY-14+(i%2)*3,13,p.light,p.dark)}
  if(type==='rabbit'){ear(84,bodyY-25);ear(99,bodyY-27);oval(104,bodyY+8,9,8,p.light);px(110,bodyY+10,4,4,p.glow)}
 };
 const humanoid=(type)=>{
  const slim=type==='goblin'||type==='skeleton'||type==='mummy';
  leg(54,72,slim?7:10,23);leg(76,72,slim?7:10,23);
  oval(67,43,slim?25:34,32,type==='skeleton'?p.light:p.base);
  px(49,46,slim?8:11,24,p.dark);px(50,48,slim?5:8,20,p.accent);
  px(79,46,slim?8:11,24,p.dark);px(81,48,slim?5:8,20,p.base);
  oval(67,19,25,24,type==='skeleton'?p.light:p.base);
  eye(59,28);eye(72,28);
   if(type==='goblin'){ear(45,22,-1);ear(83,22,1);mobDiamond(ctx,88,32,10,p.accent,p.dark);px(59,41,17,4,p.glow);mobDiamond(ctx,91,52,7,p.light,p.dark)}
   if(type==='priest'){mobDiamond(ctx,67,12,21,p.accent,p.dark);px(57,24,21,5,p.glow);px(49,58,35,29,p.accent);px(54,61,26,22,p.base);px(94,39,3,42,p.dark);mobDiamond(ctx,92,34,11,p.glow,p.dark);px(61,48,4,3,p.light);px(71,48,4,3,p.light)}
  if(type==='skeleton'){px(60,39,15,3,p.dark);for(let i=0;i<4;i++)px(56+i*7,47,3,17,p.light);px(63,36,9,4,p.dark);mobDiamond(ctx,67,53,5,p.glow,p.dark);px(62,67,4,10,p.light);px(72,67,4,10,p.light)}
  if(type==='werewolf'){ear(53,10,-1);ear(73,10,1);mobDiamond(ctx,89,30,14,p.light,p.dark);px(56,68,3,9,p.glow);px(77,69,3,9,p.glow);for(let i=0;i<5;i++)mobDiamond(ctx,50+i*8,45,9,p.accent,p.dark)}
  if(type==='mummy'){for(let y=25;y<80;y+=8){px(53,y,29,3,p.light);px(57,y+3,22,2,p.accent)}px(61,19,15,4,p.light);px(62,28,4,3,p.dark);px(71,28,4,3,p.dark)}
  if(type==='minotaur'){horn(49,18,-1);horn(79,18,1);mobDiamond(ctx,88,32,11,p.light,p.dark);oval(67,39,40,34,p.accent);px(62,37,13,4,p.dark)}
  if(type==='ghoul'){px(58,39,20,6,p.dark);mobDiamond(ctx,66,45,10,p.accent,p.dark);px(55,60,8,8,p.glow);px(75,58,8,10,p.glow)}
  if(type==='demon'){horn(53,15,-1);horn(79,15,1);px(59,37,17,4,p.dark);px(61,38,5,3,p.glow);px(72,38,5,3,p.glow);mobDiamond(ctx,67,53,12,p.accent,p.dark)}
  if(type==='ape'){px(43,48,11,31,p.dark);px(45,50,8,29,p.base);px(82,48,11,31,p.dark);px(84,50,8,29,p.base);px(44,75,15,7,p.light);px(80,75,15,7,p.light)}
 };
 const wingPair=(x,y,wide=23)=>{
  mobDiamond(ctx,x-wide,y,wide,p.base,p.dark);mobDiamond(ctx,x+wide,y,wide,p.accent,p.dark);
  for(let i=0;i<4;i++){px(x-wide+4+i*3,y+4+i%2*3,3,10,p.light);px(x+wide-14+i*3,y+4+i%2*3,3,10,p.glow)}
 };
  if(['wolf','cat','panther','weasel','bear','ox','rhino','yak','boar','stag','deer','goat','horse','rabbit','armadillo','porcupine'].includes(f))quad(f);
  else if(['goblin','skeleton','werewolf','mummy','minotaur','priest','ghoul','demon'].includes(f))humanoid(f);
  else if(f==='monkey'){humanoid('ape');tail(48,54,30,p.accent);mobEllipse(ctx,89,26,14,12,p.light,2)}
  else if(f==='mole'){oval(63,51,47,28,p.base);oval(96,58,23,18,p.light);mobDiamond(ctx,109,59,10,p.accent,p.dark);eye(99,55);px(54,72,11,6,p.dark);px(77,72,11,6,p.dark);for(let i=0;i<4;i++)px(54+i*11,43,4,10,p.dark);px(88,67,4,6,p.glow)}
  else if(f==='bee'){
   oval(68,43,34,25,p.base);for(let i=0;i<4;i++)px(52+i*10,47,4,20,i%2?p.dark:p.accent);
   mobDiamond(ctx,54,29,17,p.light,p.dark);mobDiamond(ctx,79,28,17,p.glow,p.dark);
   mobDiamond(ctx,94,44,13,p.light,p.dark);eye(89,43);px(100,57,4,9,p.dark);
   for(let i=0;i<3;i++){px(56+i*13,65,3,11,p.dark);px(65+i*9,25,2,9,p.accent)}
  }
  else if(f==='beetle'||f==='mantis'){
  oval(68,42,39,35,p.base);mobEllipse(ctx,68,35,48,29,p.accent,3);
  for(let i=0;i<6;i++){const y=52+i%2*7;px(36+i*3,y,18,3,p.dark);px(33+i*3,y+5,12,3,p.light)}
  px(52,71,5,18,p.dark);px(77,71,5,18,p.dark);mobDiamond(ctx,57,18,13,p.light,p.dark);mobDiamond(ctx,77,18,13,p.accent,p.dark);eye(61,48);
  if(f==='mantis'){mobDiamond(ctx,43,44,18,p.glow,p.dark);mobDiamond(ctx,92,44,18,p.glow,p.dark);px(42,40,15,4,p.dark);px(92,39,14,4,p.dark)}
 }
 else if(f==='spider'){
  oval(69,44,28,24,p.base);oval(69,28,19,18,p.accent);
  for(let i=0;i<4;i++){const y=43+i*7;px(37+i%2*4,y,20,3,p.dark);px(29+i%2*5,y+5,15,3,p.base);px(82-i%2*4,y,20,3,p.dark);px(93-i%2*5,y+5,15,3,p.base)}
  for(let i=0;i<4;i++)eye(59+i*7,34);
 }
 else if(f==='scorpion'){
  oval(63,51,36,23,p.base);oval(88,48,18,16,p.accent);
  for(let i=0;i<3;i++){px(47+i*7,69+i%2*3,4,14,p.dark);px(79+i*7,69+i%2*3,4,14,p.dark)}
  for(let i=0;i<5;i++)mobDiamond(ctx,75+i*5,37-i*5,10,p.accent,p.dark);mobDiamond(ctx,101,15,12,p.glow,p.dark);
  mobDiamond(ctx,39,51,16,p.light,p.dark);mobDiamond(ctx,98,51,16,p.light,p.dark);eye(91,51);
 }
  else if(f==='moth'||f==='bat'||f==='bird'||f==='owl'||f==='vulture'||f==='crane'||f==='eagle'||f==='falcon'||f==='rooster'||f==='sparrow'||f==='raven'||f==='nightjar'||f==='dragon'){
  if(f==='bat'){wingPair(67,44,31);px(61,34,13,34,p.dark);mobDiamond(ctx,67,26,24,p.base,p.dark);ear(55,13,-1);ear(78,13,1);eye(59,30);eye(73,30);px(64,70,4,14,p.dark)}
  else if(f==='moth'){wingPair(67,45,26);oval(67,39,14,38,p.accent);px(62,24,3,13,p.dark);px(71,24,3,13,p.dark);eye(63,38);eye(71,38)}
  else if(f==='owl'){wingPair(67,45,22);oval(67,33,38,43,p.base);mobEllipse(ctx,55,39,18,18,p.light,2);mobEllipse(ctx,77,39,18,18,p.light,2);eye(62,45);eye(79,45);mobDiamond(ctx,68,56,9,p.accent,p.dark);ear(51,20,-1);ear(83,20,1)}
   else if(f==='vulture'){wingPair(67,49,30);oval(62,39,32,37,p.base);mobDiamond(ctx,91,34,20,p.light,p.dark);mobDiamond(ctx,103,43,12,p.accent,p.dark);px(92,25,10,7,p.dark);eye(93,34);px(54,70,5,15,p.dark);px(69,70,5,15,p.dark)}
   else if(f==='crane'){wingPair(66,47,20);px(63,29,7,30,p.base);mobEllipse(ctx,65,20,16,17,p.light,2);px(68,31,4,23,p.accent);px(68,30,26,3,p.glow);px(53,66,3,20,p.dark);px(75,66,3,20,p.dark)}
   else if(f==='eagle'){wingPair(67,40,34);oval(65,36,31,31,p.base);mobDiamond(ctx,91,31,18,p.light,p.dark);mobDiamond(ctx,103,41,11,p.accent,p.dark);horn(88,22,1);eye(93,32);px(57,63,5,19,p.dark);px(73,63,5,19,p.dark)}
   else if(f==='falcon'){wingPair(67,43,28);oval(65,38,29,29,p.base);mobDiamond(ctx,90,32,17,p.light,p.dark);mobDiamond(ctx,104,39,13,p.accent,p.dark);px(101,45,14,3,p.dark);eye(92,33);px(58,62,4,16,p.dark);px(72,62,4,16,p.dark)}
   else if(f==='rooster'){wingPair(66,47,21);oval(64,39,34,31,p.base);mobDiamond(ctx,91,31,16,p.light,p.dark);mobDiamond(ctx,103,40,10,p.accent,p.dark);for(let i=0;i<4;i++)mobDiamond(ctx,53+i*8,19-i%2*3,10,p.glow,p.dark);tail(55,50,27,p.accent);eye(94,32)}
   else if(f==='sparrow'){wingPair(66,50,17);oval(66,43,35,28,p.base);mobDiamond(ctx,89,39,13,p.light,p.dark);mobDiamond(ctx,100,45,8,p.accent,p.dark);eye(91,39);px(59,65,4,13,p.dark);px(72,65,4,13,p.dark)}
   else if(f==='raven'){wingPair(67,45,30);oval(64,38,31,34,p.dark);mobDiamond(ctx,91,33,17,p.base,p.dark);mobDiamond(ctx,104,39,12,p.accent,p.dark);eye(91,33);tail(58,58,24,p.glow);px(58,68,4,13,p.dark);px(73,68,4,13,p.dark)}
   else if(f==='nightjar'){wingPair(67,48,27);oval(66,39,33,31,p.base);mobEllipse(ctx,60,40,13,16,p.light,2);mobEllipse(ctx,75,40,13,16,p.light,2);eye(63,45);eye(77,45);mobDiamond(ctx,94,47,9,p.accent,p.dark);tail(63,63,16,p.glow)}
  else if(f==='dragon'){wingPair(65,46,31);oval(64,48,43,25,p.base);oval(92,39,25,20,p.light);mobDiamond(ctx,108,41,14,p.accent,p.dark);for(let i=0;i<6;i++)mobDiamond(ctx,46+i*8,39,10,p.glow,p.dark);tail(43,57,31,p.accent);horn(84,23,-1);horn(99,23,1);eye(100,41)}
  else{wingPair(67,43,29);oval(67,36,24,33,p.base);mobDiamond(ctx,88,35,15,p.light,p.dark);mobDiamond(ctx,99,43,12,p.accent,p.dark);eye(89,35);px(60,64,5,15,p.dark);px(74,64,5,15,p.dark);tail(60,62,17,p.glow)}
 }
 else if(f==='serpent'||f==='lizard'||f==='crocodile'){
  if(f==='serpent'){for(let i=0;i<5;i++)mobEllipse(ctx,34+i*13,50+(i%2)*9,23,16,i%2?p.base:p.accent,3);oval(91,32,25,22,p.light);mobDiamond(ctx,106,39,11,p.glow,p.dark);eye(96,37);px(107,48,8,3,p.dark);px(66,38,4,9,p.glow)}
  else if(f==='crocodile'){oval(61,56,64,21,p.base);oval(101,50,28,15,p.light);mobDiamond(ctx,114,55,13,p.accent,p.dark);for(let i=0;i<7;i++)mobDiamond(ctx,45+i*9,44,11,p.glow,p.dark);leg(43,68,5,14);leg(66,68,5,14);leg(84,67,5,14);tail(38,61,31,p.base);eye(99,49);px(103,61,13,3,p.dark)}
  else{oval(62,52,43,23,p.base);oval(92,43,24,22,p.light);tail(44,61,32,p.accent);for(let i=0;i<6;i++)mobDiamond(ctx,49+i*8,39-i%2*4,9,p.glow,p.dark);leg(48,67,5,16);leg(69,67,5,16);leg(85,64,5,15);leg(99,60,5,13);ear(83,25,-1);eye(97,48)}
 }
 else if(f==='crab'){
  oval(67,43,47,30,p.base);mobEllipse(ctx,67,35,40,28,p.accent,3);
  for(let i=0;i<4;i++){const y=54+i*5;px(32+i*3,y,20,3,p.dark);px(31+i*3,y+5,15,3,p.light);px(83-i*3,y,20,3,p.dark);px(88-i*3,y+5,15,3,p.base)}
  mobDiamond(ctx,31,39,18,p.glow,p.dark);mobDiamond(ctx,101,38,18,p.light,p.dark);eye(59,46);eye(75,46);
 }
 else if(f==='golem'){
  mobDiamond(ctx,68,27,39,p.base,p.dark);mobDiamond(ctx,66,45,39,p.accent,p.dark);
  mobDiamond(ctx,42,49,24,p.light,p.dark);mobDiamond(ctx,93,49,24,p.base,p.dark);
  mobDiamond(ctx,55,76,17,p.dark,p.dark);mobDiamond(ctx,79,76,17,p.dark,p.dark);
  px(58,47,7,4,p.glow);px(74,47,7,4,p.glow);px(65,61,10,3,p.dark);px(51,36,6,3,p.light);px(78,67,7,3,p.light);
 }
 else if(f==='tree'){
  px(61,37,15,46,p.dark);px(64,39,9,43,p.base);px(43,51,19,7,p.dark);px(75,48,22,7,p.dark);
  mobDiamond(ctx,48,26,24,p.light,p.dark);mobDiamond(ctx,72,15,28,p.accent,p.dark);mobDiamond(ctx,89,29,22,p.base,p.dark);
  px(54,73,9,9,p.accent);px(71,74,12,8,p.glow);px(60,35,5,3,p.light);
 }
  else if(['fish','whale','swordfish','shark','jellyfish'].includes(f)){
  if(f==='jellyfish'){mobEllipse(ctx,68,24,49,34,p.light,3);mobEllipse(ctx,68,27,39,27,p.accent,3);for(let i=0;i<6;i++){px(46+i*8,55,3,28+(i%2)*6,i%2?p.glow:p.base);px(49+i*8,62,2,20,p.dark)}mobEllipse(ctx,55,35,8,7,p.glow,2);mobEllipse(ctx,77,35,8,7,p.light,2)}
  else if(f==='swordfish'){oval(55,42,53,25,p.base);mobDiamond(ctx,103,45,14,p.accent,p.dark);px(99,40,25,3,p.light);mobDiamond(ctx,69,31,14,p.glow,p.dark);mobDiamond(ctx,70,59,13,p.accent,p.dark);eye(43,49);for(let i=0;i<3;i++)px(61+i*7,48,2,12,p.dark)}
  else if(f==='shark'){oval(56,42,57,32,p.dark);oval(57,44,50,25,p.base);mobDiamond(ctx,103,43,17,p.accent,p.dark);mobDiamond(ctx,75,27,17,p.light,p.dark);mobDiamond(ctx,80,59,14,p.glow,p.dark);eye(44,48);for(let i=0;i<5;i++)mobDiamond(ctx,91+i*4,54,6,p.light,p.dark);px(52,40,4,9,p.dark)}
  else{oval(55,42,f==='whale'?61:47,f==='whale'?37:27,p.base);mobDiamond(ctx,104,45,20,p.accent,p.dark)}
  if(f!=='jellyfish'){
  mobDiamond(ctx,69,35,17,p.light,p.dark);mobDiamond(ctx,75,57,14,p.glow,p.dark);
  eye(47,51);px(43,61,8,3,p.dark);
  for(let i=0;i<4;i++)px(60+i*6,48,2,14,p.accent);
  if(f==='whale'){px(78,30,6,5,p.glow);px(79,25,3,7,p.light);px(36,65,8,10,p.dark)}
  }
 }
 else if(f==='turtle'){
  oval(65,37,52,37,p.accent);mobEllipse(ctx,65,34,45,34,p.dark,3);mobEllipse(ctx,65,37,37,27,p.base,3);
  for(let i=0;i<4;i++){px(52+i*8,44,3,18,p.light);px(48+i*8,51,9,3,p.dark)}
  oval(100,45,19,17,p.light);eye(105,50);leg(43,67,8,14,p.base);leg(82,67,8,14,p.base);mobDiamond(ctx,110,52,7,p.glow,p.dark);
 }
 else if(f==='frog'||f==='toad'){
  oval(67,51,53,30,f==='toad'?p.accent:p.base);mobEllipse(ctx,52,32,17,19,p.light,2);mobEllipse(ctx,83,32,17,19,p.light,2);eye(58,38);eye(80,38);
  px(48,74,12,5,p.dark);px(77,74,12,5,p.dark);mobDiamond(ctx,95,61,9,p.accent,p.dark);px(63,62,12,3,p.dark);
  if(f==='toad')for(let i=0;i<7;i++)mobEllipse(ctx,48+i*6,51+(i%2)*7,5,5,p.glow,2);
 }
 else if(f==='rat'){
  oval(63,53,47,26,p.base);oval(96,56,21,20,p.light);mobEllipse(ctx,88,40,15,15,p.accent,2);mobEllipse(ctx,104,39,15,15,p.accent,2);
  eye(98,54);px(109,64,8,4,p.dark);px(107,68,3,5,p.light);px(114,68,3,5,p.light);
  for(let i=0;i<4;i++){px(99,65+i*4,13,2,p.light);px(44+i*3,59+i*3,10,2,p.glow)}
  leg(48,71,6,13);leg(76,71,6,13);tail(45,65,38,p.accent);
 }
 else if(f==='armadillo'){
  oval(63,50,51,32,p.accent);for(let i=0;i<6;i++){px(42+i*8,45,4,32,p.dark);px(44+i*8,47,2,28,p.light)}
  oval(100,57,19,16,p.base);px(104,66,11,4,p.dark);leg(48,70,7,14);leg(79,70,7,14);tail(39,61,15,p.glow);eye(101,57);
 }
 else if(f==='porcupine'){
  oval(68,49,46,34,p.base);for(let i=0;i<11;i++){mobDiamond(ctx,42+i*5,28+(i%3)*4,16,i%2?p.light:p.accent,p.dark)}
  oval(96,57,20,18,p.light);eye(100,58);px(106,66,7,3,p.dark);leg(53,73,6,13);leg(82,73,6,13);
 }
 else if(f==='snail'){
  oval(48,63,42,18,p.base);mobEllipse(ctx,68,31,38,42,p.dark,3);mobEllipse(ctx,68,34,29,35,p.accent,3);
  mobEllipse(ctx,68,43,18,20,p.light,3);px(88,44,4,18,p.dark);px(98,44,4,18,p.dark);eye(88,42);eye(99,42);
 }
 else if(f==='caterpillar'){
  for(let i=0;i<6;i++){mobEllipse(ctx,31+i*13,52+(i%2)*5,22,21,i%2?p.base:p.light,3);leg(34+i*12,69,4,9,p.dark)}
  mobEllipse(ctx,99,44,22,23,p.accent,3);eye(96,51);px(99,36,3,11,p.dark);px(106,36,3,11,p.dark);
 }
 else if(f==='mushroom'){
  oval(68,45,22,38,p.light);mobEllipse(ctx,68,20,69,34,p.dark,3);mobEllipse(ctx,68,22,61,27,p.base,3);
  for(let i=0;i<5;i++)mobEllipse(ctx,43+i*12,28+(i%2)*4,8,7,i%2?p.glow:p.accent,2);
  px(61,54,5,4,p.dark);px(72,54,5,4,p.dark);leg(57,78,6,12);leg(74,78,6,12);
 }
 else if(f==='fungalStag'){
  quad('stag');mobEllipse(ctx,68,22,43,24,p.dark,3);mobEllipse(ctx,68,24,37,18,p.accent,3);
  for(let i=0;i<4;i++)mobEllipse(ctx,52+i*11,28+(i%2)*3,7,6,i%2?p.glow:p.light,2);
  px(63,42,4,4,p.glow);px(75,43,4,4,p.light);
 }
 else if(f==='flower'){
  for(let i=0;i<8;i++){const x=68+Math.cos(i*Math.PI/4)*18,y=39+Math.sin(i*Math.PI/4)*18;mobDiamond(ctx,Math.round(x),Math.round(y),17,i%2?p.light:p.accent,p.dark)}
  mobEllipse(ctx,68,31,17,18,p.glow,2);px(64,49,8,27,p.dark);px(66,50,4,25,p.base);
  mobDiamond(ctx,54,63,16,p.light,p.dark);mobDiamond(ctx,82,64,16,p.accent,p.dark);leg(62,75,5,14);leg(72,75,5,14);
 }
 else if(f==='crystal'){
  [[35,46,25],[52,27,31],[73,39,30],[94,46,23],[62,61,22]].forEach((q,i)=>mobDiamond(ctx,q[0],q[1],q[2],i%2?p.accent:p.light,p.dark));
  px(61,47,6,5,p.glow);px(79,57,6,4,p.glow);px(47,72,5,12,p.dark);px(84,72,5,12,p.dark);
 }
 else if(f==='spirit'||f==='slime'){
  if(f==='spirit'){mobDiamond(ctx,67,20,30,p.light,p.dark);mobEllipse(ctx,49,46,38,31,p.base,3);mobEllipse(ctx,85,46,38,31,p.accent,3);px(61,44,5,5,p.dark);px(74,44,5,5,p.dark);px(63,45,2,2,p.glow);px(76,45,2,2,p.glow);for(let i=0;i<4;i++)mobDiamond(ctx,42+i*15,75+(i%2)*5,10,p.glow,p.dark)}
  else{mobEllipse(ctx,67,35,57,45,p.dark,3);mobEllipse(ctx,67,38,49,39,p.base,3);mobEllipse(ctx,53,45,12,11,p.light,2);mobEllipse(ctx,80,45,12,11,p.light,2);eye(52,47);eye(79,47);px(61,62,14,3,p.accent);mobEllipse(ctx,44,31,10,9,p.glow,2)}
 }
 else if(f==='horse'){
  quad('horse')
 }
 else{
  quad('wolf');
 }
 if(m.boss){
  mobDiamond(ctx,67,8,13,p.glow,p.dark);px(54,19,6,4,p.accent);px(76,19,6,4,p.accent);
  ctx.globalAlpha=.72;ctx.strokeStyle=p.glow;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(67,91,42,8,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
 }
 }finally{ctx.restore()}
}
function drawMobDetails(ctx,m,T){
 const p=m.pal;ctx.save();ctx.imageSmoothingEnabled=false;
 if(m.form==='wolf'){
  mobDiamond(ctx,46,39,13,p.light,p.dark);mobDiamond(ctx,58,33,9,p.accent,p.dark);
  mobPixel(ctx,78,23,5,8,p.dark);mobPixel(ctx,80,20,2,7,p.light);
  mobPixel(ctx,88,29,4,7,p.dark);mobPixel(ctx,90,26,2,6,p.accent);
  mobPixel(ctx,48,60,5,3,p.glow);mobPixel(ctx,57,65,3,3,p.light);
  mobPixel(ctx,96,54,4,2,p.light);mobPixel(ctx,91,61,3,2,p.glow);
 }else if(m.form==='mushroom'){
  mobEllipse(ctx,84,20,70,34,p.dark,4);mobEllipse(ctx,84,20,62,27,p.base,3);
  mobEllipse(ctx,76,24,33,9,p.light,3);
  mobEllipse(ctx,66,32,8,7,p.light,2);mobEllipse(ctx,83,27,9,7,p.accent,2);
  mobEllipse(ctx,99,33,8,7,p.light,2);mobEllipse(ctx,78,35,5,4,p.glow,2);
  mobPixel(ctx,78,46,20,4,p.dark);mobPixel(ctx,81,49,14,13,p.light);mobPixel(ctx,85,51,6,10,p.base);
 }else if(m.form==='lava'){
  mobDiamond(ctx,42,39,15,p.dark,p.dark);mobDiamond(ctx,53,33,12,p.base,p.dark);mobDiamond(ctx,69,40,14,p.light,p.dark);
  mobPixel(ctx,52,45,3,9,p.accent);mobPixel(ctx,56,48,2,7,p.glow);mobPixel(ctx,70,47,3,12,p.accent);
  mobPixel(ctx,77,52,2,8,p.glow);mobPixel(ctx,85,44,3,10,p.accent);
  mobPixel(ctx,59,28,3,7,p.dark);mobPixel(ctx,61,26,2,6,p.glow);
  mobPixel(ctx,75,29,3,7,p.dark);mobPixel(ctx,77,27,2,6,p.accent);
 }else if(m.form==='beetle'){
  mobPixel(ctx,51,32,4,13,p.dark);mobPixel(ctx,53,27,4,9,p.accent);mobPixel(ctx,56,23,4,7,p.light);
  mobPixel(ctx,78,32,4,13,p.dark);mobPixel(ctx,80,27,4,9,p.accent);mobPixel(ctx,83,23,4,7,p.light);
  mobDiamond(ctx,49,48,8,p.light,p.dark);mobDiamond(ctx,76,45,7,p.accent,p.dark);
  mobPixel(ctx,62,46,2,12,p.dark);mobPixel(ctx,64,48,2,8,p.light);
  mobPixel(ctx,91,54,5,2,p.dark);mobPixel(ctx,95,56,4,2,p.accent);
  mobPixel(ctx,93,60,4,2,p.light);mobPixel(ctx,49,68,6,2,p.dark);mobPixel(ctx,58,71,6,2,p.dark);
  mobPixel(ctx,84,71,6,2,p.dark);mobPixel(ctx,93,68,6,2,p.dark);
 }else if(m.form==='bear'){
  mobPixel(ctx,70,37,7,4,p.dark);mobPixel(ctx,74,34,4,5,p.light);
  mobPixel(ctx,88,39,7,4,p.dark);mobPixel(ctx,91,36,4,5,p.light);
  mobDiamond(ctx,94,49,11,p.base,p.dark);mobPixel(ctx,98,54,7,4,p.light);
  mobPixel(ctx,103,57,4,3,p.dark);mobPixel(ctx,96,61,3,3,p.accent);
  mobPixel(ctx,45,55,4,3,p.accent);mobPixel(ctx,54,60,3,3,p.light);
  mobPixel(ctx,66,67,3,4,p.dark);mobPixel(ctx,79,69,3,4,p.dark);
 }else if(m.form==='demon'){
  mobDiamond(ctx,48,20,13,p.accent,p.dark);mobDiamond(ctx,83,20,13,p.accent,p.dark);
  mobPixel(ctx,58,47,20,4,p.dark);mobPixel(ctx,63,51,14,5,p.base);
  mobDiamond(ctx,69,56,9,p.accent,p.dark);mobPixel(ctx,64,52,4,2,p.glow);mobPixel(ctx,79,52,4,2,p.glow);
  mobPixel(ctx,62,67,5,3,p.dark);mobPixel(ctx,72,70,7,3,p.glow);mobPixel(ctx,84,67,5,3,p.dark);
 }else if(m.form==='winged'){
  mobDiamond(ctx,43,46,18,p.base,p.dark);mobDiamond(ctx,88,45,18,p.light,p.dark);
  mobPixel(ctx,46,47,16,3,p.accent);mobPixel(ctx,83,46,17,3,p.glow);
  mobPixel(ctx,59,24,4,12,p.dark);mobPixel(ctx,62,19,3,10,p.light);
  mobPixel(ctx,80,26,4,10,p.dark);mobPixel(ctx,82,22,3,8,p.accent);
 }else if(m.form==='serpent'){
  [0,1,2,3,4].forEach(i=>{mobDiamond(ctx,44+i*10,48+(i%2)*6,10,p.base,p.dark);mobPixel(ctx,47+i*10,53+(i%2)*6,5,2,i%2?p.glow:p.accent)});
  mobDiamond(ctx,91,42,12,p.light,p.dark);mobPixel(ctx,94,41,2,2,p.accent);
  mobPixel(ctx,55,38,3,8,p.dark);mobPixel(ctx,57,35,3,6,p.glow);
 }else if(m.form==='crab'){
  mobDiamond(ctx,48,45,19,p.base,p.dark);mobDiamond(ctx,87,45,19,p.light,p.dark);
  mobDiamond(ctx,39,44,13,p.accent,p.dark);mobDiamond(ctx,101,43,13,p.glow,p.dark);
  [0,1,2].forEach(i=>{mobPixel(ctx,48+i*6,63+i%2*4,3,10,p.dark);mobPixel(ctx,83+i*6,63+i%2*4,3,10,p.dark)});
 }else if(m.form==='golem'){
  mobDiamond(ctx,48,45,17,p.dark,p.dark);mobDiamond(ctx,51,42,12,p.base,p.dark);
  mobDiamond(ctx,72,36,14,p.light,p.dark);mobDiamond(ctx,91,48,15,p.accent,p.dark);
  mobPixel(ctx,57,47,4,3,p.glow);mobPixel(ctx,79,49,4,3,p.glow);
  mobPixel(ctx,58,64,7,3,p.dark);mobPixel(ctx,76,68,9,3,p.dark);
 }else if(m.form==='moth'){
  mobDiamond(ctx,43,43,18,p.light,p.dark);mobDiamond(ctx,91,43,18,p.base,p.dark);
  mobDiamond(ctx,48,50,10,p.accent,p.dark);mobDiamond(ctx,87,50,10,p.glow,p.dark);
  mobPixel(ctx,65,28,3,17,p.dark);mobPixel(ctx,61,22,2,8,p.light);mobPixel(ctx,72,22,2,8,p.accent);
  mobPixel(ctx,78,49,5,3,p.glow);
 }else if(m.form==='tree'){
  mobPixel(ctx,67,39,7,31,p.dark);mobPixel(ctx,70,35,3,30,p.base);
  mobDiamond(ctx,54,34,15,p.light,p.dark);mobDiamond(ctx,80,30,16,p.accent,p.dark);
  mobDiamond(ctx,67,20,15,p.glow,p.dark);mobPixel(ctx,57,48,4,3,p.glow);
 }else if(m.form==='fish'){
  mobDiamond(ctx,56,45,18,p.base,p.dark);mobDiamond(ctx,89,46,15,p.light,p.dark);
  mobDiamond(ctx,43,45,12,p.accent,p.dark);mobPixel(ctx,59,38,12,5,p.glow);
  mobPixel(ctx,73,44,3,3,p.dark);mobPixel(ctx,75,44,2,2,p.light);
  mobPixel(ctx,63,57,3,6,p.accent);mobPixel(ctx,72,59,3,7,p.glow);
 }else if(m.form==='crystal'){
  [[49,42,15],[63,29,20],[79,38,17],[92,47,13]].forEach((q,i)=>mobDiamond(ctx,q[0],q[1],q[2],i%2?p.accent:p.light,p.dark));
  mobPixel(ctx,57,49,4,4,p.glow);mobPixel(ctx,83,54,5,4,p.glow);
 }else if(m.form==='turtle'){
  mobEllipse(ctx,70,37,48,30,p.dark,3);mobEllipse(ctx,70,39,39,23,p.base,3);
  mobPixel(ctx,65,43,3,17,p.light);mobPixel(ctx,52,50,12,3,p.accent);mobPixel(ctx,76,50,12,3,p.glow);
  mobPixel(ctx,49,66,9,4,p.dark);mobPixel(ctx,85,66,9,4,p.dark);
 }else if(m.form==='stag'){
  mobPixel(ctx,60,31,3,20,p.dark);mobPixel(ctx,56,27,3,10,p.accent);mobPixel(ctx,51,24,8,3,p.light);
  mobPixel(ctx,82,30,3,20,p.dark);mobPixel(ctx,85,26,3,10,p.glow);mobPixel(ctx,85,23,8,3,p.light);
  mobDiamond(ctx,69,43,12,p.base,p.dark);mobPixel(ctx,72,48,4,3,p.accent);
 }else if(m.form==='scorpion'){
  mobDiamond(ctx,58,48,17,p.base,p.dark);mobDiamond(ctx,80,48,13,p.accent,p.dark);
  mobPixel(ctx,50,62,4,10,p.dark);mobPixel(ctx,59,66,4,9,p.dark);mobPixel(ctx,83,64,4,10,p.dark);
  mobPixel(ctx,91,39,4,8,p.dark);mobPixel(ctx,96,32,4,8,p.accent);mobPixel(ctx,99,26,5,5,p.glow);
  mobDiamond(ctx,101,22,8,p.light,p.dark);
 }else if(m.form==='spirit'){
  mobEllipse(ctx,69,39,26,30,p.dark,3);mobEllipse(ctx,69,42,18,23,p.light,3);
  mobPixel(ctx,63,48,3,3,p.accent);mobPixel(ctx,73,48,3,3,p.glow);
  mobPixel(ctx,47,35,5,3,p.light);mobPixel(ctx,89,55,5,3,p.accent);mobPixel(ctx,58,72,4,3,p.glow);
 }else if(m.form==='flower'){
  [[69,27,p.light],[57,39,p.accent],[81,39,p.glow],[61,54,p.light],[77,55,p.accent]].forEach(q=>mobDiamond(ctx,q[0],q[1],12,q[2],p.dark));
  mobPixel(ctx,68,39,5,5,p.glow);mobPixel(ctx,70,48,3,17,p.dark);mobPixel(ctx,58,61,12,4,p.base);
 }else if(m.form==='dragon'){
  mobDiamond(ctx,48,38,14,p.dark,p.dark);mobDiamond(ctx,59,34,12,p.base,p.dark);
  mobDiamond(ctx,78,38,14,p.light,p.dark);mobDiamond(ctx,91,31,11,p.accent,p.dark);
  mobPixel(ctx,53,45,4,11,p.glow);mobPixel(ctx,78,45,4,12,p.accent);
  mobPixel(ctx,58,25,4,10,p.dark);mobPixel(ctx,61,20,4,8,p.light);
  mobPixel(ctx,82,26,4,9,p.dark);mobPixel(ctx,85,21,4,7,p.glow);
 }
 if(m.boss){
  mobPixel(ctx,61,15,5,6,p.dark);mobPixel(ctx,64,11,6,8,p.accent);
  mobPixel(ctx,71,14,5,6,p.dark);mobPixel(ctx,73,10,6,8,p.glow);
  mobDiamond(ctx,68,13,7,p.light,p.dark);
 }
 ctx.restore()
} const mobSpriteCache=new Map(),mobFallbackBounds=new Map();
 function measureMobBounds(source){
  const w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
  if(!w||!h)return null;
  const scan=document.createElement('canvas');scan.width=w;scan.height=h;
  const sc=scan.getContext('2d',{willReadFrequently:true});sc.drawImage(source,0,0);
  const d=sc.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y}
  return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
 }
 function getMobSprite(m){
  const url=VAN_KIEP_MOB_SPRITE_DATA[m.n];if(!url)return null;
  let entry=mobSpriteCache.get(m.n);if(entry)return entry;
  entry={state:'loading',image:new Image(),bounds:null,t0:Date.now()};mobSpriteCache.set(m.n,entry);
  entry.image.onload=()=>{try{entry.bounds=measureMobBounds(entry.image);entry.state=entry.bounds?'ready':'error'}catch(_){entry.state='error'}};
  entry.image.onerror=()=>{entry.state='error'};entry.image.src=url;return entry;
 }
  const MOB_DRAW_SCALE=0.78,PET_DRAW_SCALE=0.8,petBoundsCache=new Map();
  function measurePetAlphaBounds(canvas){
   try{
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height;
    const d=ctx.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y}
     return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
    }catch(_){return null}
  }
  function drawM(g,m,cx,by,u,T,dx,al,rank){
  try{
   const boss=!!m.boss,tier=rank&&rank.n,leader=!boss&&tier==='Thống Lĩnh',elite=!boss&&tier==='Tinh Anh';
   const target=Math.round((boss?150:leader?140:elite?124:tier==='Yếu'?108:116)*MOB_DRAW_SCALE);
   const entry=getMobSprite(m),useSprite=!!entry&&entry.state==='ready';
   if(entry&&entry.state==='loading'&&Date.now()-entry.t0<3000)return;
   mobCtx.clearRect(0,0,128,128);mobCtx.imageSmoothingEnabled=false;
   if(!useSprite)drawCreatureBody(mobCtx,m,T);
   const source=useSprite?entry.image:mobLayer;
   let box=useSprite?entry.bounds:mobFallbackBounds.get(m.n);
   if(!box){box=measureMobBounds(source)||{x:0,y:0,w:128,h:128};if(!useSprite)mobFallbackBounds.set(m.n,box)}
   const auraY=by-target*.55,rad=Math.round((boss?98:leader?88:elite?80:75)*MOB_DRAW_SCALE);
   g.save();
   try{
    g.globalAlpha=al;g.imageSmoothingEnabled=false;
    const glow=g.createRadialGradient(cx,auraY,4,cx,auraY,rad);
    glow.addColorStop(0,'rgba('+m.aura+','+(boss?0.32:0.20)+')');glow.addColorStop(.58,'rgba('+m.aura+','+(boss?0.12:0.08)+')');glow.addColorStop(1,'rgba('+m.aura+',0)');
    g.fillStyle=glow;g.fillRect(cx-rad,by-target-18*MOB_DRAW_SCALE,rad*2,target+48*MOB_DRAW_SCALE);
    g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(cx,by+1,target*.36,6*MOB_DRAW_SCALE,0,0,Math.PI*2);g.fill();
    for(let i=0;i<(boss?10:6);i++){
     const phase=T*(boss?1.35:1)+i*Math.PI*2/(boss?10:6),radius=(34+(i%3)*8)*MOB_DRAW_SCALE,
      px=Math.round((cx+Math.cos(phase)*radius)/2)*2,py=Math.round((auraY+Math.sin(phase*1.25)*34*MOB_DRAW_SCALE)/2)*2;
     g.globalAlpha=al*(.22+.38*(.5+.5*Math.sin(T*3+i)));g.fillStyle=i%2?m.pal.glow:m.pal.light;g.fillRect(px-2*MOB_DRAW_SCALE,py-2*MOB_DRAW_SCALE,4*MOB_DRAW_SCALE,4*MOB_DRAW_SCALE)
    }
    g.globalAlpha=al;
    const rankColor=leader?'#ff4055':elite?'#ffd24a':null;
    if(rankColor){g.save();g.globalAlpha=al*.82;g.strokeStyle=rankColor;g.shadowColor=rankColor;g.shadowBlur=(leader?13:10)*MOB_DRAW_SCALE;g.lineWidth=2.5*MOB_DRAW_SCALE;g.beginPath();g.ellipse(cx+dx,by-target*.52,target*.48,target*.55,0,0,Math.PI*2);g.stroke();g.restore()}
    const hit=al<=.42&&al>=.28,death=al>.46&&al<.92?Math.max(0,Math.min(1,(.92-al)/.92)):0,
      bob=Math.round(Math.sin(T*3)*1.6*MOB_DRAW_SCALE),shake=hit?Math.sin(T*48)*5*MOB_DRAW_SCALE:0,
      scale=target/Math.max(box.w,box.h)*(1+Math.sin(T*2.2)*.009)*(1-death*.12),
      iw=(source.naturalWidth||source.width)*scale,ih=(source.naturalHeight||source.height)*scale,
      drawX=cx+dx*MOB_DRAW_SCALE+shake-(box.x+box.w/2)*scale,
      drawY=by+bob+death*14*MOB_DRAW_SCALE-(box.y+box.h)*scale;
    g.globalAlpha=al;g.filter=leader?'drop-shadow(0 0 4px rgba(255,45,70,.95))':elite?'drop-shadow(0 0 4px rgba(255,187,45,.95))':'none';
    g.drawImage(source,drawX,drawY,iw,ih);g.filter='none';
    if(hit){g.globalAlpha=al*.82;g.filter='brightness(0) invert(1)';g.drawImage(source,drawX,drawY,iw,ih);g.filter='none'}
    if(death>.12){g.globalAlpha=al*.7;g.fillStyle=rankColor||m.pal.glow;for(let i=0;i<5;i++){const px=cx+Math.sin(T*7+i*1.8)*(10+i*5),py=drawY+ih*(.35+i*.1)-death*(12+i*3)*MOB_DRAW_SCALE;g.fillRect(Math.round(px),Math.round(py),2*MOB_DRAW_SCALE,2*MOB_DRAW_SCALE)}}
    if(rankColor){
     const bx=cx+dx,byBadge=drawY+5;g.globalAlpha=al;g.fillStyle=rankColor;g.beginPath();g.moveTo(bx,byBadge);g.lineTo(bx+11,byBadge+6);g.lineTo(bx+8,byBadge+17);g.lineTo(bx-8,byBadge+17);g.lineTo(bx-11,byBadge+6);g.closePath();g.fill();
     g.fillStyle='#201522';g.font='bold 8px monospace';g.textAlign='center';g.fillText(leader?'TL':'★',bx,byBadge+12)
    }
    if(boss){g.globalAlpha=al*.55;g.strokeStyle=m.pal.glow;g.lineWidth=2*MOB_DRAW_SCALE;g.beginPath();g.ellipse(cx+dx*MOB_DRAW_SCALE,by-target*.52,target*.55,target*.17,Math.sin(T*.5)*.04,0,Math.PI*2);g.stroke()}
   }finally{g.restore()}
  }catch(_){/* A single malformed sprite must never stop the battle animation loop. */}
 }

function drawPet(g,cx,by,size,T,dx,al){const api=window.VanKiepSprites,frame=api?Math.floor(T*5)%api.frameCount:0,stage=stageOf(level),sh=api?api.getSheet(pet.bl,pet.sp):null,fr=api?api.frameRect(stage,frame):null;
 spriteCtx.clearRect(0,0,128,128);spriteCtx.imageSmoothingEnabled=false;
 if(sh&&fr)spriteCtx.drawImage(sh,fr.sx,fr.sy,fr.sw,fr.sh,0,0,128,128);else{const im=spriteFor(pet.bl,pet.sp);if(im.complete&&im.naturalWidth)spriteCtx.drawImage(im,0,0,128,128)}
  const key=pet.bl+':'+pet.sp+':'+stage+':'+frame;let box=petBoundsCache.get(key);if(!box){const measured=measurePetAlphaBounds(spriteLayer);if(measured){box=measured;petBoundsCache.set(key,box)}else box={x:0,y:0,w:128,h:128}}
 const drawSize=size*PET_DRAW_SCALE,unit=drawSize/128,bob=Math.round(Math.sin(T*3)*1.5*PET_DRAW_SCALE);
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,by+1,size*.36*PET_DRAW_SCALE,6*PET_DRAW_SCALE,0,0,7);g.fill();
  g.save();g.globalAlpha=al;g.imageSmoothingEnabled=false;g.translate(cx+dx*PET_DRAW_SCALE,by+bob);g.scale(PFLIP,1);g.drawImage(spriteLayer,-(box.x+box.w/2)*unit,-(box.y+box.h)*unit,drawSize,drawSize);g.restore()}
const PFLIP=-1;
/*@@S*/const MX=Object.fromEntries(M.map(m=>[m.n,{eva:m.eva,crit:m.crit,stun:m.stun,regen:m.regen,ks:m.ks,t:m.t}])); const TRQ=[{n:'Yếu',c:'#8fd0ff',tot:50,sec:.85,p:45,rw:.6,lm:.6,fl:0,fw:1},{n:'Thường',c:'#f6e9e4',tot:60,sec:1,p:30,rw:1,lm:1,fl:1,fw:3},{n:'Tinh Anh',c:'#ffb020',tot:72,sec:1.15,p:15,rw:1.5,lm:1.5,fl:2,fw:5},{n:'Thống Lĩnh',c:'#ff4055',tot:86,sec:1.35,p:7,rw:2.5,lm:2.5,fl:3,fw:8}],
TRB=[{n:'Trấn Thủ',c:'#c9a0ff',tot:100,sec:.875,p:50,rw:1.5,lm:1.5,fl:3,fw:12},{n:'Chúa Tể',c:'#ff5a6a',tot:110,sec:1,p:35,rw:4,lm:2.5,fl:6,fw:25},{n:'Thiên Ma',c:'#ffd24a',tot:132,sec:1.175,p:15,rw:7,lm:4,fl:10,fw:45}];
let lossStreak=0,hunt=true,BK=110,zoneSel=VAN_KIEP_ZONE_AT_LEVEL(level),stopReq=false;
const BOSS_RATE=3,LVW=[30,24,18,14,9,5]; /* LVW: tỉ lệ gặp quái/boss cấp 1..6 trong vùng */
const bossPct=()=>hunt?BOSS_RATE:0,nm=e=>'<span style="color:'+e.tr.c+';font-weight:800">'+(e.tr.n==='Thống Lĩnh'?'Thống Lĩnh':'['+e.tr.n+']')+'</span> '+e.m.n;
function petPow(){const s=statsOf(pet.bl,pet.pi,pet.base,level);return s.atk+s.def+s.spd+s.mag+s.hp/8}
function scaleOf(){const ref=72*(1+3*petGrow(level));return Math.max(.85,Math.min(1.15,.8+.2*petPow()/ref))}
function spawn(f){
 f=f||{};
 const zoneIndex=Math.min(zoneSel,VAN_KIEP_ZONE_AT_LEVEL(level));
 let isB=f.b!=null?f.b:(hunt&&Math.random()*100<bossPct()),eased=false;
 const bossPool=M.filter(m=>m.zone===zoneIndex&&m.boss&&m.min<=level);
 let ti,m,tr,easeScale=1;
 if(isB&&bossPool.length){
  const ranks=TRB.map((_,i)=>i);
  ti=f.t!=null?Math.max(0,Math.min(TRB.length-1,Number(f.t)||0)):ranks[pick(ranks.map(r=>TRB[r].p))];
  if(!ranks.includes(ti))ti=ranks[ranks.length-1];
  if(f.t==null&&lossStreak>=2){
   const rankIndex=ranks.indexOf(ti);
   if(rankIndex>0){ti=ranks[rankIndex-1];eased=true}
   else{eased=true;easeScale=.82}
  }
 }else if(isB){isB=false;eased=true}
 if(isB){
  tr=TRB[ti];
  let pool=bossPool.filter(x=>x.bossRank===ti);
  if(!pool.length)pool=bossPool;
  m=pool[ri(0,pool.length-1)];
 }else{
  const T=TRQ;
  ti=f.t!=null?Math.max(0,Math.min(T.length-1,Number(f.t)||0)):pick(T.map(x=>x.p));
  if(f.t==null&&lossStreak>=2&&ti>0){ti--;eased=true}
  tr=T[ti];
  const pool=M.filter(x=>x.zone===zoneIndex&&!x.boss&&x.min<=level);
  m=pool[ri(0,pool.length-1)];
 }
 const zb=VAN_KIEP_ZONE_BOUNDS[zoneIndex],nL=zb.end-zb.start+1,lv=zb.start+pick(LVW.slice(0,nL)),sc=1,sec=tr.sec,
 tot=tr.tot*easeScale,k=tot/5*(1+3*petGrow(lv)),ps=m.pr.reduce((a,b)=>a+b,0)/5,pr=m.pr.map(v=>v/ps);
 return{m,lv,tr,sec,sc,eased,st:[Math.round(k*pr[0]*8),Math.round(k*pr[1]),Math.round(k*pr[2]),Math.round(k*pr[3]),Math.round(k*pr[4])]}
} function mkP(){const s=statsOf(pet.bl,pet.pi,pet.base,level),sp=spOfPet(),k={};k[pet.sp]=sp.v;
 return{hp:s.hp,mx:s.hp,atk:s.atk,def:s.def,spd:s.spd,mag:s.mag,eva:s.eva,stun:s.stun,regen:s.regen,crit:s.crit||0,k,e:sp.e}}
function mkM(e){const m=e.m,x=MX[m.n],me=Math.min(1.1,(m.boss?1:.7)*e.sec),k={},sc=e.sec;x.ks.forEach(i=>k[i]=Math.round(SP17[i].m*me*10)/10);
 return{hp:e.st[0],mx:e.st[0],atk:e.st[1],def:e.st[2],spd:e.st[3],mag:e.st[4],eva:Math.min(45,Math.round(x.eva*sc*10)/10),stun:Math.round(x.stun*sc*10)/10,regen:Math.round(x.regen*sc*10)/10,crit:Math.round(x.crit*sc*10)/10,k,e:me}}
function sim(e){const P=mkP(),Q=mkM(e),ev=[],acc=(c,k,v)=>Math.random()*100<v,kv=(c,i)=>c.k[i]||0,has=(c,i)=>Object.prototype.hasOwnProperty.call(c.k,i),rs=c=>1-kv(c,10)/100;
 P.r=relMul(pet.bl,e.m.bl);Q.r=relMul(e.m.bl,pet.bl);P.n='Thú';Q.n=e.m.n;P.w='p';Q.w='m';
 [[P,Q],[Q,P]].forEach(([a,d])=>{if(kv(a,0))d.spd*=1-kv(a,0)*rs(d)/100;if(kv(a,1))d.atk*=1-kv(a,1)/100});
 [P,Q].forEach(c=>{c.sh=kv(c,9)?Math.round(c.mx*kv(c,9)/100):0;c.rv=!!kv(c,14);c.stn=0});
 const first=P.spd>=Q.spd?P:Q,
 push=(c,k,d,t,r)=>ev.push({w:c.w,k,d,r:r||1,hp:Math.max(0,P.hp),mh:Math.max(0,Q.hp),t}),
  revive=c=>{if(c.hp<=0&&c.rv){c.rv=false;c.hp=Math.round(c.mx*kv(c,14)/100);push(c,'heal',c.hp,'✨ Hồi sinh +'+c.hp+' HP')}},
 lo=c=>c.hp<c.mx*.25&&kv(c,16)?1+kv(c,16)/100:1,
 act=(a,d)=>{if(a.hp<=0||d.hp<=0)return;
  if(a.stn){a.stn=0;push(a,'stun',0,a.n+' bị choáng, mất lượt!');return}
  if(acc(d,'_em',d.eva)){push(a,'miss',0,d.n+' né được đòn!');return}
  const cr=acc(a,'_cm',a.crit+kv(a,4)),ig=kv(a,8)/100;
   let dm=Math.max(1,Math.round((a.atk*lo(a)+a.mag*.3)*1.6*100/(100+d.def*lo(d)*(1-ig))*a.r*(cr?1.5+kv(a,4)*3/100:1))),guarded=false;
   if(has(d,2)){const cap=Math.round(d.mx*(60-40*Math.min(1,d.e))/100);if(dm>cap){dm=cap;guarded=true}}
   let absorbed=0;if(d.sh>0){absorbed=Math.min(d.sh,dm);d.sh-=absorbed;dm-=absorbed;if(absorbed>0)push(d,'block',absorbed,'🛡️ Khiên hấp thụ '+absorbed+' sát thương')}
   d.hp-=dm;push(a,cr?'crit':'hit',dm,(cr?'💥 Chí mạng! ':'')+a.n+(dm?' đánh -'+dm:absorbed?' bị khiên chặn hoàn toàn':' đánh -0')+(guarded?' · 🛡️ Chắn đòn':'')+(a.r>1?' (khắc hệ '+BL[a.w==='p'?e.m.bl:pet.bl].h+')':a.r<1?' (bị hệ '+BL[a.w==='p'?e.m.bl:pet.bl].h+' khắc)':''),a.r);
  if(kv(a,12)){const heal=Math.min(a.mx-a.hp,Math.round(dm*kv(a,12)/100));if(heal>0){a.hp+=heal;push(a,'heal',heal,'🩸 Hút máu +'+heal+' HP')}}
  if(kv(a,3)&&dm>0&&d.hp>0&&acc(a,'_lm',kv(a,3))){const x=Math.round(dm*.5);d.hp-=x;push(a,'hit',x,'⚡ Liên kích -'+x)}
  if(kv(d,7)&&dm){const x=Math.max(1,Math.round(dm*kv(d,7)/100));a.hp-=x;push(d,'hit',x,'↩ Phản đòn -'+x)}
  revive(d);revive(a);
  if(d.hp>0&&acc(a,'_sm',a.stun*rs(d)))d.stn=1};
 for(let r=1;r<=14&&P.hp>0&&Q.hp>0;r++){
  act(first,first===P?Q:P);act(first===P?Q:P,first);
  [[P,Q],[Q,P]].forEach(([a,d])=>{if(a.hp>0&&d.hp>0&&kv(a,11)){const b=Math.max(1,Math.round(a.atk*kv(a,11)*rs(d)/100));d.hp-=b;push(a,'hit',b,'🔥 Thiêu đốt -'+b);revive(d)}});
  [P,Q].forEach(c=>{if(c.hp>0&&P.hp>0&&Q.hp>0&&c.regen){const heal=Math.min(c.mx-c.hp,Math.round(c.mx*c.regen/100));if(heal>0){c.hp+=heal;push(c,'heal',heal,c.n+' hồi sức +'+heal+' HP')}}})}
 return{ev,win:Q.hp<=0||(P.hp>0&&P.hp/P.mx>Q.hp/Q.mx),maxP:P.mx,maxM:Q.mx,first:first===P}}/*@@E*/

/* ===== Màu độc quyền 17 vùng + hiệu ứng đòn theo hệ ===== */
const REG=[['#9fe4ff','#ffffff','flake'],['#9fd9c8','#e6fff8','mist'],['#c9a8ff','#fff0ff','puff'],['#a0ffd0','#e8fff4','streak'],['#ffe53a','#ffffff','bolt'],['#a8b8ff','#f0f2ff','moon'],['#ffa030','#fff0b0','ray'],['#5a6cff','#c04aff','void'],['#e0b038','#fff2b8','diamond'],['#18e0b0','#d8fff0','gem'],['#8be04a','#f0ffc0','leaf'],['#ff5a1e','#ffc070','ember'],['#b0206a','#ff4a6a','wisp'],['#b45cff','#ffd0ff','star'],['#6ac4ff','#ffffff','feather'],['#ff7ac0','#ffe0f0','petal'],['#fff0a0','#ffffff','crown']];
function sigP(g,k,x,y,s,r,A,B){g.save();g.translate(x,y);g.rotate(r);g.fillStyle=A;g.strokeStyle=B;g.lineWidth=1.5;
 if(k=='flake'){g.beginPath();for(let i=0;i<3;i++){g.moveTo(-s,0);g.lineTo(s,0);g.rotate(1.047)}g.stroke()}
 else if(k=='mist'||k=='puff'){g.globalAlpha*=.6;g.beginPath();g.arc(0,0,s,0,7);g.arc(s*.8,-s*.3,s*.7,0,7);g.fill()}
 else if(k=='streak'){g.beginPath();g.moveTo(-s*2,0);g.lineTo(s*2,0);g.stroke()}
 else if(k=='bolt'){g.beginPath();g.moveTo(-s,-s*2);g.lineTo(s*.3,-s*.3);g.lineTo(-s*.4,s*.3);g.lineTo(s,s*2);g.stroke()}
 else if(k=='moon'){g.beginPath();g.arc(0,0,s,-1.3,1.3);g.arc(s*.45,0,s*.8,1.3,-1.3,true);g.fill()}
 else if(k=='ray'){g.beginPath();g.moveTo(0,-s*2.4);g.lineTo(s*.5,0);g.lineTo(-s*.5,0);g.closePath();g.fill()}
 else if(k=='void'){g.setLineDash([2,3]);g.beginPath();g.arc(0,0,s,0,7);g.stroke();g.setLineDash([])}
 else if(k=='diamond'||k=='gem'){g.beginPath();g.moveTo(0,-s*1.4);g.lineTo(s,0);g.lineTo(0,s*1.4);g.lineTo(-s,0);g.closePath();g.fill();g.stroke()}
 else if(k=='leaf'||k=='petal'||k=='feather'){g.beginPath();g.ellipse(0,0,k=='feather'?s*2:s*1.4,k=='feather'?s*.4:s*.7,0,0,7);g.fill()}
 else if(k=='ember'){g.fillRect(-s*.5,-s*.5,s,s)}
 else if(k=='wisp'){g.beginPath();g.moveTo(-s*1.5,s);g.quadraticCurveTo(0,-s*2,s*1.5,s*.5);g.stroke()}
 else if(k=='star'){g.beginPath();for(let i=0;i<8;i++){const a=i*.785,d=i%2?s*.4:s*1.5;g.lineTo(Math.cos(a)*d,Math.sin(a)*d)}g.closePath();g.fill()}
 else{g.beginPath();g.moveTo(-s,s);g.lineTo(-s,-s*.4);g.lineTo(-s*.5,s*.2);g.lineTo(0,-s);g.lineTo(s*.5,s*.2);g.lineTo(s,-s*.4);g.lineTo(s,s);g.closePath();g.fill()}
 g.restore()}
function aura(g,R,x0,cx,tt){const gd=g.createLinearGradient(0,150,0,250);gd.addColorStop(0,R[0]+'00');gd.addColorStop(1,R[0]+'40');
 const p=.5+.5*Math.sin(tt*2.4),rg=g.createRadialGradient(cx,208,4,cx,208,64);rg.addColorStop(0,R[1]+'aa');rg.addColorStop(.5,R[0]+'55');rg.addColorStop(1,R[0]+'00');
 g.save();g.globalAlpha=.55+.35*p;g.translate(0,208);g.scale(1,.28);g.translate(0,-208);g.fillStyle=rg;g.beginPath();g.arc(cx,208,64,0,7);g.fill();g.restore();
 }
function paintUI(RP,RM){const set=(n,f,b)=>{const a=$(n);if(a)a.style.background='linear-gradient(90deg,'+f+','+b+')'};
 set('mob-ph',RP[0],RP[1]);set('mob-mh',RM[0],RM[1]);
 $('mob-pn').style.color=RP[1];$('mob-mn').style.color=RM[1];
 $('mob-ph').parentNode.style.borderColor=RP[0];$('mob-mh').parentNode.style.borderColor=RM[0]}
function impact(g,fx,tt){
 const R=REG[fx.s],A=R[0],B=R[1],q=fx.q,p=fx.pp,pw=(fx.k==='crit'?1.5:1)*(fx.r>1?1.25:1),
  tx=p?272:90,ty=150,dir=p?1:-1,rd=rng(fx.i*977+fx.s*31+7),fa=Math.max(0,1-q),h=fx.h;
 g.save();g.globalAlpha=Math.min(1,fa*1.6);
 if(!fx.d){const hx=(fx.k==='stun'||fx.k==='heal'||fx.k==='block')?(p?90:270):fx.k==='miss'?(p?270:90):90,hy=ty-52;
   if(fx.k==='heal'){g.strokeStyle=B;g.lineWidth=2*fa;g.beginPath();g.ellipse(hx,ty+40,10+q*40,3+q*10,0,0,7);g.stroke();for(let i=0;i<10;i++)sigP(g,'star',hx+(rd()-.5)*60,ty+40-q*(50+rd()*40),2+rd()*2,q*4+i,B,A)}
   else if(fx.k==='block'){g.strokeStyle=B;g.lineWidth=2.5*fa;g.beginPath();g.arc(hx,ty,13+q*31,0,7);g.stroke();g.beginPath();g.moveTo(hx,ty-12);g.lineTo(hx+10,ty-7);g.lineTo(hx+8,ty+5);g.lineTo(hx,ty+13);g.lineTo(hx-8,ty+5);g.lineTo(hx-10,ty-7);g.closePath();g.stroke()}
  else if(fx.k==='stun'){for(let i=0;i<3;i++){const a=tt*5+i*2.09;sigP(g,'star',hx+Math.cos(a)*18,hy+Math.sin(a)*5,3.2,a,B,A)}}
  else if(fx.k==='miss'){g.strokeStyle=A;g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(hx-30+i*6,ty-20+i*14);g.lineTo(hx+20+q*30,ty-20+i*14);g.stroke()}}
  g.restore();return}

 if(h==='Kim'){for(let i=0;i<3;i++){const a=.5+i*.3,L=44*pw,t=Math.min(1,q*2.6),c0=Math.cos(a)*dir,s0=Math.sin(a),ox=(i-1)*9;
   g.strokeStyle=i==1?B:A;g.lineWidth=Math.max(1,(5-i)*fa*pw);g.shadowColor=A;g.shadowBlur=8;g.beginPath();g.moveTo(tx+ox-c0*L,ty-s0*L);g.lineTo(tx+ox-c0*L+c0*2*L*t,ty-s0*L+s0*2*L*t);g.stroke()}
  g.shadowBlur=0;g.strokeStyle=B;g.lineWidth=1.5;for(let i=0;i<9;i++){const a=rd()*6.28,r1=10+q*40*rd()*pw;g.beginPath();g.moveTo(tx+Math.cos(a)*r1,ty+Math.sin(a)*r1);g.lineTo(tx+Math.cos(a)*(r1+7),ty+Math.sin(a)*(r1+7));g.stroke()}}
 else if(h==='Mộc'){for(let i=0;i<12;i++){const a=i*.52+q*5,r=(8+q*42*(.4+rd()*.6))*pw;g.save();g.translate(tx+Math.cos(a)*r,ty+Math.sin(a)*r*.8);g.rotate(a+q*4);g.fillStyle=i%3?A:B;g.beginPath();g.ellipse(0,0,6,2.6,0,0,7);g.fill();g.restore()}
  g.strokeStyle=A;g.lineWidth=3*fa;for(let j=0;j<2;j++){g.beginPath();g.arc(tx,ty,14+q*30*pw+j*10,j*3.1+q*3,j*3.1+q*3+2.2);g.stroke()}}
 else if(h==='Thủy'){g.strokeStyle=B;g.lineWidth=2.5*fa;for(let j=0;j<2;j++){g.beginPath();g.ellipse(tx,ty+36,(10+q*50*pw)*(1+j*.5),(4+q*14)*(1+j*.5),0,0,7);g.stroke()}
  for(let i=0;i<14;i++){const a=-1.57+(rd()-.5)*2.4,v=(40+rd()*50)*pw,x=tx+Math.cos(a)*v*q,y=ty+Math.sin(a)*v*q+q*q*70;g.fillStyle=i%3?A:B;g.beginPath();g.arc(x,y,2.6*(1-q*.4),0,7);g.fill()}}
 else if(h==='Hỏa'){const r=(14+Math.sin(q*3.14)*34)*pw,gd=g.createRadialGradient(tx,ty,2,tx,ty,r);gd.addColorStop(0,B);gd.addColorStop(.5,A);gd.addColorStop(1,A+'00');g.fillStyle=gd;g.beginPath();g.arc(tx,ty,r,0,7);g.fill();
  for(let i=0;i<5;i++){const x=tx+(i-2)*9,hh=(18+rd()*26)*pw*Math.sin(Math.min(1,q*1.4)*3.14);g.fillStyle=i%2?A:B;g.beginPath();g.moveTo(x-5,ty+10);g.quadraticCurveTo(x-2,ty-hh*.6,x+(rd()-.5)*8,ty-hh);g.quadraticCurveTo(x+3,ty-hh*.4,x+5,ty+10);g.fill()}
  for(let i=0;i<12;i++){g.fillStyle=B;g.fillRect(tx+(rd()-.5)*60*pw,ty+10-q*(30+rd()*50),2,2)}}
 else if(h==='Thổ'){g.strokeStyle=A;g.lineWidth=3*fa;g.beginPath();g.ellipse(tx,ty+40,(12+q*62)*pw,(4+q*12)*pw,0,0,7);g.stroke();
  g.globalAlpha*=.5;g.fillStyle=A;for(let i=0;i<5;i++){g.beginPath();g.arc(tx+(rd()-.5)*70*q*pw,ty+38-q*8,5+q*8,0,7);g.fill()}g.globalAlpha=Math.min(1,fa*1.6);
  for(let i=0;i<9;i++){const vx=(rd()-.5)*90*pw,vy=-(50+rd()*60)*pw,x=tx+vx*q,y=ty+38+vy*q+q*q*130;g.save();g.translate(x,y);g.rotate(q*6+i);g.fillStyle=i%2?A:B;g.beginPath();g.moveTo(-5,3);g.lineTo(0,-5);g.lineTo(6,2);g.lineTo(1,6);g.closePath();g.fill();g.restore()}}
 else{for(let a=0;a<3;a++)for(let i=0;i<6;i++){const th=a*2.09+i*.5+q*6,r=(4+i*7*q*1.6)*pw;g.fillStyle=i%2?A:B;g.beginPath();g.arc(tx+Math.cos(th)*r,ty+Math.sin(th)*r,3-i*.3,0,7);g.fill()}
  g.strokeStyle=B;g.lineWidth=1.5;g.setLineDash([5,4]);g.lineDashOffset=-tt*30;g.beginPath();g.arc(tx,ty,12+q*38*pw,0,7);g.stroke();g.setLineDash([]);
  g.save();g.translate(tx,ty);g.rotate(q*3);g.strokeStyle=A;g.beginPath();g.moveTo(0,-16*pw);g.lineTo(11*pw,0);g.lineTo(0,16*pw);g.lineTo(-11*pw,0);g.closePath();g.stroke();g.restore()}
 for(let i=0;i<9;i++){const a=rd()*6.28,r=(14+q*(34+rd()*30))*pw;sigP(g,R[2],tx+Math.cos(a)*r,ty+Math.sin(a)*r-q*12,2.6+rd()*2,a+q*3,B,A)}
 g.restore()}
function battle(e){return new Promise(resolve=>{busy=true;const o=$('mob'),g=$('mob-c').getContext('2d'),R=sim(e),n=R.ev.length,sp=spOfPet(),b=e.tr.rw,
 ex=Math.round((14+e.lv*.9)*b*(1+(pet.sp===15?sp.v/100:0))*buffMul('exp')),gd=Math.round((6+e.lv*.4)*b*(1+(pet.sp===5?sp.v/100:0))*buffMul('xu')),
 lo=Math.min(Math.round((10+e.lv*.5)*e.tr.lm),Math.max(20,Math.round(expNeed(level)*.3))),fW=e.tr.fw,fL=Math.min(Math.floor(fame),e.tr.fl),TE=1.6+n*.9,pn=genOf(pet.bl,pet.sp).name,ps=statsOf(pet.bl,pet.pi,pet.base,level);let t0=performance.now(),done=false;
 o.style.display='block';const rb=$('mob-run');rb.style.display='block';
 $('mob-pn').textContent=pn+' · Cấp '+level;const RP=REG[pet.sp],RM=REG[e.m.sp];paintUI(RP,RM);$('mob-mn').innerHTML=(e.m.boss?'👑 ':'')+nm(e)+' · Cấp '+e.lv;if(e.tr.n!=='Thường')$('mob-mh').parentNode.style.borderColor=e.tr.c;if(window.battleHudExtra)battleHudExtra(e);
 function fin(flee){if(done)return;done=true;o.style.display='none';rb.style.display='none';
  const res={e,type:flee?'flee':R.win?'win':'lose',drops:[],lv0:level,exp:0,fame:0,gold:0};
  if(flee){const c=Math.min(gold,Math.round((6+e.lv*.4)*e.tr.rw*.6));gold-=c;res.gold=-c;
   log('🏃 Chạy khỏi <b>'+nm(e)+'</b> (Cấp '+e.lv+'), mất '+c+' xu.')}
  else if(R.win){gold+=gd;addExp(ex);lossStreak=0;res.gold=gd;res.exp=ex;log('🗡️ Thắng <b>'+nm(e)+'</b> (Cấp '+e.lv+')! Xu +'+gd+', EXP +'+ex+'.');
   rollDrops(e,(1+(pet.sp===13?sp.v/100:0))*buffMul('drop')).forEach(d=>{const a=addItem(d.id,d.q),ok=a>0,nn=ITEMS[d.id].n+(a>1?' ×'+a:'');res.drops.push({n:nn,ok});log(ok?'🎒 Nhặt được <b>'+nn+'</b>.':'🎒 Balo đầy, bỏ lại <b>'+ITEMS[d.id].n+'</b>!')})}
  else{lossStreak++;res.streak=lossStreak;log('💥 Thua <b>'+nm(e)+'</b> (Cấp '+e.lv+').'+(lossStreak>=2?' 🍀 Lần sau đối thủ sẽ yếu hơn.':''))}
  res.lv1=level;if(R.win&&!flee)buffTick();stats();resolve(res)}
 rb.onclick=ev=>{ev.stopPropagation();fin(true)};
 o.onclick=()=>{const T=(performance.now()-t0)/1000;if(T<TE)t0-=(TE-T)*1000;else fin()};
 (function L(){if(done)return;const T0=performance.now(),T=(T0-t0)/1000,tt=T0/1000;
  sceneDraw(tt,e.m.zone);g.drawImage(cv,0,0,360,250,0,0,360,250);
    let hp=R.maxP,mh=R.maxM,msg='Tốc: Thú '+ps.spd+' · '+e.m.n+' '+e.st[3]+' → '+(R.first?'Thú':e.m.n)+' ra đòn trước',dp=0,dmx=0,ap=1,am=1,fl=null,fx=null;
  R.ev.forEach((x,i)=>{const s=1.6+i*.9,u=(T-s)/.9;if(u<0)return;if(u>=.35){hp=x.hp;mh=x.mh}
   if(u<.9){msg=x.t;const lg=Math.sin(Math.min(1,u/.35)*Math.PI)*(x.k==='hit'||x.k==='crit'?46:x.k==='miss'?-10:0);
    if(x.w==='p')dp=lg;else dmx=-lg;
     if(u>=.35&&u<.8&&x.d&&x.k!=='heal'&&x.k!=='block'&&(Math.floor(T*18)%2)){if(x.w==='m')ap=.35;else am=.35}
     if(u>=.35){const q=(u-.35)/.55,pp=x.w==='p',EC={Kim:'#f2d06a',Mộc:'#5be07a',Thủy:'#5bb8ff',Hỏa:'#ff6a3a',Thổ:'#d9a05a',Huyễn:'#c08aff'},ec=EC[BL[pp?pet.bl:e.m.bl].h]||'#fff';fx={pp,q,k:x.k,d:x.k==='heal'||x.k==='block'?0:x.d,r:x.r,i,h:/Thiêu đốt/.test(x.t)?'Hỏa':BL[pp?pet.bl:e.m.bl].h,s:pp?pet.sp:e.m.sp};
      if(x.k==='block')fl={x:pp?90:270,y:130-q*40,t:'🛡️ '+x.d,c:'#8fd0ff',tags:[['HẤP THỤ','#8fd0ff']],q,big:1};
      else if(x.k==='heal')fl={x:pp?90:270,y:130-q*40,t:x.d>0?'+'+x.d+' HP':x.t.indexOf('Hồi sinh')>=0?'HỒI SINH!':'HỒI SỨC',c:'#72e4b0',tags:x.t.indexOf('Hồi sinh')>=0?[['HỒI SINH','#72e4b0']]:[],q,big:1};
      else if(x.d){const tags=[],targetH=BL[x.w==='p'?e.m.bl:pet.bl].h;let c='#fff';if(x.r>1){c=ec;tags.push(['KHẮC '+targetH.toUpperCase()+' ▲',ec])}else if(x.r<1){c='#9aa4b8';tags.push(['BỊ '+targetH.toUpperCase()+' KHẮC ▼','#9aa4b8'])}
     if(x.t.indexOf('Chắn đòn')>=0)tags.unshift(['🛡️ CHẮN ĐÒN','#8fd0ff'])
     if(x.k==='crit'){c=x.r>1?ec:'#ffd24a';tags.unshift(['CHÍ MẠNG!','#ffb020'])}
     fl={x:pp?270:90,y:130-q*55,t:(x.t.indexOf('Phản đòn')>=0?'↩ ':x.t.indexOf('Thiêu đốt')>=0?'🔥 ':x.t.indexOf('Liên kích')>=0?'⚡ ':x.t.indexOf('Chắn đòn')>=0?'🛡️ ':'')+'-'+x.d,c,tags,q,big:x.k==='crit'||x.r>1,ring:x.r>1?ec:x.k==='crit'?'#ffd24a':null}}
    else if(x.k==='miss')fl={x:x.w==='p'?270:90,y:130-q*40,t:'NÉ!',c:'#7fe8ff',tags:[],q,big:1}
    else if(x.k==='stun')fl={x:pp?90:270,y:130-q*40,t:'CHOÁNG!',c:'#ffe45a',tags:[['💫','#ffe45a']],q,big:1}
     }}});
  if(T>=TE){rb.style.display='none';msg=R.win?'🏆 Chiến thắng! +'+gd+' xu · +'+ex+' EXP':'💥 Bại trận...';if(R.win)am=Math.max(0,1-(T-TE)*1.2)}
  aura(g,RP,0,85,tt);aura(g,RM,180,272,tt);drawPet(g,85,208,120,tt,dp,ap);drawM(g,e.m,272,208,e.m.boss?6:7,tt,dmx,am,e.tr);if(fx)impact(g,fx,tt);
  if(fl){g.save();g.globalAlpha=Math.min(1,2.2-fl.q*1.6);g.textAlign='center';
   if(fl.ring){g.strokeStyle=fx&&fx.d?REG[fx.s][1]:fl.ring;g.lineWidth=3;g.globalAlpha*=.8;g.beginPath();g.arc(fl.x,150,10+fl.q*50,0,7);g.stroke();g.globalAlpha=Math.min(1,2.2-fl.q*1.6)}
   g.font='bold '+(fl.big?26:20)+'px monospace';g.lineWidth=5;g.strokeStyle='#160e1c';const FR=fx&&fx.d?REG[fx.s]:null,FC=FR?(fx.k==='crit'?FR[1]:FR[0]):fl.c;g.shadowColor=FR?FR[0]:fl.c;g.shadowBlur=fl.big?12:0;g.strokeText(fl.t,fl.x,fl.y);g.fillStyle=FC;g.fillText(fl.t,fl.x,fl.y);g.shadowBlur=0;
   g.font='bold 12px monospace';g.lineWidth=3;fl.tags.forEach((tg,i)=>{const yy=fl.y-24-i*14;g.strokeText(tg[0],fl.x,yy);g.fillStyle=tg[1];g.fillText(tg[0],fl.x,yy)});g.restore()}
  $('mob-ph').style.width=Math.round(hp/R.maxP*100)+'%';$('mob-mh').style.width=Math.round(mh/R.maxM*100)+'%';
  $('mob-pt').textContent=hp+'/'+R.maxP;$('mob-mt').textContent=mh+'/'+R.maxM;$('mob-r').textContent=msg;
  if(T>TE+2.4)fin();else requestAnimationFrame(L)})()
})}
const _t=window.train,_a=window.arena,_s=window.shop;

const WHY=Object.fromEntries(M.map(m=>{const z=VAN_KIEP_ZONES[m.zone];return[m.n,'<b>'+z.name+'</b> · <b>'+z.buff.label+'</b> ('+z.buff.desc+'). '+m.lore+(m.boss?' '+m.rankLabel+' canh giữ vùng đất này.':' Quái xuất hiện theo cấp thám hiểm và bậc Yếu / Thường / Tinh Anh / Thống Lĩnh.')]}));
const codexStyle=document.createElement('style');
codexStyle.textContent='#bestiary{font-size:12px;line-height:1.5}#bestiary .zone-entry{margin:8px 0;padding:8px;border:1px solid rgba(168,92,78,.35);border-radius:8px;background:rgba(16,10,18,.45)}#bestiary .zone-entry>summary{cursor:pointer;color:var(--gold);font-weight:700}#bestiary .zone-note{color:var(--mute);margin:6px 0}#bestiary .roster{display:grid;grid-template-columns:1fr;gap:4px}#bestiary .roster div{padding:4px 6px;border-radius:5px;background:rgba(255,255,255,.035)}#bestiary .roster .boss{color:#ffc978;border-left:2px solid #ffb020}#bestiary small{color:var(--mute)}';
document.head.appendChild(codexStyle);
const codex=document.createElement('section');
codex.id='bestiary';codex.className='frame card';
codex.innerHTML='<details class="lib"><summary>📖 Thư khố quái vật · 102 quái vùng 1–17 đã cập nhật</summary><p class="zone-note">102 quái vùng 1–17 đã cập nhật từ CSV 102 (85 quái thường + 17 boss). Vùng mở theo cấp 1–100. Buff vùng áp dụng lên chỉ số/hiệu ứng của quái; quái thường có bậc Yếu, Thường, Tinh Anh hoặc Thống Lĩnh; boss giữ bậc riêng.</p>'+VAN_KIEP_ZONES.map((z,i)=>{const b=VAN_KIEP_ZONE_BOUNDS[i],mobs=M.filter(m=>m.zone===i&&!m.boss),bosses=M.filter(m=>m.zone===i&&m.boss).sort((a,b)=>a.bossRank-b.bossRank);return'<details class="zone-entry"><summary>'+z.name+' · Cấp '+b.start+'–'+b.end+' · '+mobs.length+' quái / '+bosses.length+' boss</summary><div class="zone-note"><b>'+z.buff.label+':</b> '+z.buff.desc+' · '+z.lore+'</div><div class="roster">'+mobs.map(m=>'<div>⚔ '+m.n+' <small>· Dáng '+VAN_KIEP_FORM_LABELS[m.form]+' · Hệ '+BL[m.bl].h+'</small></div>').join('')+bosses.map(m=>'<div class="boss">👑 '+m.n+' <small>· '+m.rankLabel+' · Dáng '+VAN_KIEP_FORM_LABELS[m.form]+' · Hệ '+BL[m.bl].h+'</small></div>').join('')+'</div></details>'}).join('')+'</details>';
document.querySelector('.app').appendChild(codex);
const st=document.createElement('style');st.textContent='#xp{position:absolute;inset:0;z-index:6;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:rgba(16,10,17,.94);color:#f6e9e4;text-align:center;padding:10px;font-size:12px}#xp .hg{font-size:54px;animation:xf 1.4s ease-in-out infinite}@keyframes xf{0%,15%{transform:rotate(0)}50%,65%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}#xp table{width:100%;border-collapse:collapse;margin:6px 0}#xp>:first-child{margin-top:auto}#xp>:last-child{margin-bottom:auto}#xp>*{flex-shrink:0}#xp table{font-size:10.5px}#xp td{padding:1px 4px;border-bottom:1px solid #3a2a33}#xp .battle-stats td.stat-label{text-align:center;white-space:normal;overflow-wrap:anywhere;font-weight:400;color:#f6e9e4}#xp .battle-stats td.right-stat-label{text-align:right;padding-right:8px}#xp .battle-stats td{text-align:center}#xp .battle-stats td[colspan="1"]{text-align:left}#xp td.up{color:#72e4b0;font-weight:700}#xp td.dn{color:#ff7654}#xp button{flex:1;padding:9px;border-radius:9px;border:1px solid #72e4b0;font-weight:800;font-size:14px;color:#fff;cursor:pointer}';document.head.appendChild(st);
 const stBattle=document.createElement('style');stBattle.textContent='#xp .battle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;margin:6px 0;align-items:start}#xp .battle-side{min-width:0;box-sizing:border-box;padding:7px;border:1px solid rgba(255,198,113,.4);border-radius:9px;background:linear-gradient(180deg,rgba(97,45,49,.38),rgba(28,17,26,.72));text-align:left}#xp .battle-side.enemy{border-color:rgba(143,208,255,.42);background:linear-gradient(180deg,rgba(39,76,96,.34),rgba(24,20,31,.72))}#xp .battle-head{min-height:47px;padding-bottom:5px;border-bottom:1px solid #49343a;text-align:center;line-height:1.25;overflow-wrap:anywhere}#xp .battle-head strong{font-size:10.5px}#xp .battle-element{display:inline-block;margin-top:4px;padding:1px 7px;border-radius:999px;background:rgba(255,210,74,.14);color:#ffd24a;font-size:10px;font-weight:800}#xp .battle-side.enemy .battle-element{color:#8fd0ff;background:rgba(143,208,255,.13)}#xp .battle-stat{display:flex;justify-content:space-between;align-items:center;gap:4px;min-height:20px;border-bottom:1px solid rgba(88,62,69,.55);font-size:10px}#xp .battle-stat span{color:#f6e9e4;white-space:nowrap}#xp .battle-stat b{text-align:right;white-space:nowrap;font-size:10.5px}#xp .battle-stat b.up{color:#72e4b0}#xp .battle-stat b.dn{color:#ff7654}#xp .battle-skill{padding-top:5px;margin-top:4px;border-top:1px solid #49343a;font-size:9.5px;line-height:1.35;overflow-wrap:anywhere}#xp .battle-skill-title{display:block;margin-bottom:2px;color:#ffc978;font-weight:800}@media(max-width:360px){#xp .battle-grid{gap:5px}#xp .battle-side{padding:6px 5px}#xp .battle-stat{font-size:9.5px}#xp .battle-stat b{font-size:10px}}';document.head.appendChild(stBattle);
const xp=document.createElement('div');xp.id='xp';$('mob').parentNode.appendChild(xp);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const waitS=async ms=>{const t=Date.now();while(Date.now()-t<ms&&!stopReq)await wait(100)};
function showResult(r){const e=r.e,C={win:['🏆','CHIẾN THẮNG!','#72e4b0'],lose:['💥','BẠI TRẬN!','#ff7654'],flee:['🏃','BỎ CHẠY!','#8fd0ff']}[r.type],
 sg=v=>v>0?'+'+v:v<0?'−'+(-v):'0',row=(a,b,c)=>'<div class="battle-stat"><span>'+a+'</span><b class="'+c+'">'+b+'</b></div>',rows=[],notes=[];
 if(r.type==='win')rows.push(row('🪙 Xu thưởng',sg(r.gold),'up'),row('✨ EXP',sg(r.exp),'up'));
 else if(r.type==='flee')rows.push(row('🪙 Xu bị trừ',sg(r.gold),r.gold?'dn':''));
 else rows.push(row('Hình phạt','Không mất gì',''));
 r.drops.forEach(d=>rows.push(row('🎒 '+d.n,d.ok?'Nhặt được':'Balo đầy, bỏ lại',d.ok?'up':'dn')));
 if(r.lv1>r.lv0){const g=lvGain(r.lv0,r.lv1);notes.push('⬆️ <b style="color:#72e4b0">Lên cấp '+r.lv1+'!</b>'+(g?' '+g:''))}
 const z1=VAN_KIEP_ZONE_AT_LEVEL(r.lv1);if(z1>VAN_KIEP_ZONE_AT_LEVEL(r.lv0))notes.push('🗺️ Mở khóa vùng <b>'+VAN_KIEP_ZONES[z1].name+'</b>!');
 if(r.type==='lose'&&r.streak>=2)notes.push('🍀 Lần sau đối thủ sẽ yếu hơn.');
 if(r.type==='flee')notes.push('Chạy khỏi trận phải trả xu, quái càng mạnh càng tốn.');
 xp.style.boxShadow='inset 0 0 0 3px '+C[2];
 xp.innerHTML='<div style="font-size:38px">'+C[0]+'</div><div style="font-weight:900;font-size:18px;color:'+C[2]+';margin:2px 0">'+C[1]+'</div><div style="font-size:12px">'+(e.m.boss?'👑 ':'')+nm(e)+' · Cấp '+e.lv+'</div><div style="width:100%;max-width:280px;margin:8px 0">'+rows.join('')+'</div><div style="font-size:11.5px;line-height:1.6;color:#ffc978">'+notes.join('<br>')+'</div><div style="font-size:10px;color:#9a8a90;margin-top:6px">Chạm để tiếp tục</div>';
 xp.style.display='flex'}
async function explore(){busy=true;stopReq=false;let iv=0;
 try{while(!stopReq){
  xp.style.display='flex';xp.style.boxShadow='';
  xp.innerHTML='<div class="hg">⏳</div><div style="margin-top:8px;font-weight:700;font-size:14px">Đang thám hiểm<span id="xd">.</span></div><div style="font-size:11px;color:#ffc978;margin-top:4px">'+VAN_KIEP_ZONES[zoneSel].name+' · Uy danh '+fame+'</div><div style="font-size:10.5px;margin-top:5px;line-height:1.5">'+ratesHtml2()+'</div><button id="xp-stop" style="flex:none;margin-top:12px;padding:8px 18px;border-radius:9px;border:1px solid #ff7654;background:#a72f42;color:#fff;font-weight:800;font-size:13px;cursor:pointer">⏹ Dừng thám hiểm</button>';
  let k=0;iv=setInterval(()=>{const d=$('xd');if(d)d.textContent='.'.repeat(1+(++k%3))},400);
  $('xp-stop').onclick=()=>{stopReq=true;$('xp-stop').disabled=true;$('xp-stop').textContent='Đang dừng...'};
  await waitS(3200);clearInterval(iv);if(stopReq)break;
  const e=spawn(),why=WHY[e.m.n]||'Thú đụng độ một con quái hoang dã.';try{getMobSprite(e.m)}catch(_){}
  xp.innerHTML='<div style="font-size:30px">'+(e.m.boss?'👑':'⚠️')+'</div><div style="font-weight:800;font-size:15px;margin:4px 0">Gặp '+nm(e)+' · '+VAN_KIEP_ZONES[e.m.zone].name+' · Cấp '+e.lv+'!</div><div style="max-width:300px;line-height:1.5;color:#ffc978">'+why+'</div>';
  xp.style.boxShadow=e.tr.n==='Thường'?'':'inset 0 0 0 3px '+e.tr.c;
  await wait(1700);xp.style.display='none';xp.style.boxShadow='';
  const r=await battle(e);
  showResult(r);let sk=false;xp.onclick=()=>{sk=true};const t0=Date.now();while(Date.now()-t0<3500&&!sk)await wait(80);xp.onclick=null;
 }}finally{clearInterval(iv);xp.onclick=null;xp.style.display='none';xp.style.boxShadow='';busy=false;if(stopReq)log('⏹ Đã dừng thám hiểm.')}}
/* --- chọn vùng thám hiểm --- */
const zoneName=i=>VAN_KIEP_ZONES[i].name,zoneRange=i=>'Cấp '+VAN_KIEP_ZONE_BOUNDS[i].start+'–'+VAN_KIEP_ZONE_BOUNDS[i].end;
const zToastEl=document.createElement('div');zToastEl.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:88vw;padding:10px 14px;border-radius:10px;background:rgba(16,10,18,.97);border:1px solid #ff7654;color:#ffd9cf;font-size:13px;font-weight:700;text-align:center;z-index:99;display:none;line-height:1.45';document.body.appendChild(zToastEl);
let zToastT=0;const zToast=h=>{zToastEl.innerHTML=h;zToastEl.style.display='block';clearTimeout(zToastT);zToastT=setTimeout(()=>zToastEl.style.display='none',2800)};
const zp=document.createElement('div');zp.style.cssText='margin-bottom:8px';
zp.innerHTML='<button id="btn-zone" style="display:block;width:100%;padding:8px;border-radius:9px;border:1px solid #72e4b0;background:#2a1e26;color:#f6e9e4;font-weight:700;font-size:13px;cursor:pointer"></button><div id="zone-rates" style="font-size:10.5px;text-align:center;margin-top:6px;line-height:1.5"></div><div id="zone-list" style="display:none;margin-top:6px;max-height:240px;overflow-y:auto;border:1px solid rgba(168,92,78,.35);border-radius:9px;background:rgba(16,10,18,.5)"></div>';
{const g0=$('btn-train').parentNode;g0.parentNode.insertBefore(zp,g0)}
function ratesHtml2(){const b=bossPct(),s=TRQ.reduce((a,x)=>a+x.p,0),f=v=>Math.round(v*10)/10,o=TRQ.filter(x=>x.p>0).map(x=>'<span style="color:'+x.c+'">'+x.n+' '+f(x.p*(100-b)/s)+'%</span>');
 o.push('<span style="color:#ff5a6a">👑 Boss '+(b?b+'%':'tắt')+'</span>');return o.join(' · ')}
function ratesLine(){const d=$('zone-rates');if(d)d.innerHTML='Tỉ lệ gặp: '+ratesHtml2()}
let zoneSeen=VAN_KIEP_ZONE_AT_LEVEL(level);
function renderZones(){const mx=VAN_KIEP_ZONE_AT_LEVEL(level),zl=$('zone-list');if(zoneSel>mx)zoneSel=mx;
 $('btn-zone').textContent='🗺️ Vùng: '+zoneName(zoneSel)+' · '+zoneRange(zoneSel)+(zl.style.display==='none'?' ▾':' ▴');
 zl.innerHTML=VAN_KIEP_ZONES.map((z,i)=>{const ok=i<=mx,on=i===zoneSel;return'<div data-z="'+i+'" style="padding:7px 9px;border-bottom:1px solid rgba(88,62,69,.5);font-size:12px;display:flex;justify-content:space-between;gap:6px;cursor:pointer;'+(on?'background:rgba(114,228,176,.16);color:#72e4b0;font-weight:800':ok?'color:#f6e9e4':'color:#8a7a80')+'"><span>'+(on?'✅ ':ok?'🗺️ ':'🔒 ')+z.name+'</span><span>'+zoneRange(i)+'</span></div>'}).join('')}
function pickZone(i){const b=VAN_KIEP_ZONE_BOUNDS[i];
 if(level<b.start){const m='🔒 Chưa đủ cấp! Vùng <b>'+zoneName(i)+'</b> cần thú đạt <b>cấp '+b.start+'</b> (hiện cấp '+level+').';zToast(m);log(m);return}
 zoneSel=i;$('zone-list').style.display='none';renderZones();log('🗺️ Chọn vùng thám hiểm: <b>'+zoneName(i)+'</b> ('+zoneRange(i)+')'+(busy?' — áp dụng từ trận sau.':'.'))}
$('btn-zone').onclick=()=>{const l=$('zone-list');l.style.display=l.style.display==='none'?'block':'none';renderZones()};
$('zone-list').onclick=ev=>{const d=ev.target.closest('[data-z]');if(d)pickZone(+d.dataset.z)};
{const _rx=renderExp;renderExp=function(){_rx();const mx=VAN_KIEP_ZONE_AT_LEVEL(level);
 if(hatched&&mx>zoneSeen)log('🗺️ <b style="color:var(--jade)">Mở khóa vùng '+zoneName(mx)+'</b> ('+zoneRange(mx)+')! Bạn có thể chọn vùng này để thám hiểm.');
 zoneSeen=mx;renderZones()}}
renderZones();ratesLine();
{const gr=$('btn-train').parentNode,hb=document.createElement('button');hb.id='btn-hunt';hb.style.cssText='display:block;width:100%;margin-top:6px;padding:6px;border-radius:9px;border:1px solid #ffd24a;background:#3a2a33;color:#ffd24a;font-weight:700;font-size:12px;cursor:pointer';
 const up=()=>hb.textContent='👑 Săn boss: '+(hunt?'BẬT':'TẮT');up();hb.onclick=()=>{hunt=!hunt;ratesLine();up();log('👑 Săn boss '+(hunt?'bật: có thể gặp boss theo uy danh.':'tắt: sẽ không gặp boss.'))};gr.parentNode.insertBefore(hb,gr.nextSibling)}
window.train=function(){if(!hatched||busy)return;explore()};
window.arena=function(){if(!busy)_a()};window.shop=function(){if(!busy)openShop()};window.TRQ_=TRQ;window.TRB_=TRB;
})();

