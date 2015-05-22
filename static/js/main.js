/**
 * Created by Benco on 2015/5/1.
 */


$(function() {
    var um = UM.getEditor('myEditor');
    $('#nickname')[0].focus();
    var socket = new WebSocket('ws://127.0.0.1:8080/websocket');

    socket.onmessage = function(event) {
        addMessage(event.data);
    };
    $('#send').on('click', function() {
        var nickname = $('#nickname').val();
        var passwd = $('#passwd').val();
        if (!um.hasContents()) {
            um.focus();
            $('.edui-container').addClass('am-animation-shake');
            setTimeout("$('.edui-container').removeClass('am-animation-shake')", 1000);
        } else if (nickname == '') {
            $('#nickname')[0].focus();
            $('#message-input-nickname').addClass('am-animation-shake');
            setTimeout("$('#message-input-nickname').removeClass('am-animation-shake')", 1000);
        }else if (passwd == ''){
            $('#passwd')[0].focus();
            $('#message-input-passwd').addClass('am-animation-shake');
            setTimeout("$('#message-input-passwd').removeClass('am-animation-shake')", 1000);
        } else {
            socket.send(JSON.stringify({
                content : um.getContent(),
                nickname : nickname,
                passwd : passwd
            }));
            um.setContent('');
            um.focus();
        }
    });
    function addMessage(message) {
        message = JSON.parse(message);
        var messageItem = '<li class="am-comment '
            + (message.isSelf ? 'am-comment-flip' : 'am-comment')
            + '">'
            + '<a href="javascript:void(0)" ><img src="/assets/images/'
            + (message.isSelf ? 'self.png' : 'others.jpg')
            + '" alt="" class="am-comment-avatar" width="48" height="48"/></a>'
            + '<div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta">'
            + '<a href="javascript:void(0)" class="am-comment-author">'
            + message.nickname + '</a> <time>' + message.date
            + '</time></div></header>'
            + '<div class="am-comment-bd">' + message.content
            + '</div></div></li>';
        $(messageItem).appendTo('#message-list');
        $(".chat-content-container").scrollTop($(".chat-content-container")[0].scrollHeight);
    }
});