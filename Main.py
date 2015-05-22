__author__ = 'Benco'

import tornado.web
import tornado.ioloop
import tornado.websocket
import tornado.httpserver
import tornado.options
import tornado.escape
import uuid
import json
import DataBase
import os
from tornado.options import define,options
import logging
import datetime

define('port', default=8080, help='Run The Given Port', type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/',Indexhandler),
            (r'/index',Mainhandler),
        ]
        settings = dict(
            template_path = os.path.join(os.path.dirname(__file__), 'template'),
            static_path = os.path.join(os.path.dirname(__file__), 'static'),
            debug = True
        )
        tornado.web.Application.__init__(self,handlers,**settings)

class Indexhandler(tornado.web.RequestHandler):

    def get(self, *args, **kwargs):
        self.render('index.html')

class Mainhandler(tornado.websocket.WebSocketHandler):

    callback = {
        'login' : 'handleLogin',
        'register' : 'handleRegister',
        'sendmsg' : 'handleSend',
        'whisper' : 'handleWhisper'
    }
    user_id = 0
    first = False
    UserContainer = dict()
    UserCache = set()
    def init(self):
        self.nickname = None
        self.dbc = DataBase.DataBaseController()
        self.user_id = None
    def open(self, *args, **kwargs):
        logging.info('Open Successed')
        self.init()
        Mainhandler.UserCache.add(self)

    def on_message(self, message):
        logging.info('Message Transform')
        message = json.loads(message)
        self.ParseCmd(message)

    def on_close(self):
        logging.info("Close Success")
        Mainhandler.UserCache.remove(self)

    def ParseCmd(self, message):
        msg_type = message['type']
        func = getattr(self, Mainhandler.callback[msg_type])
        func(message)

    def handleLogin(self, message):
        nickname = message['nickname']
        passwd = message['passwd']
        sign = self.dbc.Login(nickname, passwd)
        flag = False
        if not Mainhandler.first:
            if sign and (nickname not in Mainhandler.UserContainer):
                flag = True
        else:
            flag = sign
        ret = dict()
        ret.setdefault('type','login')
        ret.setdefault('status',str(flag))
        if flag :
            Mainhandler.first = True
            self.nickname = nickname
            self.user_id = Mainhandler.user_id
            ret['user_id'] = Mainhandler.user_id
            ret['nickname'] = nickname
            ret['passwd'] = passwd
            ret['msg'] = 'Login succeed,welcome back,'+str(nickname)
            Mainhandler.UserContainer[nickname] = self
            Mainhandler.user_id += 1
        self.write_message(json.dumps(ret))

    def handleRegister(self, message):
        nickname = message['nickname']
        passwd = message['passwd']
        sign = self.dbc.Register(nickname, passwd)
        ret = {
            'type' : 'register',
            'status' : str(sign),
            'nickname' : nickname,
            'passwd' : passwd
        }
        if sign :
            ret['msg'] = 'Register Successed'
        else :
            ret['msg'] = 'Sorry Register Failed'
        self.write_message(json.dumps(ret))
    def handleSend(self, message):
        content = message['content']
        ret = {
            'type' : 'sendmsg',
            'nickname' : self.nickname,
            'content' : content,
            'date' : datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        for user in Mainhandler.UserCache:
            ret['isSelf'] = True if user == self else False
            ret['user_id'] = self.user_id
            user.write_message(json.dumps(ret))

    def handleWhisper(self, message):
        content = message['content']
        username = message['username']
        items = Mainhandler.UserContainer[username]
        ret = {
            'type' : 'sendmsg',
            'nickname' : username,
            'content' : content,
            'date' : datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'isSelf' : True if items == self else False,
            'user_id' : items.user_id
        }
        items.write_message(json.dumps(ret))
        res = {
            'type' : 'sendmsg',
            'nickname' : self.nickname,
            'content' : content,
            'date' : datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'isSelf' : True ,
            'user_id' : self.user_id
        }
        self.write_message(json.dumps(res))

def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    main()
