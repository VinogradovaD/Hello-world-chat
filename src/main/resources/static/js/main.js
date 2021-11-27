const aboutPage = document.getElementById('about');

const roomsPage = document.getElementById('rooms');

const usernamePage = document.querySelector('.sign-in');

const chatPage = document.querySelector('.chat');

const roomForm = document.querySelectorAll('.room');

const usernameForm = document.querySelector('.form-for-name');

const messageForm = document.querySelector('.form-for-message');

const messageInput = document.querySelector('.message');

const messageArea = document.querySelector('#messageArea');

const connectingElement = document.querySelector('.connecting');

const textError = document.querySelector('.error');

const roomName = document.querySelector('.chat-title')

const menu = document.getElementById('menu');

const home = document.querySelector('.logo');

const textBack = document.querySelector('.text-back');

let stompClient = null;

let username = null;

function enter(event) {
    aboutPage.classList.add('hidden');
    roomsPage.classList.add('hidden');
    menu.classList.add('hidden');
    usernamePage.classList.remove('hidden');
    window.scroll(0, 0);
    roomName.innerHTML = event.target.dataset.name;
    event.preventDefault();
}

function connect(event) {
    username = document.querySelector('.name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        textBack.classList.remove('hidden');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    } else {
        textError.innerHTML = 'Введите корректное имя пользователя'
    }
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe('/topic/public/' + roomName.innerHTML, onMessageReceived);
    stompClient.send("/app/chat.addUser/" + roomName.innerHTML,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    connectingElement.classList.add('hidden');

}
function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage/" + roomName.innerHTML, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    let messageElement = document.createElement('li');
    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' присоединил(ась/ся) к чату!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' покинул(a) чат!';
    } else {
        messageElement.classList.add('chat-message');
        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        messageElement.appendChild(avatarElement);
        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }
    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function reload() {
    location.reload();
    window.scroll(0, 0);
}

roomForm.forEach(item => {
    item.addEventListener('submit', enter, true);
});

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
home.addEventListener('click', reload);
textBack.addEventListener('click', reload);