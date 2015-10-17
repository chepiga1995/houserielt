#-*- coding: utf-8 -*-
import sys
self = {}
self["title"] = unicode("Аренда комнат".decode('utf-8'))
self["url"] = sys.argv[1]
self["site"] = "fn.ua"
self["price"] = "100"
self["type"] = "1"
self["building"] = ["1" , "0"]
self["currency"] = "0"
self["description"] = unicode("Комнаты со всеми удобствами".decode('utf-8'))
self["img_src"] = ["http://img06.olx.ua/images_slandocomua/216956556_2_644x461_kvartira-posutochno-rn-zhd-vokzala-fotografii.jpg"]
self["date"] = "12/34/1333"
self["adv_type"] = "1"
self["telephone"] = "0953067369"
self["rent_from"] = "2015-07-09"
self["location"] = ["1" , "7", unicode("Кака".decode('utf-8')), unicode("вулиця Мазепи 4".decode('utf-8'))]
#self["location"] = ["1" , "7", "Кака", unicode("вулиця Мазепи 4".decode('utf-8'))]
self["rooms"] = "5"
self["space"] = ["103", "100", "23"]
self["floor"] = ["4", "7"]
self["name"] = "ura"
self["remote"] = "26"
print self
