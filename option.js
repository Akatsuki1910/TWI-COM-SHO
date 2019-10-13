/*jshint esversion: 8 */
const fs = require('fs');
var $ = require("./jquery-3.3.1.min.js");
const storage = require('electron-json-storage');

const {ipcRenderer} = require('electron');
const {shell} = require('electron');

async function deckwin() {
    var a = $("#tag").val();

    await twi_accwrite(a);

    ipcRenderer.send('deckwin',a);
}

function deckend() {
    ipcRenderer.send('deckend','');
}

function twi(){
    shell.openExternal("https://twitter.com/nomber1910");
}

function twi_accwrite(a){
    var jso = {"key":a[0],"sec":a[1],"tag":a[2]};

    storage.set('./twi_acc.json', jso, function (error) {
        if (error) throw error;
    });
}

!function start(){
    $.ajaxSetup({async: false});
	$.getJSON("./twi_acc.json",(data)=>{
        $("#tag").val(data.tag);
	});
    $.ajaxSetup({async: true});
}();