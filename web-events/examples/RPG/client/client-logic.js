function createPlayer(name, hp) {
    return $(
        '<div class="player" uid="' + name + '">' +
            '<button>Hit</button>' +
            '<span>' + name + '</span>' +
            '<span>HP: ' + hp + '</span>' +
        '</div>'
    );
}

var my_uid = null;

var socket = events({

    // Received data on all active players and your unique id
    startedData(myUID, ...players) {

        // Saving my uid
        my_uid = myUID;

        // Placing each received player in the <body>
        for (let player of players)
            createPlayer(player.name, player.hp)
                .appendTo('body');
    },

    // Received the data about a new user
    newUser(name, hp) {
        createPlayer(name, hp) // Create Markup
            .appendTo('body'); // put it in <body>
    },

    // Someone was attacked (name is target uid, hp is new  HP)
    attacked(name, hp) {

        // If I am the target
        if (name == my_uid)
            $('#my-hp')
                .text(hp);
        else
            $('[uid="' + name + '"]')
                .children()
                .last()
                .text(hp); // Updating hp value
    },

    // The player whose name is the first argument is lost
    gameOver(name) {
        if (name == my_uid) {
            $('#my-hp')
                .text(0);
            
            alert('GAME OVER');
        }
        else
            $('[uid="' + name + '"]')
                .children()
                .first()
                    .prop('disabled', true) // Blocking the hit button
                    .end()
                .last()
                    .text(0); // Setting hp is zero
    }

});

// Hit handler
$('body')
    .on('click', 'button', function() {
        var name = $(this).next().text();
        socket.emit('hit', name);
    });