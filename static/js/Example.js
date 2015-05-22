/**
 * Created by Benco on 2015/5/21.
 */

window.example = {};
example.client = {};
example.client.url = 'ws://127.0.0.1:8080/Example'
example.client.ws = null;
example.client.callback = {};

example.client.init = function () {
    console.log('fuck')
    example.client.ws = new WebSocket(example.client.url);
    example.client.ws.onopen = example.client.callback.onopen;
    example.client.ws.onmessage = example.client.callback.onmessage;
    example.client.ws.onclose = example.client.callback.onclose;
    example.client.ws.onerror = example.client.callback.onerror;
}

example.client.callback.onopen = function() {
    console.log('This is open');
}

example.client.callback.onmessage = function (event) {
    console.log('ws received :' + event.data);
}

$(document).ready(function() {
    console.log('fuck')
    example.client.init();
    $('#submit').on('click', function() {
        var username = $('#username').val()
        var password = $('#password').val()
        example.client.ws.send(JSON.stringify({
            'username' : username,
            'password' : password
        }));
    })
})