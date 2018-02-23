const
    http    = require('http'),
    express = require('express'),
    events  = require('web-events-server'); // connect web-events-server

// Passing the client files to the users
let app = express()
    .use('/', express.static('client'));

// Creating HTTP-server
let server = http.createServer(app);

// Binding event handlers to the server
events(server, {

    /*
        This handler will be called when new user 
        connects to the our server (Special event)
    */
    connection() {
        /*** At the moment, the enumeration methods of this.base ignore this user ***/
        console.log(`New gamer: ${this.uid}`);

        // Set a new user HP = 100
        this.hp = 100;

        // Set time of last hit of this user
        this.lastHit = new Date(0);

        /*
            Trigger the 'newUser' event to all active players.
            Pass uid of client and his started hp
        */
        this.base.forEach(client => client.emit('newUser', this.uid, 100));

        // The array of information about active players
        let players = this.base.map(client => ({
            name: client.uid,
            hp: client.hp
        }));

       // Sending the data about all active players to the new player
       this.emit('startedData', [this.uid].concat(players));
    },

    // Client triggered custom event named 'hit' on the server (Custom event)
    hit(target_uid) {

        // Let's see if this gamer can attack someone
        if (Date.now() - this.lastHit < 5 * 1000)
            return; // Ignoring the hit request

        // Getting client object of target from base
        let target = this.base[target_uid];

        // Checking the existence of the target
        if (!target)
            return; // Ignoring the hit request

        // Checking if the target player is alive
        if (target.hp <= 0)
            return; // Ignoring the hit request

        // Obtaining a random damage between 3 and 43
        let damage = Math.round(3 + 40 * Math.random());

        console.log(`User ${this.uid} attacks ${target.uid} — ${damage} HP`);

        // Subtract HP
        target.hp -= damage;

        // Remembering the last hit time
        this.lastHit = Date.now();

        /* 
            If player hasn't HP to continue the game, 
            sending to everybody players 'game over' event.
            Otherwise, sending updated HP data to everybody active players.
        */
        if (target.hp <= 0) {
            this.base.forEach(client => client.emit('gameOver', target.uid));
            target.close(); // Closing connection
         } else {
            this.base.forEach(client => client.emit('attacked', target.uid, target.hp));
         }
    },

    // This event will be triggered when user has been disconnected (Special event)
    close(code, reason) {
        /*** You are no longer in the this.base ***/
        console.log(`Close connection: ${this.uid}`);

        /*
            If gamer close connection then send to
            everybody active user the message 'gameOver'
            with uid of this gamer.
        */
        this.base.forEach(client => client.emit('gameOver', this.uid));
    }

});

// Start server on port 80
server.listen(80);

console.log('Server started! Open in browser http://localhost/');