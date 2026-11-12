/* ===== 31-combat-fx.js — Hiệu ứng chiến đấu theo 17 vùng =====
   Tải sprite PNG tại combat-effects/; hiệu ứng trang bị chỉ xuất hiện khi sự kiện thực sự kích hoạt. */
(()=>{
'use strict';
const ATLAS_SRC='combat-fx-atlas.png';
const RECTS={"1_buff_vung/dome-shield/_sheet_nen-trong.png":[0,0,556,556],"1_buff_vung/orbs-cau-xanh-khien/cau-xanh-khien_01.png":[558,0,160,280],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_09.png":[720,0,165,279],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_28.png":[887,0,330,262],"3_don_danh_gan/crescent-purple/crescent-purple_23.png":[1219,0,342,252],"1_buff_vung/orbs-sam-set-mat-dat/sam-set-mat-dat_01.png":[1563,0,256,248],"4_don_danh_xa/orbs-hoa-cau-lon/hoa-cau-lon_01.png":[1821,0,156,248],"1_buff_vung/ground-flame-blue/ground-flame-blue_09.png":[0,558,306,246],"1_buff_vung/orbs-dome-tim-lua/dome-tim-lua_01.png":[308,558,288,232],"4_don_danh_xa/projectiles-b/projectiles-b_10.png":[598,558,396,231],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_08.png":[996,558,288,228],"1_buff_vung/ground-flame-blue/ground-flame-blue_06.png":[1286,558,126,222],"1_buff_vung/ground-flame-blue/ground-flame-blue_07.png":[1414,558,177,222],"4_don_danh_xa/projectiles-b/projectiles-b_08.png":[1593,558,399,219],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_04.png":[0,806,360,213],"4_don_danh_xa/orbs-sao-bang-xanh/sao-bang-xanh_01.png":[362,806,208,212],"4_don_danh_xa/projectiles-b/projectiles-b_04.png":[572,806,405,210],"4_don_danh_xa/orbs-thien-thach-cam/thien-thach-cam_01.png":[979,806,244,204],"1_buff_vung/ground-flame-blue/ground-flame-blue_05.png":[1225,806,117,201],"1_buff_vung/ground-flame-blue/ground-flame-blue_08.png":[1344,806,225,201],"4_don_danh_xa/projectiles-b/projectiles-b_05.png":[1571,806,405,198],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_10.png":[0,1021,288,195],"4_don_danh_xa/projectiles-b/projectiles-b_11.png":[290,1021,378,195],"4_don_danh_xa/lasers-c/lasers-c_15.png":[670,1021,282,189],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_25.png":[954,1021,487,187],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_02.png":[1443,1021,144,186],"1_buff_vung/orbs-dome-hong/dome-hong_01.png":[1589,1021,296,184],"4_don_danh_xa/orbs-cau-den-tim/cau-den-tim_01.png":[0,1218,180,184],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_27.png":[182,1218,122,177],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_34.png":[306,1218,214,177],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_20.png":[522,1218,287,170],"1_buff_vung/ground-flame-blue/ground-flame-blue_04.png":[811,1218,105,168],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_01.png":[918,1218,439,166],"1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png":[1359,1218,172,164],"1_buff_vung/orbs-dome-tim-nho/dome-tim-nho_01.png":[1533,1218,204,160],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_13.png":[0,1404,497,158],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_03.png":[499,1404,252,156],"4_don_danh_xa/projectiles-b/projectiles-b_03.png":[753,1404,408,156],"4_don_danh_xa/projectiles-b/projectiles-b_09.png":[1163,1404,399,156],"4_don_danh_xa/projectiles-b/projectiles-b_02.png":[1564,1404,384,153],"4_don_danh_xa/orbs-linh-hon-xanh-la/linh-hon-xanh-la_01.png":[0,1564,184,148],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_05.png":[186,1564,294,147],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_05.png":[482,1564,152,146],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_33.png":[636,1564,101,146],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_01.png":[739,1564,216,144],"1_buff_vung/dust-ground/dust-ground_01.png":[957,1564,213,141],"1_buff_vung/dust-ground/dust-ground_02.png":[1172,1564,219,141],"1_buff_vung/dust-ground/dust-ground_04.png":[1393,1564,219,141],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_07.png":[1614,1564,384,141],"4_don_danh_xa/projectiles-b/projectiles-b_06.png":[0,1714,405,141],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_06.png":[407,1714,152,140],"1_buff_vung/dust-ground/dust-ground_03.png":[561,1714,210,138],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_07.png":[773,1714,133,136],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_06.png":[908,1714,363,135],"1_buff_vung/ground-flame-blue/ground-flame-blue_03.png":[1273,1714,78,135],"4_don_danh_xa/lasers-c/lasers-c_06.png":[1353,1714,258,135],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_27.png":[1613,1714,96,135],"3_don_danh_gan/crescent-purple/crescent-purple_26.png":[1711,1714,42,132],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_19.png":[1755,1714,103,130],"4_don_danh_xa/orbs-sao-choi-lua/sao-choi-lua_01.png":[0,1857,400,128],"3_don_danh_gan/crescent-purple/crescent-purple_21.png":[402,1857,90,126],"3_don_danh_gan/crescent-purple/crescent-purple_27.png":[494,1857,33,123],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_26.png":[529,1857,84,123],"4_don_danh_xa/projectiles-b/projectiles-b_01.png":[615,1857,381,120],"4_don_danh_xa/projectiles-b/projectiles-b_07.png":[998,1857,399,120],"4_don_danh_xa/projectiles-b/projectiles-b_12.png":[1399,1857,402,120],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_47.png":[1803,1857,84,119],"1_buff_vung/dust-ground/dust-ground_09.png":[0,1987,162,117],"1_buff_vung/dust-ground/dust-ground_19.png":[164,1987,144,117],"1_buff_vung/dust-ground/dust-ground_28.png":[310,1987,99,117],"1_buff_vung/dust-ground/dust-ground_29.png":[411,1987,147,117],"1_buff_vung/dust-ground/dust-ground_30.png":[560,1987,195,117],"1_buff_vung/dust-ground/dust-ground_31.png":[757,1987,93,117],"1_buff_vung/dust-ground/dust-ground_45.png":[852,1987,99,117],"1_buff_vung/dust-ground/dust-ground_49.png":[953,1987,114,117],"1_buff_vung/dust-ground/dust-ground_52.png":[1069,1987,141,117],"3_don_danh_gan/swirl-blue/swirl-blue_11.png":[1212,1987,114,117],"1_buff_vung/dust-ground/dust-ground_34.png":[1328,1987,147,114],"1_buff_vung/dust-ground/dust-ground_44.png":[1477,1987,108,114],"1_buff_vung/dust-ground/dust-ground_53.png":[1587,1987,135,114],"1_buff_vung/dust-ground/dust-ground_54.png":[1724,1987,138,114],"3_don_danh_gan/swirl-blue/swirl-blue_12.png":[1864,1987,102,114],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_28.png":[0,2106,80,112],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_45.png":[82,2106,308,112],"1_buff_vung/dust-ground/dust-ground_10.png":[392,2106,165,111],"1_buff_vung/dust-ground/dust-ground_12.png":[559,2106,156,111],"1_buff_vung/dust-ground/dust-ground_47.png":[717,2106,99,111],"1_buff_vung/dust-ground/dust-ground_61.png":[818,2106,108,111],"3_don_danh_gan/swirl-blue/swirl-blue_03.png":[928,2106,90,111],"3_don_danh_gan/swirl-blue/swirl-blue_10.png":[1020,2106,114,111],"3_don_danh_gan/swirl-blue/swirl-blue_14.png":[1136,2106,90,111],"3_don_danh_gan/swirl-blue/swirl-blue_04.png":[1228,2106,111,108],"3_don_danh_gan/swirl-blue/swirl-blue_15.png":[1341,2106,84,108],"3_don_danh_gan/crescent-blue/crescent-blue_27.png":[1427,2106,108,108],"3_don_danh_gan/swirl-blue/swirl-blue_09.png":[1537,2106,135,105],"3_don_danh_gan/crescent-blue/crescent-blue_26.png":[1674,2106,111,105],"3_don_danh_gan/crescent-purple/crescent-purple_07.png":[1787,2106,135,105],"3_don_danh_gan/swirl-blue/swirl-blue_08.png":[0,2220,135,102],"4_don_danh_xa/magic-bolts-a/magic-bolts-a_02.png":[137,2220,207,102],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_39.png":[346,2220,294,102],"2_buff_bo_trang_bi/aura-flame-colors/aura-xanh-ngoc_1.png":[642,2220,80,102],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_21.png":[724,2220,64,101],"1_buff_vung/dust-ground/dust-ground_11.png":[790,2220,150,99],"1_buff_vung/dust-ground/dust-ground_41.png":[942,2220,114,99],"1_buff_vung/dust-ground/dust-ground_46.png":[1058,2220,99,99],"1_buff_vung/dust-ground/dust-ground_48.png":[1159,2220,114,99],"4_don_danh_xa/lasers-c/lasers-c_14.png":[1275,2220,270,99],"4_don_danh_xa/lasers-c/lasers-c_16.png":[1547,2220,234,99],"3_don_danh_gan/crescent-purple/crescent-purple_02.png":[1783,2220,123,99],"3_don_danh_gan/crescent-purple/crescent-purple_03.png":[1908,2220,120,99],"3_don_danh_gan/crescent-purple/crescent-purple_25.png":[0,2324,30,99],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_04.png":[32,2324,140,98],"2_buff_bo_trang_bi/aura-flame-colors/aura-xanh-ngoc_3.png":[174,2324,134,98],"2_buff_bo_trang_bi/aura-flame-colors/aura-do_3.png":[310,2324,134,98],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_23.png":[446,2324,55,97],"1_buff_vung/dust-ground/dust-ground_05.png":[503,2324,159,96],"1_buff_vung/dust-ground/dust-ground_20.png":[664,2324,129,96],"1_buff_vung/dust-ground/dust-ground_23.png":[795,2324,141,96],"3_don_danh_gan/swirl-blue/swirl-blue_02.png":[938,2324,69,96],"3_don_danh_gan/swirl-blue/swirl-blue_05.png":[1009,2324,132,96],"3_don_danh_gan/swirl-blue/swirl-blue_07.png":[1143,2324,138,96],"3_don_danh_gan/crescent-blue/crescent-blue_05.png":[1283,2324,72,96],"1_buff_vung/ground-flame-blue/ground-flame-blue_02.png":[1357,2324,54,96],"4_don_danh_xa/lasers-c/lasers-c_05.png":[1413,2324,237,96],"4_don_danh_xa/lasers-c/lasers-c_17.png":[1652,2324,294,96],"3_don_danh_gan/crescent-purple/crescent-purple_08.png":[0,2425,120,96],"3_don_danh_gan/crescent-purple/crescent-purple_12.png":[122,2425,120,96],"3_don_danh_gan/crescent-purple/crescent-purple_13.png":[244,2425,123,96],"3_don_danh_gan/crescent-purple/crescent-purple_19.png":[369,2425,123,96],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_08.png":[494,2425,97,95],"2_buff_bo_trang_bi/aura-flame-colors/aura-xanh-ngoc_4.png":[593,2425,49,95],"2_buff_bo_trang_bi/aura-flame-colors/aura-do_4.png":[644,2425,49,95],"1_buff_vung/dust-ground/dust-ground_21.png":[695,2425,129,93],"1_buff_vung/dust-ground/dust-ground_22.png":[826,2425,138,93],"1_buff_vung/dust-ground/dust-ground_33.png":[966,2425,72,93],"1_buff_vung/dust-ground/dust-ground_43.png":[1040,2425,90,93],"1_buff_vung/dust-ground/dust-ground_50.png":[1132,2425,123,93],"1_buff_vung/dust-ground/dust-ground_57.png":[1257,2425,102,93],"1_buff_vung/dust-ground/dust-ground_58.png":[1361,2425,102,93],"1_buff_vung/dust-ground/dust-ground_59.png":[1465,2425,114,93],"1_buff_vung/dust-ground/dust-ground_60.png":[1581,2425,114,93],"3_don_danh_gan/crescent-blue/crescent-blue_09.png":[1697,2425,69,93],"3_don_danh_gan/crescent-blue/crescent-blue_10.png":[1768,2425,63,93],"3_don_danh_gan/crescent-blue/crescent-blue_13.png":[1833,2425,60,93],"3_don_danh_gan/crescent-blue/crescent-blue_25.png":[1895,2425,99,93],"4_don_danh_xa/lasers-c/lasers-c_09.png":[0,2523,264,93],"4_don_danh_xa/lasers-c/lasers-c_13.png":[266,2523,249,93],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_22.png":[517,2523,83,92],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_23.png":[602,2523,100,92],"2_buff_bo_trang_bi/aura-flame-colors/aura-xanh-ngoc_2.png":[704,2523,106,92],"2_buff_bo_trang_bi/aura-flame-colors/aura-do_2.png":[812,2523,106,92],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_24.png":[920,2523,77,91],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_38.png":[999,2523,258,91],"2_buff_bo_trang_bi/aura-flame-colors/aura-do_1.png":[1259,2523,80,91],"1_buff_vung/dust-ground/dust-ground_15.png":[1341,2523,615,90],"1_buff_vung/dust-ground/dust-ground_26.png":[0,2618,210,90],"1_buff_vung/dust-ground/dust-ground_64.png":[212,2618,102,90],"3_don_danh_gan/swirl-blue/swirl-blue_06.png":[316,2618,138,90],"3_don_danh_gan/swirl-blue/swirl-blue_16.png":[456,2618,60,90],"3_don_danh_gan/crescent-blue/crescent-blue_28.png":[518,2618,90,90],"4_don_danh_xa/lasers-c/lasers-c_07.png":[610,2618,234,90],"3_don_danh_gan/crescent-purple/crescent-purple_14.png":[846,2618,114,90],"3_don_danh_gan/crescent-purple/crescent-purple_17.png":[962,2618,120,90],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_25.png":[1084,2618,75,90],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_22.png":[1161,2618,59,89],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_29.png":[1222,2618,80,88],"1_buff_vung/dust-ground/dust-ground_18.png":[1304,2618,147,87],"1_buff_vung/dust-ground/dust-ground_42.png":[1453,2618,87,87],"1_buff_vung/dust-ground/dust-ground_62.png":[1542,2618,93,87],"1_buff_vung/dust-ground/dust-ground_68.png":[1637,2618,93,87],"3_don_danh_gan/swirl-blue/swirl-blue_17.png":[1732,2618,60,87],"3_don_danh_gan/crescent-blue/crescent-blue_08.png":[1794,2618,87,87],"3_don_danh_gan/crescent-blue/crescent-blue_14.png":[1883,2618,72,87],"3_don_danh_gan/crescent-blue/crescent-blue_24.png":[0,2710,96,87],"4_don_danh_xa/lasers-c/lasers-c_02.png":[98,2710,246,87],"3_don_danh_gan/crescent-purple/crescent-purple_18.png":[346,2710,126,87],"1_buff_vung/dust-ground/dust-ground_27.png":[474,2710,72,84],"1_buff_vung/dust-ground/dust-ground_67.png":[548,2710,117,84],"3_don_danh_gan/swirl-blue/swirl-blue_01.png":[667,2710,54,84],"3_don_danh_gan/crescent-blue/crescent-blue_02.png":[723,2710,90,84],"3_don_danh_gan/crescent-blue/crescent-blue_03.png":[815,2710,84,84],"3_don_danh_gan/crescent-blue/crescent-blue_21.png":[901,2710,84,84],"4_don_danh_xa/lasers-c/lasers-c_01.png":[987,2710,240,84],"4_don_danh_xa/lasers-c/lasers-c_03.png":[1229,2710,252,84],"4_don_danh_xa/lasers-c/lasers-c_08.png":[1483,2710,246,84],"3_don_danh_gan/crescent-purple/crescent-purple_01.png":[1731,2710,102,84],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_12.png":[1835,2710,64,84],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_40.png":[0,2799,300,84],"1_buff_vung/dust-ground/dust-ground_06.png":[302,2799,138,81],"3_don_danh_gan/crescent-blue/crescent-blue_04.png":[442,2799,93,81],"3_don_danh_gan/crescent-blue/crescent-blue_06.png":[537,2799,84,81],"3_don_danh_gan/crescent-blue/crescent-blue_12.png":[623,2799,93,81],"3_don_danh_gan/crescent-blue/crescent-blue_20.png":[718,2799,78,81],"3_don_danh_gan/crescent-blue/crescent-blue_22.png":[798,2799,81,81],"4_don_danh_xa/lasers-c/lasers-c_04.png":[881,2799,237,81],"4_don_danh_xa/lasers-c/lasers-c_10.png":[1120,2799,264,81],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_12.png":[1386,2799,56,80],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_18.png":[1444,2799,72,80],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_20.png":[1518,2799,91,79],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_29.png":[1611,2799,123,79],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_37.png":[1736,2799,86,79],"1_buff_vung/dust-ground/dust-ground_56.png":[1824,2799,105,78],"1_buff_vung/dust-ground/dust-ground_66.png":[1931,2799,102,78],"3_don_danh_gan/crescent-blue/crescent-blue_23.png":[0,2885,87,78],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_32.png":[89,2885,69,77],"1_buff_vung/dust-ground/dust-ground_71.png":[160,2885,96,75],"3_don_danh_gan/crescent-blue/crescent-blue_15.png":[258,2885,93,75],"1_buff_vung/ground-flame-blue/ground-flame-blue_01.png":[353,2885,48,75],"4_don_danh_xa/lasers-c/lasers-c_12.png":[403,2885,270,75],"3_don_danh_gan/crescent-purple/crescent-purple_16.png":[675,2885,87,75],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_21.png":[764,2885,78,75],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_30.png":[844,2885,95,73],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_41.png":[941,2885,287,73],"1_buff_vung/dust-ground/dust-ground_07.png":[1230,2885,144,72],"1_buff_vung/dust-ground/dust-ground_08.png":[1376,2885,120,72],"1_buff_vung/dust-ground/dust-ground_16.png":[1498,2885,459,72],"1_buff_vung/dust-ground/dust-ground_17.png":[0,2965,138,72],"1_buff_vung/dust-ground/dust-ground_32.png":[140,2965,75,72],"3_don_danh_gan/crescent-blue/crescent-blue_07.png":[217,2965,54,72],"4_don_danh_xa/lasers-c/lasers-c_11.png":[273,2965,264,72],"3_don_danh_gan/crescent-purple/crescent-purple_04.png":[539,2965,66,72],"3_don_danh_gan/crescent-purple/crescent-purple_09.png":[607,2965,72,72],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_10.png":[681,2965,95,71],"1_buff_vung/dust-ground/dust-ground_13.png":[778,2965,204,69],"1_buff_vung/dust-ground/dust-ground_14.png":[984,2965,213,69],"1_buff_vung/dust-ground/dust-ground_69.png":[1199,2965,93,69],"1_buff_vung/dust-ground/dust-ground_70.png":[1294,2965,90,69],"3_don_danh_gan/crescent-blue/crescent-blue_11.png":[1386,2965,60,69],"1_buff_vung/dust-ground/dust-ground_72.png":[1448,2965,72,66],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_11.png":[1522,2965,75,66],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_26.png":[1599,2965,88,66],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_09.png":[1689,2965,96,63],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_09.png":[1787,2965,85,63],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_24.png":[1874,2965,52,62],"1_buff_vung/dust-ground/dust-ground_55.png":[1928,2965,57,60],"3_don_danh_gan/swirl-blue/swirl-blue_18.png":[1987,2965,54,60],"3_don_danh_gan/crescent-blue/crescent-blue_01.png":[0,3039,84,60],"3_don_danh_gan/crescent-purple/crescent-purple_06.png":[86,3039,87,60],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_43.png":[175,3039,59,58],"3_don_danh_gan/crescent-blue/crescent-blue_16.png":[236,3039,99,57],"3_don_danh_gan/crescent-blue/crescent-blue_17.png":[337,3039,99,57],"3_don_danh_gan/crescent-blue/crescent-blue_19.png":[438,3039,57,57],"3_don_danh_gan/crescent-purple/crescent-purple_11.png":[497,3039,93,57],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_13.png":[592,3039,40,57],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_18.png":[634,3039,96,56],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_14.png":[732,3039,34,55],"3_don_danh_gan/swirl-blue/swirl-blue_13.png":[768,3039,51,54],"1_buff_vung/dust-ground/dust-ground_25.png":[821,3039,45,51],"3_don_danh_gan/crescent-blue/crescent-blue_18.png":[868,3039,69,51],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_15.png":[939,3039,33,51],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_44.png":[974,3039,94,50],"1_buff_vung/dust-ground/dust-ground_24.png":[1070,3039,39,48],"3_don_danh_gan/crescent-purple/crescent-purple_24.png":[1111,3039,60,48],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_35.png":[1173,3039,108,48],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_10.png":[1283,3039,32,46],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_17.png":[1317,3039,55,46],"1_buff_vung/dust-ground/dust-ground_40.png":[1374,3039,45,45],"1_buff_vung/dust-ground/dust-ground_63.png":[1421,3039,45,45],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_35.png":[1468,3039,75,43],"1_buff_vung/dust-ground/dust-ground_36.png":[1545,3039,57,42],"1_buff_vung/dust-ground/dust-ground_37.png":[1604,3039,93,42],"1_buff_vung/dust-ground/dust-ground_51.png":[1699,3039,51,42],"1_buff_vung/dust-ground/dust-ground_65.png":[1752,3039,42,42],"3_don_danh_gan/crescent-purple/crescent-purple_20.png":[1796,3039,42,42],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_17.png":[1840,3039,90,42],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_03.png":[1932,3039,100,42],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_36.png":[0,3101,52,42],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_30.png":[54,3101,74,41],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_16.png":[130,3101,34,41],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_32.png":[166,3101,31,40],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_34.png":[199,3101,96,40],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_15.png":[297,3101,31,40],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_46.png":[330,3101,60,40],"3_don_danh_gan/crescent-purple/crescent-purple_05.png":[392,3101,42,39],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_31.png":[436,3101,41,39],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_36.png":[479,3101,108,39],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_06.png":[589,3101,80,38],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_19.png":[671,3101,77,38],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_11.png":[750,3101,31,38],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_42.png":[783,3101,58,38],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_05.png":[843,3101,112,37],"1_buff_vung/dust-ground/dust-ground_35.png":[957,3101,57,36],"1_buff_vung/dust-ground/dust-ground_38.png":[1016,3101,42,36],"3_don_danh_gan/crescent-purple/crescent-purple_15.png":[1060,3101,39,36],"3_don_danh_gan/crescent-purple/crescent-purple_22.png":[1101,3101,27,36],"3_don_danh_gan/crescent-purple/crescent-purple_28.png":[1130,3101,27,36],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_14.png":[1159,3101,45,36],"3_don_danh_gan/attack-pack-cyan/attack-pack-cyan_31.png":[1206,3101,64,36],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_07.png":[1272,3101,59,34],"1_buff_vung/dust-ground/dust-ground_39.png":[1333,3101,54,33],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_08.png":[1389,3101,43,32],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_16.png":[1434,3101,33,32],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_04.png":[1469,3101,114,31],"3_don_danh_gan/crescent-purple/crescent-purple_10.png":[1585,3101,39,30],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_03.png":[1626,3101,88,30],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_33.png":[1716,3101,69,30],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_02.png":[1787,3101,62,28],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_38.png":[1851,3101,64,26],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_01.png":[1917,3101,44,23],"3_don_danh_gan/slash-pixel-sheet/slash-pixel-sheet_37.png":[1963,3101,26,23]};
const seq=(dir,prefix,count)=>({dir,prefix,count,pad:2,start:1});
const one=file=>({file});
const make=(name,color,mode,attack,field,mark)=>({name,color,mode,attack,field,mark});
const ZONES=[
 make('Tuyết Nguyên','#9fe4ff','ranged',one('4_don_danh_xa/orbs-sao-bang-xanh/sao-bang-xanh_01.png'),seq('1_buff_vung/dust-ground','dust-ground_',72),'❄'),
 make('Sương Cốc','#a3e1d4','melee',seq('3_don_danh_gan/swirl-blue','swirl-blue_',18),one('1_buff_vung/dome-shield/_sheet_nen-trong.png'),'霧'),
 make('Vân Đảo','#c9a8ff','ranged',seq('4_don_danh_xa/magic-bolts-a','magic-bolts-a_',10),one('1_buff_vung/orbs-dome-hong/dome-hong_01.png'),'☁'),
 make('Phong Nguyên','#82f0bb','melee',seq('3_don_danh_gan/crescent-blue','crescent-blue_',28),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'➶'),
 make('Lôi Vực','#ffe53a','ranged',seq('4_don_danh_xa/lasers-c','lasers-c_',17),one('1_buff_vung/orbs-sam-set-mat-dat/sam-set-mat-dat_01.png'),'ϟ'),
 make('Nguyệt Cung','#a8b8ff','melee',seq('3_don_danh_gan/crescent-purple','crescent-purple_',28),one('1_buff_vung/orbs-dome-tim-nho/dome-tim-nho_01.png'),'☾'),
 make('Dương Sơn','#ffa94d','ranged',one('4_don_danh_xa/orbs-thien-thach-cam/thien-thach-cam_01.png'),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'☼'),
 make('Huyền Uyên','#947aff','melee',seq('3_don_danh_gan/slash-pixel-sheet','slash-pixel-sheet_',38),one('1_buff_vung/orbs-dome-tim-lua/dome-tim-lua_01.png'),'◉'),
 make('Kim Khoáng','#e0b038','melee',seq('3_don_danh_gan/attack-pack-cyan','attack-pack-cyan_',47),one('1_buff_vung/orbs-cau-xanh-khien/cau-xanh-khien_01.png'),'◇'),
 make('Ngọc Động','#18e0b0','ranged',one('4_don_danh_xa/orbs-linh-hon-xanh-la/linh-hon-xanh-la_01.png'),one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),'⬡'),
 make('Thanh Lâm','#8be04a','melee',seq('3_don_danh_gan/slash-pixel-sheet','slash-pixel-sheet_',38),seq('1_buff_vung/dust-ground','dust-ground_',72),'♧'),
 make('Xích Hỏa Địa','#ff5a1e','ranged',one('4_don_danh_xa/orbs-hoa-cau-lon/hoa-cau-lon_01.png'),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'♨'),
 make('Hắc Ám Lâm','#b0206a','melee',seq('3_don_danh_gan/swirl-blue','swirl-blue_',18),one('1_buff_vung/orbs-dome-tim-lua/dome-tim-lua_01.png'),'◈'),
 make('Tử Tinh Hải','#b45cff','ranged',one('4_don_danh_xa/orbs-cau-den-tim/cau-den-tim_01.png'),one('1_buff_vung/orbs-dome-tim-nho/dome-tim-nho_01.png'),'✧'),
 make('Thiên Không','#6ac4ff','ranged',seq('4_don_danh_xa/projectiles-b','projectiles-b_',12),one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),'⌁'),
 make('Linh Hoa Viên','#ff7ac0','melee',seq('3_don_danh_gan/attack-pack-cyan','attack-pack-cyan_',47),one('1_buff_vung/orbs-dome-hong/dome-hong_01.png'),'✿'),
 make('Thần Điện','#fff0a0','ranged',seq('4_don_danh_xa/magic-bolts-a','magic-bolts-a_',10),one('1_buff_vung/dome-shield/_sheet_nen-trong.png'),'✥')
];
const SHIELD=one('1_buff_vung/dome-shield/_sheet_nen-trong.png');
const LIGHTNING=one('1_buff_vung/orbs-sam-set-mat-dat/sam-set-mat-dat_01.png');
const LAVA=seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9);
const HEAL={dir:'2_buff_bo_trang_bi/aura-flame-colors',prefix:'aura-xanh-ngoc_',count:4,pad:1,start:1};
const WARM={dir:'2_buff_bo_trang_bi/aura-flame-colors',prefix:'aura-do_',count:4,pad:1,start:1};
const STAR=one('4_don_danh_xa/orbs-sao-choi-lua/sao-choi-lua_01.png');
function gearProc(text){
 if(/Dương Diệm/.test(text||''))return{asset:WARM,color:'#ff8a3a'};
 if(/Thần Phán|Tinh Quang/.test(text||''))return{asset:STAR,color:'#d7a0ff'};
 if(/Thiên Uy/.test(text||''))return{asset:one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),color:'#ffe16b'};
 if(/Sương Tán/.test(text||''))return{asset:SHIELD,color:'#a9f4e5'};
 return null;
}
const cache=new Map();
let currentZone=0,currentPetZone=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pathFor(d,frame){
 if(d.file)return d.file;
 const n=(d.start||1)+(frame%d.count);
 return d.dir+'/'+d.prefix+String(n).padStart(d.pad||2,'0')+'.png';
}
let atlas=null;
function getAtlas(){
 if(atlas)return atlas;
 atlas=new Image();atlas.onerror=()=>{};atlas.src=ATLAS_SRC;return atlas;
}
function ready(){const a=getAtlas();return a.complete&&a.naturalWidth>0}
function frame(d,p){
 const i=d.count?Math.min(d.count-1,Math.floor(clamp(p,0,.9999)*d.count)):0;
 const r=RECTS[pathFor(d,i)],ok=!!r&&ready();
 return{complete:ok,naturalWidth:r?r[2]:0,naturalHeight:r?r[3]:0,r};
}
function paint(g,d,p,x,y,w,h,color,alpha,flip,rotate){
 const im=frame(d,p);
 if(!im.complete||!im.r)return false;
 const iw=im.naturalWidth,ih=im.naturalHeight,s=Math.min(w/iw,h/ih),dw=iw*s,dh=ih*s;
 g.save();g.translate(x,y);g.rotate(rotate||0);if(flip)g.scale(-1,1);
 g.globalAlpha=alpha==null?1:alpha;g.imageSmoothingEnabled=false;
 g.shadowColor=color||'#fff';g.shadowBlur=3;
 g.drawImage(getAtlas(),im.r[0],im.r[1],iw,ih,-dw/2,-dh/2,dw,dh);
 g.restore();return true;
}
function zone(i){return ZONES[Math.max(0,Math.min(ZONES.length-1,Number(i)||0))]}
function getZone(i){return i==null?zone(currentZone):zone(i)}
function getStartBuffs(P,Q){
 const out=[];
 (P.fx||[]).forEach(f=>{
  if(f.k==='shield'&&(P.sh||0)>0)out.push({name:f.S?f.S.name:'Uyên Khiên',kind:'shield'});
  else if(f.k==='weaken')out.push({name:'Phấn Hoa Suy Yếu',kind:'weaken'});
  else if(f.k==='first')out.push({name:'Thiên Uy',kind:'first'});
  else if(f.k==='ambush'&&P.eqAC)out.push({name:'U Ảnh Ám Sát',kind:'ambush'});
 });
 return out;
}
function begin(i,R,petSp){
 currentZone=Math.max(0,Math.min(ZONES.length-1,Number(i)||0));
 currentPetZone=Math.max(0,Math.min(ZONES.length-1,Number(petSp)||0));
 const z=zone(currentZone);getAtlas();
 
}
function zoneBuffArt(b,z){
 switch(b&&b.stat){
  case'def':return SHIELD;
  case'regen':return HEAL;
  case'mag':return STAR;
  case'spd':case'eva':return z.attack;
  case'crit':return LIGHTNING;
  case'atk':return WARM;
  default:return z.attack;
 }
}
/* Bảng thông tin cố định ở 2 góc TRÊN khung, hiện suốt trận (không mờ dần, không đè lên tên/thanh máu) */
function wrapLines(g,t,w,max){const words=String(t).split(' '),out=[];let cur='';
 for(const wd of words){const n=cur?cur+' '+wd:wd;if(cur&&g.measureText(n).width>w){out.push(cur);cur=wd}else cur=n}
 if(cur)out.push(cur);if(out.length>max){out.length=max;out[max-1]=out[max-1].replace(/.{0,2}$/,'…')}return out}
function panel(g,x,y,w,color,lines){
 const lh=9,h=lines.length*lh+4;g.save();g.globalAlpha=.88;g.fillStyle='#100818';g.fillRect(x,y,w,h);
 g.globalAlpha=1;g.strokeStyle=color;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);
 g.textAlign='left';g.textBaseline='top';g.font='bold 8px monospace';
 lines.forEach((l,k)=>{g.fillStyle=l.c;g.fillText(l.t,x+4,y+3+k*lh)});g.restore()}
function infoPanels(g,z,zp,R){
 g.save();g.font='bold 8px monospace';const W=146,iw=W-8,mode=v=>v.mode==='melee'?'Cận chiến':'Đánh xa';
 const L=[{t:zp.mark+' '+zp.name+' · '+mode(zp),c:zp.color}];
 if(R&&R.startBuffs&&R.startBuffs.length)wrapLines(g,'✦ '+R.startBuffs.map(v=>v.name).join(', '),iw,2).forEach(t=>L.push({t,c:'#ffe8a8'}));
 const M=[{t:z.mark+' '+z.name+' · '+mode(z),c:z.color}];
 if(R&&R.zoneBuff)wrapLines(g,R.zoneBuff.label+': '+R.zoneBuff.desc,iw,2).forEach(t=>M.push({t,c:'#fff0bd'}));
 panel(g,3,2,W,zp.color,L);panel(g,357-W,2,W,z.color,M);g.restore()}
function drawField(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold){
 const z=zone(i),zp=zone(petSp==null?currentPetZone:petSp),q=clamp(1-Math.max(0,elapsed-(hold||0))/1.35,0,1),pulse=.55+.45*Math.sin(T*5);
 const ring=(cx,color,opacity)=>{
  g.save();g.globalAlpha=opacity;g.strokeStyle=color;g.lineWidth=2;g.setLineDash([5,4]);g.lineDashOffset=-T*16;
  g.beginPath();g.ellipse(cx,204,36+Math.sin(T*2)*2,7+Math.sin(T*2)*1.2,0,0,Math.PI*2);g.stroke();
  g.setLineDash([]);g.globalAlpha=opacity*.45;g.lineWidth=1;
  for(let k=0;k<5;k++){const a=T*.7+k*Math.PI*2/5;g.fillStyle=color;g.fillRect(cx+Math.cos(a)*29-1,202+Math.sin(a)*6-1,3,3)}
  g.restore();
 };
 ring(85,zp.color,.2+.16*pulse);
 ring(272,z.color,.1+.1*pulse);
 if(q>0){
  const grow=1.25-q*.34;
  paint(g,zp.field,elapsed*1.4,85,160,100*grow,90*grow,zp.color,.25*q,false,0);
  if(R&&R.zoneBuff)paint(g,zoneBuffArt(R.zoneBuff,z),elapsed*1.6,272,157,82,82,z.color,.68*q,false,0);
 }
 infoPanels(g,z,zp,R);
 if(shP>0)paint(g,SHIELD,clamp(.15+T*.12,0,.95),85,157,78,92,'#8fd0ff',.22+.18*pulse,false,0);
 if(shM>0)paint(g,SHIELD,clamp(.15+T*.12,0,.95),272,157,78,92,'#8fd0ff',.18+.14*pulse,false,0);
 if(R&&R.bqP>0&&hp>0&&hp<R.maxP*.5)paint(g,WARM,T*.8,85,157,76,86,'#ff8a3a',.32+.16*pulse,false,0);
 if(R&&R.bqM>0&&mh>0&&mh<R.maxM*.5)paint(g,WARM,T*.8,272,157,76,86,'#ff8a3a',.28+.14*pulse,false,0);
}
/* Trọng tài đếm: số 3-2-1 to giữa sân, mỗi nhịp phóng to rồi thu nhỏ; hết CD thì hô CHIẾN! */
function drawCountdown(g,T,CD,tick,N){
 const out=T>=CD,k=out?clamp((T-CD)/.7,0,1):(T%tick)/tick,n=out?0:N-Math.floor(T/tick);
 if(!out&&(n<1||n>N))return;
 const txt=out?'CHIẾN!':String(n),sc=out?1.15+.35*k:1.5-.5*Math.min(1,k*3),al=out?1-k*k:1;
 g.save();g.globalAlpha=al;g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(38*sc)+'px monospace';
 g.lineWidth=7;g.lineJoin='round';g.strokeStyle='#160e1c';g.strokeText(txt,180,128);
 g.fillStyle=out?'#ff6a3a':n===1?'#ffd24a':'#fff0bd';g.fillText(txt,180,128);
 g.restore()}
function attackMode(z,text){
 if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text||''))return'melee';
 if(/Lôi Phạt giáng|Dung Nham Phun Trào/.test(text||''))return'ranged';
 return z.mode;
}
function drawAttack(g,T,S){
 const z=getZone(S.s),u=S.u||0,pa=!!S.pa,dir=pa?1:-1,text=S.text||'',mode=attackMode(z,text);
 const sx=pa?112:248,tx=pa?255:105,ty=148;
 if(/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng/.test(text)){
  const p=clamp((u-.18)/.7,0,.9999);
  return paint(g,LAVA,p,tx,195,78,74,'#ff632d',.9,false,0)||u>.42;
 }
 if(/Lôi Phạt giáng/.test(text)){
  const p=clamp((u-.22)/.5,0,.9999);
  return paint(g,LIGHTNING,p,tx,ty,82,78,'#ffe53a',.95,false,0)||u>.42;
 }
 if(mode==='ranged'){
  if(u<.18){
   if(u>.035){const charge=clamp((u-.035)/.145,0,1),asset=frame(z.attack,charge*.3);
    if(asset.complete)paint(g,z.attack,charge*.3,sx,ty,28+charge*18,28+charge*18,z.color,.55+charge*.35,false,T*.7)}
   return true;
  }
  if(u<.43){
   const f=clamp((u-.18)/.25,0,1),x=sx+(tx-sx)*f,y=ty-Math.sin(f*Math.PI)*18;
   return paint(g,z.attack,f,x,y,80,54,z.color,S.miss?.88:1,!pa,0)||u>.39;
  }
  return true;
 }
 if(u>=.23&&u<.6){
  const f=clamp((u-.23)/.37,0,1);
  return paint(g,z.attack,f,tx,ty,104,86,z.color,S.miss?.8:1,!pa,(pa?1:-1)*(f-.5)*.18)||u>.42;
 }
 return u>=.6;
}
function drawImpact(g,fx,T){
 const z=getZone(fx.s),text=fx.text||'',q=clamp(fx.q||0,0,.9999),target=(fx.k==='block'||fx.k==='heal'||fx.k==='stun')?(fx.pp?90:270):(fx.pp?272:90),y=150;
 if(fx.k==='block'||/Khiên hấp thụ|Chắn đòn/.test(text)){
  const a=paint(g,SHIELD,q,target,y,86+q*16,96+q*16,z.color,Math.max(.22,1-q),false,0);
  return a;
 }
 let d=z.attack,w=82,h=72,c=z.color,dir=fx.pp?1:-1;
 if(fx.k==='heal'||/hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh/.test(text)){d=HEAL;w=72;h=70;c='#8be04a'}
 else if(/Lôi Phạt/.test(text)){d=LIGHTNING;w=90;h=76;c='#ffe53a'}
 else if(/Dung Nham|Thiêu đốt|Xích Diệm/.test(text)){d=LAVA;w=92;h=76;c='#ff632d'}
 else if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text)){d=z.attack;w=96;h=78}
 else if(fx.k==='stun'){d=LIGHTNING;w=72;h=72;c='#ffe53a'}
 else if(fx.k==='miss'){w=88;h=68}
 const f=q<.35?q/.35:Math.min(.999,(q-.35)/.65);
 const ok=paint(g,d,f,target,y,w,h,c,Math.max(.18,1-q*.86),dir<0,dir*.12);
 const proc=gearProc(text);
 if(ok&&proc)paint(g,proc.asset,q,target,y-5,70,66,proc.color,Math.max(.24,.82-q*.72),false,0);
 if(ok&&fx.k==='crit'){
  g.save();g.globalAlpha=Math.max(0,.7-q);g.strokeStyle='#ffd24a';g.lineWidth=2;g.beginPath();g.arc(target,y,14+q*45,0,Math.PI*2);g.stroke();g.restore();
 }
 return ok;
}
window.TTGCombatFX={
 zones:ZONES,getZone,getStartBuffs,begin,drawField,drawCountdown,drawAttack,drawImpact
};
})();
