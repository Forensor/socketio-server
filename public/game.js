const socket = io();

// DOM elements
let chat = document.getElementById('c-window');
let message = document.getElementById('message');
let btn = document.getElementById('send');
let characters = document.getElementById('characters');
let select = document.getElementById('select-char');
let dice = document.getElementById('throw');

const send = () => {
  socket.emit('message', { name: document.getElementById('playing').innerHTML, message: message.value });
  message.value = '';
};

btn.addEventListener('click', () => {
  send();
});

message.addEventListener('keydown', (evnt) => {
  if (evnt.key === 'Enter') {
    send();
  }
});

select.addEventListener('click', () => {
  document.getElementById('game-info').innerHTML = `Juegas con: <div id="playing" style="background-color: #${characters.value};">${characters.options[characters.selectedIndex].text}</div>`;
  socket.emit('player', { name: characters.options[characters.selectedIndex].text });

  if (document.getElementById('playing').innerHTML === 'Cnel. Rubio') {
    document.getElementById('game-info').innerHTML += '<button id="newGame">Nuevo juego</button>';
    document.getElementById('game-info').innerHTML += '<button id="repartir">Repartir cartas</button>';
    document.getElementById('newGame').addEventListener('click', () => {
      socket.emit('newGame');
    });
    document.getElementById('repartir').addEventListener('click', () => {
      socket.emit('repartir');
    });
  }
});

dice.addEventListener('click', () => {
  const n1 = Math.floor(Math.random() * 6) + 1;
  const n2 = Math.floor(Math.random() * 6) + 1;
  document.getElementById('d1').innerHTML = n1;
  document.getElementById('d2').innerHTML = n2;
  if (document.getElementById('playing') != null) {
    message.value = `<u>sacó un <b>${n1 + n2}</b> en los dados</u>`;
    send();
  }
});

socket.on('message', (data) => {
  chat.innerHTML += `<p><b>${data.name}:</b> ${data.message}</p>`;
  chat.scrollTop = chat.scrollHeight;
});

socket.on('refresh', () => {
  location.reload();
});

socket.on('plist', (data) => {
  document.getElementById('jugadores').innerHTML = 'Jugadores conectados:';
  data.forEach(jug => {
    document.getElementById('jugadores').innerHTML += `<p>${jug}</p>`;
  });
});

socket.on('carta', (data) => {
  if (data.name == document.getElementById('playing').innerHTML) {
    document.getElementById('cards').innerHTML += `<img src="/img/${data.carta}.png" width="150px" style="cursor: pointer;">`;
  }
});

socket.on('acusados', (data) => {
  document.getElementById('sobre').innerHTML += '<button id="abrir">Abrir sobre con la solución</button>';
  document.getElementById('abrir').addEventListener('click', () => {
    let mostrador = `
      <div id="mostrador" style="position: absolute; top: 0; left: 0; background-image: url('img/fondo.png'); width: 100%; height: 100%; z-index: 100;">
        <div id="cerrar" style="opacity: 1; color: white; cursor: pointer;">CERRAR</div>
        <br><br>
        <img src="img/${data[0]}.png" style="opacity: 1;">
        <img src="img/${data[1]}.png" style="opacity: 1;">
        <img src="img/${data[2]}.png" style="opacity: 1;">
      </div>
    `;

    document.getElementById('mostradora').innerHTML += mostrador;
    message.value = `abrió el sobre con la solución`;
    send();
    document.getElementById('cerrar').addEventListener('click', () => {
      document.getElementById('mostrador').remove();
    });
  });
});

socket.on('ensenaboton', (data) => {
  let opciones = '';
  data.forEach(nombre => {
    opciones += `<option value="${nombre}">${nombre}</option>`;
  });
  document.getElementById('ensena').innerHTML += `
  <label for="ensenacartas">Enseñar cartas a:</label>
  <select name="ensenacartas" id="ensenacartas">
    ${opciones}
  </select>
  `;

  let imgs = document.getElementsByTagName('img');
  Array.from(imgs).forEach(img => {
    img.addEventListener('click', () => {
      socket.emit('mostrarcarta', { name: document.getElementById('ensenacartas').value, url: img.src, sender: document.getElementById('playing').innerHTML });
    });
  });
});

socket.on('cartaparati', (data) => {
  if (data.name == document.getElementById('playing').innerHTML) {
    let mostrador = `
      <div id="mostrador" style="position: absolute; top: 0; left: 0; background-image: url('img/fondo.png'); width: 100%; height: 100%; z-index: 100;">
        <div id="cerrar" style="opacity: 1; color: white; cursor: pointer;">CERRAR</div>
        <br><br>
        <img src="${data.url}" style="opacity: 1;">
      </div>
    `;

    document.getElementById('mostradora').innerHTML += mostrador;
    message.value = `miró una carta de <b>${data.sender}</b>`;
    send();
    document.getElementById('cerrar').addEventListener('click', () => {
      document.getElementById('mostrador').remove();
    });
  }
});