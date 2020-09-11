export default class Chat {
    constructor() {
        this.openedYet = false;
        this.chatWrapper = document.querySelector('#chat-wrapper');
        this.openIcon = document.querySelector('.header-chat-icon');
        this.injectHTML();
        this.chatField = document.querySelector('#chatField');
        this.chatForm = document.querySelector('#chatForm');
        this.closeIcon = document.querySelector('.chat-title-bar-close')

        this.events();
    }

    //EVENTS
    events() {
        this.openIcon.addEventListener('click', () => this.showChat());
        this.closeIcon.addEventListener('click', () => this.closeChat());
        this.chatForm.addEventListener('submit', (event) => {
            event.preventDefault()
            this.sendMessageToServer();
        })
    }
    //METHODS
    injectHTML() {
        this.chatWrapper.innerHTML = `<div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
            <div id="chat" class="chat-log"></div>
            <form id="chatForm" class="chat-form border-top">
                <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
            </form>`
    }

    showChat() {
        if(!this.openedYet){
            this.openConnection()
        }
        this.openedYet = true;
        this.chatWrapper.classList.add('chat--visible');
    }

    closeChat() {
        this.chatWrapper.classList.remove('chat--visible');
    }

    openConnection(){
        this.socket = io();
        this.socket.on('chatMessageFromServer', (data) => {
            alert(data.message);
        })
    }

    sendMessageToServer() {
        this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value})
        this.chatField.value = '';
        this.chatField.focus();
    }
}
