const express = require('express');
const path = require('path');
const app = express();

const socketio = require('socket.io');

// Settings
app.set('port', process.env.PORT || 3000);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Server start
const server = app.listen(app.get('port'), () => {
  console.log(`Server port: ${app.get('port')}`);
});

const io = socketio.listen(server);

let players = [];

let armas = [
  'cuchillo',
  'escopeta',
  'cuerda',
  'bate',
  'nunchaku',
  'pie',
  'botella',
  'nutria',
  'hoz',
  'matarratas'
];
let lugares = [
  'iglesia',
  'posada',
  'ayuntamiento',
  'bar',
  'comisaria',
  'casona',
  'granja',
  'colegio',
  'plaza',
  'antro',
  'colmado',
  'kiosco'
];
const sospechosoIMG = [
  ['Anacleto Botana', 'anacleto'],
  ['Bonifacio III', 'bonifacio'],
  ['Casimiro Tolomiro', 'casimiro'],
  ['Cleta Lacocleta', 'cleta'],
  ['Gertrudis González', 'gertrudis'],
  ['Gilberto Ibáñez', 'gilberto'],
  ['Guadalupe Ramos', 'guadalupe'],
  ['Hipólito Mirañar', 'hipolito'],
  ['Isidora', 'isidora'],
  ['Jacinta Balmes', 'jacinta']
];

let acusados = [];

const barajar = () => {
  let baraja = [...armas, ...lugares];
  let ahadma = Math.floor(Math.random() * players.length);
  let removed = players.splice(ahadma, 1)[0];
  let acu = sospechosoIMG.find(sospechoso => {
    if (sospechoso[0] == removed) {
      return sospechoso;
    }
  })[1];

  acusados.push(acu);
  players.forEach(player => {
    baraja.push(sospechosoIMG.find(sospechoso => {
      if (sospechoso[0] == player) {
        return sospechoso;
      }
    })[1]);
  });
  players.splice(ahadma, 0, removed);
  let nbaraja = [];
  while (baraja.length > 0) {
    const r = Math.floor(Math.random() * baraja.length);
    nbaraja.push(baraja[r]);
    baraja.splice(r, 1);
  }
  return nbaraja;
}

const repartir = (baraja) => {
  let jugador = 0;
  while (baraja.length > 0) {
    if (jugador == players.length) {
      jugador = 0;
    }

    io.sockets.emit('carta', { name: players[jugador], carta: baraja[0] });
    baraja.shift();
    
    jugador += 1;
  }
}

// Websockets
io.on('connection', (socket) => {
  io.sockets.emit('plist', players);

  socket.on('message', (data) => {
    io.sockets.emit('message', data);
  });

  socket.on('player', (data) => {
    players.push(data.name);

    io.sockets.emit('plist', players);
  });

  socket.on('newGame', () => {
    players = [];
    armas = [
      'cuchillo',
      'escopeta',
      'cuerda',
      'bate',
      'nunchaku',
      'pie',
      'botella',
      'nutria',
      'hoz',
      'matarratas'
    ];
    lugares = [
      'iglesia',
      'posada',
      'ayuntamiento',
      'bar',
      'comisaria',
      'casona',
      'granja',
      'colegio',
      'plaza',
      'antro',
      'colmado',
      'kiosco'
    ];
    acusados = [];
    io.sockets.emit('refresh');
  });

  socket.on('repartir', () => {
    acusados.push(armas.splice(Math.floor(Math.random() * armas.length), 1)[0]);
    acusados.push(lugares.splice(Math.floor(Math.random() * lugares.length), 1)[0]);
    repartir(barajar());
    io.sockets.emit('ensenaboton', players);
    io.sockets.emit('acusados', acusados);
  });

  socket.on('mostrarcarta', (data) => {
    io.sockets.emit('cartaparati', data);
  });
});
