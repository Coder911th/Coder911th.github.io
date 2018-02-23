function webEvents(evs) {

    // Версия web-events-client
    var VERSION = '1.1.1';

    /*
        Обёртка над пользовательским событием

        Позволяет выполнять отправку ответа на вызванное событие 
        (обработчиком которого является func с аргументами args) 
        через return самого обработчика. 

        Ответ будет доставлен инициатору события - серверу
    */
    function returnEmit(func, args) {
        var returnValue = func.apply(client, args);

        if (typeof returnValue != "object")
            return; // Если возвращен примитив, игнорируем

        var eventName, // Имя вызываемого на другой стороне события
            args;      // Аргументы вызова

        if (returnValue instanceof Array) {
            /*
                Из обработчика был возвращён массив => первый его элемент  
                является типом вызываемого события, а остальные - аргументами
            */
            eventName = returnValue[0];
            args = returnValue.slice(1);
        } else {
            /*
                Из обработчика бы возвращен объект
                В свойстве type этого объекта должен быть указан тип события, 
                а остальные свойства будут именованными аргументами
            */
            eventName = returnValue.type;
            delete args.type; // Убираем свойство type из аргументов
        }

        // Вызываем событие на другой стороне соединения
        client.emit(eventName, args);
    }

    /*
        Вызывает событие на стороне сервера

        eventName - название вызываемого события
        n-ое количество аргументов в псевдо-массиве arguments

        Аргументы можно перечислять через зяпятую. В этом случае
        порядок будет сохранён при вызове соответствующего обработчика
        на другой стороне соединения
        Также можно в качестве args передать единственный объект, в этом 
        случае клиент получит один объект целиком
    */
    function emit(eventName) {
        // Аргументы вызова, отправляемые серверу
        var args = Array.prototype.slice.call(arguments, 1);

        if (args.length == 1 && typeof args[0] == 'object')
            args = args[0]; // Если аргументы были переданы через объект (массив)

        socket.send(JSON.stringify({
            type: eventName,
            args: args
        }));
    }

    /*
        Завершает соединение с сервером
    */
    function disconnect() {
        socket.close();
    }

    /*
        Переподключается к серверу с теми же настройками
        и обработчиками событий
    */
    function reconnect() {
        if (WebSocket.OPEN)
            socket.close();
        connect();
    }

    var
        // Клиентский сокет
        socket = null,

        // Функциональность клиента (возвращается из функции events)
        client = {
            emit: emit,             // Вызвать событие
            disconnect: disconnect, // Отключиться
            reconnect: reconnect,   // Переподключиться
            version: VERSION        // Версия web-events-client
        };


    /*
        Данная функция подключается к WebSocket серверу
        и устанавливает все необходимые обработчики
    */        
    function connect() {

        // Устанавливаем соединение по WebSocket
        socket = new WebSocket('ws://' + location.hostname);

        // Соединение открыто
        socket.onopen = function() {
            if (evs.connection)
                returnEmit(evs.connection);
        };

        // Получено сообщение
        socket.onmessage = function(message) {
            var data;

            // Предполагается, что данные приходят в JSON-формате
            try {
                data = JSON.parse(message.data);
            } catch(e) { return; }

            // В свойстве type указывается тип события
            if (typeof data.type != 'string')
                return;
            /*
                Формат: от клиента приходит JSON-объект
                data.type - тип события
                data.args - объект аргументов
            */
        
            // Вызываем пользовательское событие, если оно было объявлено
            if (evs[data.type])
                returnEmit(evs[data.type], data.args);
        };

        // Соединение закрыто
        socket.onclose = function() {
            /*
                Вызываем обработчик закрытия соединения,
                если таковой определён
            */
            if (evs.close)
                returnEmit(evs.close);
        };

    }

    // Устанавливаем соединение в первый раз
    connect();

    // Возвращает вызывалку событий
    return client;

}

if (window.events === undefined)
    window.events = webEvents;