/**
 * Created by Benco on 2015/5/2.
 */
$("#form-register").submit(function(e){
    var username = $("#username-reg").val();
    var password = $("#password-reg").val();
    var password2 = $("#password2-reg").val();

    console.log("用户名：" + username + " 密码：" + password + " 确认密码：" + password2);

    if(password !== password2){
        alert("两次输入密码不一致！");
        return false;
    }

    if(username === '' || password === '' || password2 === ''){
        $(".nav-collapse .label-warning").html("输入不能为空!").show();
    }else{
        $.ajax({
            type: "post",
            url: "../Register",
            data: {
                "nickname" : nickname,
                "passwd" : passwd,
                "passwd2" : passwd2
            },
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data['state'] === "success"){
                    $(".nav-collapse .label-success").html(data['info']).show();
                }else if(data['state'] == "unsame"){
                    $(".nav-collapse .label-warning").html(data['info']).show();
                }else{
                    $(".nav-collapse .label-important").html(data['info']).show();
                }
            },
            error: function(){
                $(".nav-collapse .label-important").html("服务器错误，请稍后再试...").show();
            }
        });
    }
    setTimeout('$(".nav-collapse .label").hide()', 3000);
})
