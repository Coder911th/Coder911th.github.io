var textbox    = document.getElementById('textbox'),
    sendButton = document.getElementById('send'),
    chatBox    = document.getElementById('chat-box');

/*
    Establishes a connection to the server
    You can use return value later to trigger custom event on the server
*/
var socket = events({

    // Connection is established successfully (Special event)
    connection() {
        console.log('Connection is established successfully!');
    },

    // Received message from another user (Custom event)
    printToChat(message) {
        // print this message to the chat
        chatBox.value += message + '\n';
    },

    // Connection has been closed (Special event)
    close() {
        console.log('You have been disconnected!');
    }

});

// Adding click handler on send button
sendButton.onclick = function() {
    // Calling 'chat' event on the server with textbox.value argument
    socket.emit('chat', textbox.value);

    // Clear input field
    textbox.value = '';
};