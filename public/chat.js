const socket = io();

// DOM elements
let chat = document.getElementById('c-window');
let message = document.getElementById('message');
let btn = document.getElementById('send');

const send = () => {
  socket.emit('message', { message: message.value });
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

socket.on('message', (data) => {
  chat.innerHTML += `<p>${data.message}</p>`;
});