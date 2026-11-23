// config.js — DEBE cargarse PRIMERO en todos los HTML
// Usar var (no const/let) para que sea accesible entre scripts

var API_BASE_URL = 'https://taxodino-ioim.onrender.com';
var STATIC_BASE_URL = 'https://taxodino-frontend.s3.us-east-2.amazonaws.com';

console.log('✅ config.js cargado correctamente');
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   currentUser:', localStorage.getItem('currentUser'));
console.log('   favorites:', localStorage.getItem('favorites'));