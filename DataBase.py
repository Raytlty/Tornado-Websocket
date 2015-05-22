__author__ = 'Benco'

import logging
import pymongo

class DataBaseController:
    def __init__(self):
        self.mongoClient = pymongo.MongoClient('localhost',27017)
        self.mongoDatabase = self.mongoClient.get_database('YooChat')
        self.userCollection = self.mongoDatabase.get_collection("user")

    def Register(self, nickname, passwd):
        doc = {
            'nickname' : nickname,
            'passwd' : passwd,
        }
        try:
            self.userCollection.insert(doc)
            logging.info('Register Successed')
        except Exception as emsg:
            logging.info("Register Error " + emsg)
            return False
        return True
    def Login(self, nickname, passwd):
        r_password = None
        try :
            doc = self.userCollection.find_one({'nickname':nickname})
            r_password = doc['passwd']
        except Exception as emsg:
            logging.info("Login Failed " + emsg)
            return False
        logging.info("username")
        return passwd == r_password
