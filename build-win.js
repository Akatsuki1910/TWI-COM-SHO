'use strict';

const builder = require('electron-builder');
const fs = require('fs');
const packagejson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

builder.build({
  config: {
    'appId': `com.example.${packagejson.name}`,
    'win': {
      'target': 'portable',
      'icon': 'icon/icon-256x256.png'
    },
  },
});