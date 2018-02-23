const
    http    = require('http'),
    express = require('express'),
    events  = require('web-events-server'); // connect web-events-server

// Creating basic file server on http
let app = express()
    .use(express.static(__dirname + '/client'));

// Creating HTTP-server
let server = http.createServer(app);

// Binding event handlers to the server
events(server, {

    /*
        This handler will be called when new user 
        connects to the your server (Special event)
    */
    connection() {
        console.log(`New user: ${this.uid}`);

        /*
            Send the 'printToChat' event to the client
            This event will be triggered by user as soon as
            he receives it.
        */
        this.emit('printToChat', 'You have been connected to a chat');
    },

    // Client triggered custom event named 'chat' on the server (Custom event)
    chat(message) {
        // Client wants to send his message to the everybody active users
        console.log(`From ${this.uid} recieves a message "${message}"`);

        // Send this broadcast message
        this.base.forEach(client => client.emit('printToChat', message));

        // If user sent a message like 'kick me' then disconnect him from chat
        if (message == 'kick me')
            this.close();
    },

    // This event will be triggered when user has been disconnected (Special event)
    close(code, reason) {
        console.log(`Close connection ${this.uid}`);
    }

});

// Start server on port 80
server.listen(80);

console.log('Server started! Open in browser http://localhost/');