from sites.olx_ua import post as post_olx
from sites.olx_ua import delete_article as del_olx
from sites.olx_ua import find_status as stat_olx
from sites.olx_ua import activate_article as activ_olx 
from sites.olx_ua import deactivate_article as deactiv_olx 
from sites.address import post as post_address
from sites.mirkvartir import post as post_mirkvartir
from sites.fn import post as post_fn
from sites.aviso import post as post_aviso
from sites.address import manage_article as manage_address
from sites.mirkvartir import manage_article as manage_mirkvartir
from sites.fn import manage_article as manage_fn
from sites.aviso import manage_article as manage_aviso

def post(data, driver, redis, id):
	if data['site'] == 'olx.ua':
		post_method = post_olx
	if data['site'] == 'address.ua':
		post_method = post_address
	if data['site'] == 'mirkvartir.ua':
		post_method = post_mirkvartir
	if data['site'] == 'fn.ua':
		post_method = post_fn
	if data['site'] == 'aviso.ua':
		post_method = post_aviso
	post_method(data['article'], data['username'], data['password'], driver, redis, id)
def delete_article(data, driver, redis, id):
	if data['site'] == 'olx.ua':
		delete_method = del_olx
		delete_method(data['article'], data['username'], data['password'], driver, redis, id)
	if data['site'] == 'address.ua':
		manage_address(data['article'], driver, data['username'], data['password'], redis, id, 'del')
	if data['site'] == 'mirkvartir.ua':
		manage_mirkvartir(data['article'], driver, data['username'], data['password'], redis, id, 'del')
	if data['site'] == 'fn.ua':
		manage_fn(data['article'], driver, data['username'], data['password'], redis, id, 'del')
	if data['site'] == 'aviso.ua':
		manage_aviso(data['article'], driver, data['username'], data['password'], redis, id, 'del')

	
def find_status(data, driver, redis, id):
	if data['site'] == 'olx.ua':
		status_method = stat_olx
	if data['site'] == 'address.ua':
		return manage_address(data['article'], driver, data['username'], data['password'], redis, id, 'status')
	if data['site'] == 'mirkvartir.ua':
		return manage_mirkvartir(data['article'], driver, data['username'], data['password'], redis, id, 'status')
	if data['site'] == 'fn.ua':
		return manage_fn(data['article'], driver, data['username'], data['password'], redis, id, 'status')
	if data['site'] == 'aviso.ua':
		return manage_aviso(data['article'], driver, data['username'], data['password'], redis, id, 'status')

	return status_method(data['article'], data['username'], data['password'], driver, redis, id)
def activate_article(data, driver, redis, id):
	if data['site'] == 'olx.ua':
		activ_method = activ_olx
	activ_method(data['article'], data['username'], data['password'], driver, redis, id)
def deactivate_article(data, driver, redis, id):
	if data['site'] == 'olx.ua':
		deactiv_method = deactiv_olx
	deactiv_method(data['article'], data['username'], data['password'], driver, redis, id)		
	
