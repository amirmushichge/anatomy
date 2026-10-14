/** Presentation metadata is independent of geometry and mechanism state. */
export const PRESENTATION={
 pen:{category:'Writing',camera:{yaw:1.7,pitch:.28},thumbnail:{yaw:1.7,pitch:.28},primary:'Click plunger'},
 keyboard:{category:'Input',camera:{yaw:-1.28,pitch:1.08},thumbnail:{yaw:-1.28,pitch:1.08}},
 lens:{category:'Optics',optionLabel:'Optics',modes:['Lens','Iris']},
 watch:{category:'Timekeeping',camera:{yaw:-1.35,pitch:1.12}},
 gamepad:{category:'Input',camera:{yaw:-1.45,pitch:1.1}},
 lock:{category:'Security'},
 hub:{category:'Transmission',camera:{yaw:-1.15,pitch:.65},optionLabel:'Gear',modes:['1','2','3']},
 engine:{category:'Motion'},
 motor:{category:'Motion',optionLabel:'Supply',modes:['Forward','Reverse']},
 speaker:{category:'Sound'},
 pump:{category:'Pneumatics'},
 hdd:{category:'Storage',camera:{yaw:-1.4,pitch:1.04}}
};
export const presentation=id=>PRESENTATION[id]||{};
