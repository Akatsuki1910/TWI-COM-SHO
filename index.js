/*jshint esversion: 8 */
var $ = require("./jquery-3.3.1.min.js");
var twitter = require('twitter');
const twitterAPI = require('node-twitter-api');
const fs = require('fs');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray=electron.Tray;
const Menu=electron.Menu;
const nativeImage = electron.nativeImage;

let main_w;
let sub_w;

var tray=null;
var tryIcon=null;

const {ipcMain} = require('electron');
ipcMain.on('deckwin', (event, arg) => {
    createMenu(true);
    deckwin_main(arg);
});
ipcMain.on('deckend', (event, arg) => {
    deckend();
});

var text;
var user;
ipcMain.on('job', (event, arg) => {
    var a = [text,user];
    event.sender.send('reply-job', a);
});

var con_key="";
var con_sec="";
var acc_key;
var acc_sec;

const twiapi = new twitterAPI({
    consumerKey:    con_key,
    consumerSecret: con_sec,
    callback:       '',
});

function createWindow() {
    main_w = new BrowserWindow({width: 500, height: 300,
        webPreferences: {nodeIntegration: true},
        frame: false
    });
    twiapi.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
        var url = twiapi.getAuthUrl(requestToken);
        main_w.webContents.on('will-navigate', function (event, url) {
            var matched;
            if (matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)) {
                twiapi.getAccessToken(requestToken, requestTokenSecret, matched[2], function (error, accessToken, accessTokenSecret, results) {
                    acc_key = accessToken;
                    acc_sec = accessTokenSecret;
                twiapi.verifyCredentials(acc_key, acc_sec, {}, function (error, data, respons) {
                    main_w.loadURL(__dirname + '/option.html');
                });
            });
            }
            event.preventDefault();
        });
        main_w.loadURL(url);
    });
    //main_w.loadFile('option.html');
    //main_w.webContents.openDevTools();
    main_w.on('closed', () => {
        main_w = null;
    });

    sub_w = new BrowserWindow({
        webPreferences: {nodeIntegration: true},
        transparent: true,
        frame: false,toolbar: false,alwaysOnTop: true
    });
    sub_w.setIgnoreMouseEvents(true);
    sub_w.maximize();
    sub_w.loadFile('index.html');
    //sub_w.webContents.openDevTools();
    sub_w.on('closed', () => {
        sub_w = null;
    });
    sub_w.hide();

    createMenu(false);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (main_w === null) {
        createWindow();
    }
});

function deckwin_main(p){
    clienttwitter(p);
    main_w.hide();
    sub_w.show();
    main();
}
function deckwin_main_undo(){
    sub_w.reload();
    sub_w.hide();
    main_w.show();
    stream.destroy();
    createMenu(false);
}
function deckend(){
    app.quit();
}

//twitter
var client;
var tag;
var stream;

function clienttwitter(p){
    client = new twitter({
        consumer_key:        con_key,
        consumer_secret:     con_sec,
        access_token_key:    acc_key,
        access_token_secret: acc_sec
    });
    tag=p;
    var moji={track:tag};
    stream = client.stream('statuses/filter', moji);
}

const main = () => {
    stream.on('data', async da => {
        try {
            text=da.text;
            user=da.user.screen_name;
        } catch (error) {
            //app.quit();
        }
    });
};

function createMenu(menu_flg){
    if(tray!=null){tray.destroy();nativeImage.createEmpty();}
    tryIcon = nativeImage.createFromPath(__dirname+'/icon/icon-32x32.png');
    tray = new Tray(tryIcon);

    const contextMenu = Menu.buildFromTemplate([
        {label: '終了'	,click(){deckwin_main_undo();},enabled:menu_flg},
        //{label: '管理者専用',accelerator: 'Shift+CmdOrCtrl+i',role: 'toggledevtools'}
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('TWI-COM-SHO');
    tray.on('click', () => {tray.popUpContextMenu(contextMenu);});
}