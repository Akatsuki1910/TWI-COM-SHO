/*jshint esversion: 6 */
const {ipcRenderer} = require('electron');

var width = window.innerWidth;
var height = window.innerHeight;
var stage = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(width, height,{
    antialias: true,
    transparent: true,
});
document.getElementById("pixiview").appendChild(renderer.view);

var style = {fontFamily : 'Arial',fontSize : '40px', fill:'white', fontWeight : "bold"};

var mem;
var cou=0;
var wo_obj=[];

!function loop(){
    requestAnimationFrame(loop);
    addtext();
    movetext();
    renderer.render(stage);
}();

function addtext(){
    ipcRenderer.send('job', 'ping');
    ipcRenderer.on('reply-job', (event, arg) => {
        use=arg[1];
        if(use!=mem){
            var word = arg[0];
            wo_obj[cou] = new PIXI.Text(word, style);
            wo_obj[cou].alpha=0.6;
            stage.addChild(wo_obj[cou]);
            wo_obj[cou].x=width;
            wo_obj[cou].y=Math.floor(Math.random()*height-40);
            cou++;
            if(cou>=1000000){cou=0;}
        }
        mem=use;
    });
}

function movetext(){
    for(var i=0;i<cou;i++){
        if(wo_obj[i]==""){continue;}
        try{
            wo_obj[i].x-=5;
        }catch(e){
            console.log(i);
            console.log(e);
        }
        if(wo_obj[i].position.x<-wo_obj[i].text.length*40){
            wo_obj[i]="";
        }
    }
}