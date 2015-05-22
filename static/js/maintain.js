/**
 * Created by Benco on 2015/5/1.
 */

window.wechat = {};

wechat.client = {};
wechat.client.ws = null;
wechat.client.url = 'ws://127.0.0.1:8080/fkjava/websocket';
wechat.client.callback = {};

wechat.status = function (json) {
    this.login = false;
    this.register = false;
    this.nickname = null;
    this.passwd = null;
    this.user_id = null;
    switch (json.type) {
        case "login" :
            if (json.status == true) {
                this.login = true;
                this.nickname = json.nickname;
                this.user_id = json.user_id;
            }
            break;
        case "register" :
            if (json.status == true) {
                this.register = true;
            }
            break;
    }
}

wechat.client.init=function () {
    wechat.client.ws = new WebSocket(wechat.client.url);
    wechat.client.ws.onopen = wechat.client.callback.onopen;
    wechat.client.ws.onmessage = wechat.client.callback.onmessage;
    wechat.client.ws.onclose = wechat.client.callback.onclose;
    wechat.client.ws.onerror = wechat.client.callback.onerror;
}

wechat.client.callback.onopen = function () {
    console.log("ws is opened");
}

wechat.client.callback.onmessage = function (event) {
    console.log("ws received :" +json);
    var json = JSON.parse(event.data);
    alert(json.type);
    switch (json.type) {
        case "login" :
            /*
                判断json.status 是否为真,wechat.client.
                消除上方的登陆,注册选项,显示nickname和注销按钮
            * */
            if (json.status == true) {
                wechat.status(json);
                $('.nav-collapse ul').hide();
            }
            else {
                alert("Please Login in with a appropriate nickname and password")
            }
            break;
        case "register" :
            /*
             判断json.status 是否为真
             隐藏注册页面，show出登陆页面
            * */
            if (json.status == true) {
                wechat.status(json);
                alert("Register successful , Please Login in");
                $('#form-login').show();
                $('#form-register').hide();
            }
            else {
                alert("Please Register with a appropriate nickname and password")
            }
            break;
        case "sendmsg":
            /*
             判断wechat.status.login是否为真
             发送信息到聊天框
            * */
            if (wechat.status.login == true && wechat.status.register == true) {
                if (wechat.status.nickname == json.nickname) {
                    if (json.msg != '')
                        wechat.client.sendmsg(json);
                }
            }
            else {
                alert("Please Login or Register First");
            }
            break;
    }
}
wechat.client.callback.onclose = function () {
    console.log("ws is closed");
}
wechat.client.callback.onerror = function () {
    console.log("ws is error");
}
wechat.client.sendmsg = function (json) {
    var message = json;
    var messageItem = '<li class="am-comment '
        + (message.isSelf ? 'am-comment-flip' : 'am-comment')
        + '">'
        + '<a href="javascript:void(0)" ><img src="/assets/images/'
        + (message.isSelf ? 'self.png' : 'others.jpg')
        + '" alt="" class="am-comment-avatar" width="48" height="48"/></a>'
        + '<div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta">'
        + '<a href="javascript:void(0)" class="am-comment-author">'
        + message.nickname + message.user_id +'</a> <time>' + message.date
        + '</time></div></header>'
        + '<div class="am-comment-bd">' + message.content
        + '</div></div></li>';
    $(messageItem).appendTo('#message-list');
    $(".chat-content-container").scrollTop($(".chat-content-container")[0].scrollHeight);
}



$(document).ready(function() {
    console.log("init");
    wechat.client.init();
    $('#sendmsg').on('click',function() {
        var um = UM.getEditor('myEditor');
        if (!um.hasContents()) {	// 判断消息输入框是否为空
            // 消息输入框获取焦点
            um.focus();
            // 添加抖动效果
            $('.edui-container').addClass('am-animation-shake');
            setTimeout("$('.edui-container').removeClass('am-animation-shake')", 1000);
        }
        else {
            alert(um.getContent());
            wechat.client.ws.send(JSON.stringify({
                "type":"sendmsg",
                "content": um.getContent()
            }));
        }
    })

    $('#form-register').submit(function(event) {
        var nickname = $('#nickname-reg').val();
        var passwd = $('#passwd-reg').val();
        var passwd2 = $('#passwd2-reg').val();

        if (!nickname || !passwd || !passwd2) {
            alert("This options can not be empty");
        }
        else if (passwd != passwd2) {
            alert("Should Comfirm your password");
        }
        else {
            wechat.client.ws.send(JSON.stringify({
                "type":"register",
                "nickname":nickname,
                "passwd":passwd
            }));
        }
    });

    $('#form-login').submit( function(event) {
        var nickname = $('#nickname').val();
        var passwd = $('#passwd').val();
        alert(nickname + passwd);
        if(!nickname || !passwd) {
            alert("This options can not be empty");
        }
        else {
            wechat.client.ws.send(JSON.stringify({
                "type":"login",
                "nickname":nickname,
                "passwd":passwd
            }));
        }
    });
    $('.login').click(function() {
        if($('#form-login').is(':visible')) {
            $('#form-login').hide();
        }else {
            $('#form-login').show();
            $('#form-register').hide();
        }
    });
    $('.register').click(function() {
        if($('#form-register').is(':visible')) {
            $('#form-register').hide();
        }else {
            $('#form-login').hide();
            $('#form-register').show();
        }
    })
})