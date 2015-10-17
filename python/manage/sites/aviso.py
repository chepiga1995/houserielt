import support, sys, redis, json
import ErrorMessage
import PostingMessage
from selenium.common.exceptions import NoSuchElementException, InvalidElementStateException
import time, math, numpy as np
choose_section = [['4', '10', '10', '10'], ['1', '9', '9', '9']]
choose_subsection = ['1', '1', '2', '2', '3', '1']
choose = ['2', '3', '1', '6', '9', '5', '7', '12', '12']
currency = ['3', '5', '4']


def getAttribute(driver, element, _str):
	return driver.execute_script("""
var element = arguments[0];
return element.getAttribute('"""+_str+"""');
""", element)

	
def norm(text, comm):
	try:
		unicode(text, 'utf-8')
	except:
		pass
	text = text.replace(u'\xa0', u' ')
	if comm == 'del':
		text = text.replace(u' ', u'')
	text = text.strip()
	return text

def compare(text1, text2, comm = ''):
	if norm(text1, comm) == norm(text2, comm):
		return True
	else:
		return False

def log_in(driver, login, password):
	driver.get('http://online.aviso.ua/account2/index.php')
	if not support.wait_for_load(driver, "#inputEmail", 10):
		raise NoSuchElementException()
	support.move_mouse(driver, driver.find_element_by_id('inputEmail'))
	support.send_text(driver.find_element_by_id('inputEmail'), login)
	support.move_mouse(driver, driver.find_element_by_id('inputPassword'))
	support.send_text(driver.find_element_by_id('inputPassword'), password)
	support.move_mouse(driver, driver.find_element_by_css_selector(".controls button"))
	if not support.wait_for_load(driver, ".span8 li:nth-child(3) a", 40):
		raise Exception(ErrorMessage.login)

def logout(driver):
	try:
		driver.get('http://online.aviso.ua/account2/logout.php')
	except:
		try:
			time.sleep(2)
		except:
			return True	
	return True	

def manage_article(self, driver, login, password, write, id, comm = 'id'):
	urls = ['http://online.aviso.ua/account2/myads.php']
	try:
		log_in(driver, login, password)
		if comm in ['status', 'id']:
			write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.stat_p25}))#------------------------message---------------------------	
		else:
			write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.del_p25}))#------------------------message---------------------------	
			
		for url in urls:
			driver.get(url)
			time.sleep(2)
			'''
			for i, el in enumerate(driver.find_elements_by_xpath("//*[@id='pagination']/li/a")):
				if el.get_attribute('href') not in urls:
					urls.append(el.get_attribute('href'))
			'''
	 		
			elements = []
			status = ''
			id_d = ''
			if support.wait_for_load(driver, 'a[href*="newad_step4.php?"]', 10):
				elements = driver.find_elements_by_css_selector('a[href*="newad_step4.php?"]')
			#elements_text = driver.find_elements_by_css_selector("span[style='display:block;height:50px;width:300px']")
			for _id in range(len(elements)):
				try:	
					if not support.wait_for_load(driver, 'a[href*="newad_step4.php?"]', 10):
						raise NoSuchElementException()	
					else:
						elements = driver.find_elements_by_css_selector('a[href*="newad_step4.php?"]')
					_url = getAttribute(driver, elements[_id], 'href')
					driver.get('http://online.aviso.ua/account2/'+_url)
					if not support.wait_for_load(driver, ".controls .input-large", 10):
						raise NoSuchElementException()	
					price = getAttribute(driver, driver.find_element_by_css_selector('.controls .input-large'), 'value')			
					
					text = driver.execute_script("var el = document.getElementById('inputAdText'); return el.innerHTML;")
					driver.back()	
					if compare(price, self['price'], 'del') and compare(text, self['description']):
						try:
							img_src = driver.find_element_by_xpath("/html/body/div/div[7]/div[2]/table/tbody/tr["+str(_id+1)+"]/td[5]/a[4]/img").get_attribute('src')
						except:
							img_src = driver.find_element_by_xpath("/html/body/div/div[7]/div[2]/table/tbody/tr["+str(_id+1)+"]/td[5]/a[3]/img").get_attribute('src')
						try:
							id_d = driver.find_element_by_xpath("/html/body/div/div[7]/div[2]/table/tbody/tr["+str(_id+1)+"]/td[5]/a[6]").get_attribute('href')
						except:
							id_d = driver.find_element_by_xpath("/html/body/div/div[7]/div[2]/table/tbody/tr["+str(_id+1)+"]/td[5]/a[5]").get_attribute('href')
						if 'deactivate.png' in img_src:
							status = 'active'
						else:
							status = 'noactive'						
						if comm in ['status', 'id']:
							write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.stat_p50}))#------------------------message---------------------------	
						else:
							write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.del_p50}))#------------------------message---------------------------		
	
						if comm == 'del':
							driver.get('http://online.aviso.ua/account2/myads.php')
							if not support.wait_for_load(driver, 'a[href*="newad_step4.php?"]', 10):
								raise NoSuchElementException()	
							driver.get(id_d)
							time.sleep(2)
							write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.del_p75}))#------------------------message----------	
							if driver.current_url == 'http://online.aviso.ua/account2/myads.php?result=del_ok':
								logout(driver)
								write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.del_p100}))#------------------------message---------------------------
								return 0
							else:
								driver.save_screenshot(self["_id"] + 'report_aviso.png')
								logout(driver)
								raise Exception(ErrorMessage.change)

						if comm == 'status':
							write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.del_p75}))#------------------------message---------------------------	
							logout(driver)
							return status
						if comm == 'id':
							write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.del_p75}))#------------------------message---------------------------	
							logout(driver)
							return id_d		
			
				except NoSuchElementException:		
					raise Exception(ErrorMessage.change)
		logout(driver)
		return 1
				
	except Exception as e:
		driver.save_screenshot(self["_id"] + 'report_aviso.png')
		logout(driver)
		raise Exception(ErrorMessage.wrong)				


def post(self, login, password, driver, write, id):
	COUNT_TIMES = 10
	
	try:	
		log_in(driver, login, password)
		time.sleep(2)		
		per_tel = self['per_telephone'][1:]
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.post_p25}))#------------------------message---------------------------
		support.move_mouse(driver, driver.find_element_by_css_selector(".span8 li:nth-child(3) a"))
		if not support.wait_for_load(driver, ".form-horizontal label:nth-child(1)", 20):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal label:nth-child(1)"))
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal button"))

		n1 = choose_section[int(self["adv_type"])][int(self["building"][0])]
		#if self["adv_type"] == '0' and self["building"][0] in ('0', '2') and self["building"][1] == '2':
		#	n1 = '4'	 
		n2 = 1
		if self["building"][0] in ('1','3'):
			n2 = int(self["building"][0])
			if self["building"][0] == '3':
				n2 = 2
		if self["location"][0] == '0':
			n3 = int(self["location"][1]) + 1
		else:
			n3 = int(self["location"][1]) + 12
		if n3 > 36 - 25 * (1 ^ int(self["adv_type"])):
			n3 = 37 - 26 * (1 ^  int(self["adv_type"]))
		n4 = currency[int(self["currency"])]
		n5 = (int(self["rooms"]) + 1)	if self['rooms'] != '' else 0
		print n5
		if n5 > 6:
			n5 = 6
		if not support.wait_for_load(driver, ".form-horizontal label:nth-child(" + n1 + ")", 10):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal label:nth-child(" + n1 + ")"))
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal button[type='submit']"))

		if not support.wait_for_load(driver, ".form-horizontal label:nth-child(" + str(n2) + ")", 10):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal label:nth-child(" + str(n2) + ")"))
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal button[type='submit']"))
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.post_p50}))#------------------------message---------------------------
		if not support.wait_for_load(driver, "input[name='ad_title']", 20):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector("input[name='ad_title']"))
		support.send_text(driver.find_element_by_css_selector('input[name="ad_title"]'), self["title"])

		support.move_mouse(driver, driver.find_element_by_css_selector("textarea[name='ad_text']"))
		support.send_text(driver.find_element_by_css_selector('textarea[name="ad_text"]'), self["description"])
		if support.wait_for_load(driver, '#adDistrict', 2):
			support.move_mouse(driver, driver.find_element_by_css_selector('#adDistrict'))
			driver.find_element_by_css_selector('#adDistrict option[value="' + str(n3) + '"]').click()

		support.move_mouse(driver, driver.find_element_by_css_selector("input[name='ad_price']"))
		support.send_text(driver.find_element_by_css_selector('input[name="ad_price"]'), self["price"])

		support.move_mouse(driver, driver.find_element_by_css_selector("select[name='ad_currency']"))
		driver.find_element_by_css_selector('select[name="ad_currency"] option[value="' + str(n4) + '"]').click()

		if self["building"][0] == '0':
			support.move_mouse(driver, driver.find_element_by_xpath("//*[@id='adRooms']"))
			driver.find_element_by_css_selector('#adRooms option:nth-child(' + str(n5) + ')').click()
	
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_all']"))
			support.send_text(driver.find_element_by_css_selector('input[name="space_all"]'), self["space"][0])
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_live']"))
			support.send_text(driver.find_element_by_css_selector('input[name="space_live"]'), self["space"][1])
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_kitch']"))
			support.send_text(driver.find_element_by_css_selector('input[name="space_kitch"]'), self["space"][2])

			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='floor']"))
			support.send_text(driver.find_element_by_css_selector('input[name="floor"]'), self["floor"][0])
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='floors']"))
			support.send_text(driver.find_element_by_css_selector('input[name="floors"]'), self["floor"][1])
		if self["building"][0] == '1':
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_all']"))
			support.send_text(driver.find_element_by_css_selector('input[name="space_all"]'), self["space"][0])
			if self["adv_type"] == '1':
				support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_live']"))
				support.send_text(driver.find_element_by_css_selector('input[name="space_live"]'), self["space"][1])
				support.move_mouse(driver, driver.find_element_by_css_selector("input[name='floors']"))
				support.send_text(driver.find_element_by_css_selector('input[name="floors"]'), self["floor"][1])
		if self["building"][0] == '3':
			support.move_mouse(driver, driver.find_element_by_css_selector("input[name='space_all']"))
			support.send_text(driver.find_element_by_css_selector('input[name="space_all"]'), self["space"][0])
		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.post_p75}))#------------------------message---------------------------
		support.move_mouse(driver, driver.find_element_by_css_selector("input[name='op_code1']"))
		support.send_text(driver.find_element_by_css_selector('input[name="op_code1"]'), per_tel[:2])
		support.move_mouse(driver, driver.find_element_by_css_selector("input[name='phone_num1']"))
		support.send_text(driver.find_element_by_css_selector('input[name="phone_num1"]'), per_tel[2:9])
		support.move_mouse(driver, driver.find_element_by_css_selector("#inputContact"))
		support.send_text(driver.find_element_by_css_selector('#inputContact'), self["per_name"])
		support.move_mouse(driver, driver.find_element_by_css_selector(".form-horizontal button[type='submit']"))

		if not support.wait_for_load(driver, "input[type='file']", 40):
			raise NoSuchElementException()
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
		for src in self["img_src"]:	
			try:
				support.send_text(driver.find_element_by_css_selector("input[type='file']"), self["_id"] + src)
			 	support.move_mouse(driver, driver.find_element_by_css_selector("input[type='submit']"))
			except:
				time.sleep(5)
		if not support.wait_for_load(driver, ".btn-large", 10):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector(".btn-large"))	
		if not support.wait_for_load(driver, ".btn-warning", 10):
			driver.save_screenshot(self["_id"] + 'report_aviso.png')
			logout(driver)
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector(".btn-warning"))
		print "Done!"
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.post_p100})) #------------------------message---------------------------
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_aviso.png')}))	
		logout(driver)
	except NoSuchElementException, InvalidElementStateException:
		#driver.save_screenshot(self[self["_id"]] + 'report_mirkvartir.png')
		driver.save_screenshot(self["_id"] + 'report_aviso.png')
		logout(driver)
		print 'picture'
		raise Exception(ErrorMessage.change)
	return 0
	
