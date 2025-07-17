import menuCmd from './menu.js';
import pingCmd from './ping.js';
import botinfoCmd from './botinfo.js';
import kickCmd from './kick.js';
import kickallCmd from './kickall.js';
import tagallCmd from './tagall.js';
import tagCmd from './tag.js';
import sudoCmd from './add-s.js';
import delsudoCmd from './del-s.js';
import sudolistCmd from './sudolist.js';
import ownerCmd from './owner.js';
import modeCmd from './mode.js';
import autoreactCmd from './autoreact.js';
import welcomeCmd from './welcome.js';
import tagadminCmd from './tagadmin.js';
import bugmenuCmd from './b-menu.js';
import goodbyeCmd from './gbye.js'

export default {
  menu: menuCmd,
  ping: pingCmd,
  botinfo: botinfoCmd,
  kick: kickCmd,
  kickall: kickallCmd,
  tagall: tagallCmd,
  tag: tagCmd,
  sudo: sudoCmd,
  delsudo: delsudoCmd,
  sudolist: sudolistCmd,
  owner: ownerCmd,
  mode: modeCmd,
  autoreact: autoreactCmd,
  welcome: welcomeCmd,
  tagadmin: tagadminCmd,
  bugmenu: bugmenuCmd,
  goodbye: goodbyeCmd
};
