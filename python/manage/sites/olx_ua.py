# -*- coding: utf-8 -*-
import support, json, redis, sys
import time
import time, math, numpy as np
import ErrorMessage
import PostingMessage
from selenium.common.exceptions import NoSuchElementException, InvalidElementStateException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.common.keys import Keys
chose_flat = [['15', '206', '9', '20', '28', '11'], ['13', '18', '1137', '10', '21', '14']]
Map_olx_directs = [[u"Голосеевский", u"Дарницкий", u"Деснянский", u"Днепровский", u"Оболонский", u"Печерский", u"Подольский", u"Святошинский", u"Соломенский", u"Шевченковский"], ["Барышевский", "Белоцерковский", "Богуславский", "Бориспольский", "Бородянский", "Броварской", "Васильковский", "Володарский", "Вышгородский",
    u"Згуровский", u"Иванковский", u"Кагарлыкский", u"Киево-Святошинский", u"Макаровский", u"Мироновский", u"Обуховский", u"Переяслав-Хмельницкий", u"Полесский",
    u"Ракитнянский", u"Сквирский", u"Ставищенский", u"Таращанский", u"Тетиевский", u"Фастовский", u"Яготинский"]];
Map_olx_city = [[u"Киев", u"Киев", u"Киев", u"Киев", u"Киев", u"Киев", u"Киев", u"Киев", u"Киев", u"Киев"], [u"Барышевка", u"Белая Церковь", u"Богуслав", u"Борисполь", u"Бородянка",
    u"Бровары", u"Васильков", u"Володарка", u"Вышгород", u"Згуровский", u"Иванков", u"Кагарлык", u"Киево-Святошинский", u"Макаров", u"Мироновка", u"Обухов", u"Переяслав-Хмельницкий",
    u"Полесский", u"Рокитное", u"Сквира", u"Ставищенский", u"Тараща", u"Тетиев", u"Фастов", u"Яготин"]];
Map_olx_status = {'http://olx.ua/myaccount/moderated/': 4, 'http://olx.ua/myaccount/': 3, 'http://olx.ua/myaccount/waiting/': 2, 'http://olx.ua/myaccount/archive/': 1}   

def remove_element(driver, href, href_art):
	if href == 'http://olx.ua/myaccount/waiting/':
		return driver.find_element_by_xpath('//a[@href="' + href_art + '"]/../../../../following-sibling::tr[1]//*[@data-code="removeme"]')
	else:
		return driver.find_element_by_xpath('//a[@href="' + href_art + '"]/../*[3]')
def post(self, login, password, driver, write, id):
	#variables -----------------------------------------
	try:
		adv_type = int(self["adv_type"])
		category = int(self["building"][0])
		try:
			subcategory = int(self["building"][1]) + 1
		except:
			subcategory = 0
		currency = int(self["currency"]) + 1
		if self["type"] == '':
			house_type = 0
		else:	
			house_type = int(self["type"]) + 1
		loc1 = int(self["location"][0])	
		loc2 = 9 - int(self["location"][1])	
		district = Map_olx_directs[loc1][loc2]
		if self["location"][2] == "":
			city = Map_olx_city[loc1][loc2]
		else:
			city = 	self["location"][2]
		
		map_address = city + u", Киевская область" 
	except :
		raise Exception(ErrorMessage.fields)
	#start	--------------------------------------------------
	try:
		log_in(driver, login, password)
		time.sleep(2)
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.post_p25}))#------------------------message---------------------------		
		#add -----------------------------------------------------------------
		if not support.wait_for_load(driver, "#postNewAdLink", 10):
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_id("postNewAdLink"))
		time.sleep(2)
		#title ----------------------------------------------------------------
		if not support.wait_for_load(driver, "#add-title", 10):
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_id("add-title"))
		driver.find_element_by_id('add-title').send_keys(self["title"])
		time.sleep(2)
		support.move_mouse(driver, driver.find_element_by_id("targetrenderSelect1-0"))
		#select catecory -----------------------------------------------------------------------
		if not support.wait_for_load(driver, "#cat-1", 15):
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_id("cat-1"))
		if not support.wait_for_load(driver, '#category-1 a[data-category="' + chose_flat[adv_type][category] + '"]', 2):
			raise NoSuchElementException()
		support.move_mouse(driver, driver.find_element_by_css_selector('#category-1 a[data-category="' + chose_flat[adv_type][category] + '"]'))
		
		if support.wait_for_load(driver, '#category-' + chose_flat[adv_type][category] + ' li:nth-child(' + str(subcategory) +')', 2):
			support.move_mouse(driver, driver.find_element_by_css_selector('#category-' + chose_flat[adv_type][category] + ' li:nth-child(' + str(subcategory) +')'))
		if not support.wait_for_load(driver, '#parameter-div-price input.text', 10):
			raise NoSuchElementException()
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.post_p50}))#------------------------message---------------------------	
		#price ----------------------------------------------	
		driver.execute_script("document.getElementById('targetid_private_business').getElementsByTagName('dd')[0].getElementsByTagName('ul')[0].style.display = 'block';")
		support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-price input.text'))
		support.send_text(driver.find_element_by_css_selector('#parameter-div-price input.text'), self["price"])
		support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-price dl dt a'))
		support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-price dl li:nth-child(' + str(currency) + ')'))
		#options -------------------------------------------------------------------------------------
		if category in (0, 2):
			if support.wait_for_load(driver, '#parameter-div-number_of_rooms input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-number_of_rooms input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-number_of_rooms input'), self["rooms"])
			if support.wait_for_load(driver, '#parameter-div-total_area input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-total_area input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-total_area input'), self["space"][0])
			if support.wait_for_load(driver, '#parameter-div-total_living_area input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-total_living_area input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-total_living_area input'), self["space"][1])
			if support.wait_for_load(driver, '#parameter-div-kitchen_area input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-kitchen_area input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-kitchen_area input'), self["space"][2])
			if house_type and support.wait_for_load(driver, '#parameter-div-house_type dl dt a', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-house_type dl dt a'))
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-house_type dl li:nth-child(' + str(house_type) + ')'))
			if support.wait_for_load(driver, '#parameter-div-floor input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-floor input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-floor input'), self["floor"][0])
			if support.wait_for_load(driver, '#parameter-div-total_floors input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-total_floors input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-total_floors input'), self["floor"][1])
			if support.wait_for_load(driver, '#parameter-div-rent_from input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-rent_from input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-rent_from input'), self["rent_from"])
			if support.wait_for_load(driver, '#parameter-div-total_rooms_in_flat input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-total_rooms_in_flat input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-total_rooms_in_flat input'), self["rooms"])
		if category in (1, 3):
			support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-distance_from_city input'))
			support.send_text(driver.find_element_by_css_selector('#parameter-div-distance_from_city input'), self["remote"])
			if support.wait_for_load(driver, '#parameter-div-land_area input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-land_area input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-land_area input'), self["space"][0])
			if support.wait_for_load(driver, '#parameter-div-house_area input', 1):
				support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-house_area input'))
				support.send_text(driver.find_element_by_css_selector('#parameter-div-house_area input'), self["space"][0])
		if category == 5:
			support.move_mouse(driver, driver.find_element_by_css_selector('#parameter-div-area input'))
			support.send_text(driver.find_element_by_css_selector('#parameter-div-area input'), self["space"][0])
		#descriptions + personal ------------------------------------------------------------------------
		# support.move_mouse(driver, driver.find_element_by_css_selector('#private-business-div dl dt a'))
		# support.move_mouse(driver, driver.find_element_by_css_selector('#private-business-div dl li:nth-child(2) a'))
		driver.find_element_by_css_selector('#targetid_private_business dt a').click()
		driver.find_element_by_css_selector('#private-business-div dl li:nth-child(2) a').click()
		support.move_mouse(driver, driver.find_element_by_css_selector('#add-description'))
		driver.find_element_by_css_selector('#add-description').send_keys(self["description"] + " z " + str(int(round(time.time() * 1000))))
		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.post_p75}))#------------------------message---------------------------
		#imeges ---------------------------------------------------
		support.move_mouse(driver, driver.find_element_by_css_selector('#show-gallery-html'))
		for idx, val in enumerate(self["img_src"]):
			if support.wait_for_load(driver, "#htmlbutton_" + str(idx + 1) + " input", 1):
				driver.find_element_by_css_selector("#htmlbutton_" + str(idx + 1) + " input").send_keys(self["_id"] + val)
		#locations --------------------------------------------------------------------------
		attempt = 0 
		while attempt < 5:
			try:
				support.move_mouse(driver, driver.find_element_by_css_selector('#mapAddress'))
				driver.find_element_by_css_selector('#mapAddress').clear()
				support.send_text_long(driver.find_element_by_css_selector('#mapAddress'), map_address)
				time.sleep(0.5)
				if loc1 == 1:
					if support.wait_for_load(driver, '#autosuggest-geo-ul li:nth-child(1) > a', 2):
						support.move_mouse(driver, driver.find_element_by_css_selector('#autosuggest-geo-ul li:nth-child(1) > a'))
					else:
						raise Exception(ErrorMessage.location)	
				if loc1 == 0:
					if support.wait_for_load(driver, '#autosuggest-geo-ul li:nth-child(1) > a', 2):
						driver.execute_script('document.getElementById("autosuggest-geo-ul").getElementsByTagName("li")[0].className = "hover"')
						time.sleep(1)
						driver.execute_script('document.getElementById("autosuggest-geo-ul").getElementsByTagName("li")[0].className = "hover"')
						driver.find_element_by_css_selector('#autosuggest-geo-ul li:nth-child(1) > .geo-districts-ul li:nth-child(' + str(loc2 + 1) + ') > a').click()	
					else:
						raise Exception(ErrorMessage.location)
			except:
				attempt += 1
			else: 
				break					
		if attempt >= 5:
			raise Exception(ErrorMessage.location)
		#phone + skype + name ----------------------------------------------------------------------
		support.move_mouse_dc(driver, driver.find_element_by_css_selector('#add-person'))
		support.send_text(driver.find_element_by_css_selector('#add-person'), self["per_name"])	
		support.move_mouse_dc(driver, driver.find_element_by_css_selector('#add-phone'))
		support.send_text(driver.find_element_by_css_selector('#add-phone'), self["per_telephone"])
		support.move_mouse_dc(driver, driver.find_element_by_css_selector('#add-skype'))
		support.send_text(driver.find_element_by_css_selector('#add-skype'), self["skype"])	
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.post_p100})) #------------------------message---------------------------
		#save+screenshot-------------------------------------------------------------
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		time.sleep(2)
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_olx_ua.png')}))
		attempt = 0 
		while attempt < 5:
			try:
				driver.find_element_by_css_selector('#save').click()
				time.sleep(4)
				if not support.wait_for_load(driver, "#addAnotherAd", 20):
					driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
					logout(driver)
					raise Exception(ErrorMessage.wrong)		
				driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
				break
			except:
				attempt += 1
		logout(driver)	
	except NoSuchElementException, InvalidElementStateException:
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		raise Exception(ErrorMessage.change)
	return 0
def find_status(self, login, password, driver, write, id):
	#start	--------------------------------------------------
	try:
		log_in(driver, login, password)
		driver.get('http://olx.ua/myaccount/')
		time.sleep(2)
		urls = ['http://olx.ua/myaccount/moderated/', 'http://olx.ua/myaccount/', 'http://olx.ua/myaccount/waiting/', 'http://olx.ua/myaccount/archive/']
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.stat_p25}))#------------------------message---------------------------		
		href, href_art = find_article(driver, urls, self['title'], self['description'], self)
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.stat_p50}))#------------------------message---------------------------		
		status = 0
		for i in range(len(href)):
			status = Map_olx_status[href[i]]
		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.stat_p75}))#------------------------message---------------------------		
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.stat_p100}))#------------------------message---------------------------		
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_olx_ua.png')}))
	except NoSuchElementException, InvalidElementStateException:
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		raise Exception(ErrorMessage.change)
	return str(status)
def activate_article(self, login, password, driver, write, id):
	#start	--------------------------------------------------
	try:
		log_in(driver, login, password)
		driver.get('http://olx.ua/myaccount/')
		time.sleep(2)
		urls = ['http://olx.ua/myaccount/archive/']
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.activ_p25}))#------------------------message---------------------------		
		href, href_art = find_article(driver, urls, self['title'], self['description'], self)
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.activ_p50}))#------------------------message---------------------------		
		status = 'non active'
		for i in range(len(href)):
			driver.get(href[i])
			time.sleep(2)
			if support.wait_for_load(driver, '#adsTable a[href="' + href_art[i] + '"]', 4):
				ar_id = driver.find_element_by_xpath('//a[@href="' + href_art[i] + '"]/../../../../td[7]//td/a')
				ar_id.click()
				wait_actions(ar_id)
				status = 'active'
		if 	status != 'active':
			raise Exception(ErrorMessage.not_found)	
		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.activ_p75}))#------------------------message---------------------------		
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.activ_p100}))#------------------------message---------------------------		
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_olx_ua.png')}))
	except NoSuchElementException, InvalidElementStateException:
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		raise Exception(ErrorMessage.change)
	return True	
def deactivate_article(self, login, password, driver, write, id):
	#start	--------------------------------------------------
	try:
		log_in(driver, login, password)
		driver.get('http://olx.ua/myaccount/')
		time.sleep(2)
		urls = ['http://olx.ua/myaccount/']
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.deactiv_p25}))#------------------------message---------------------------		
		href, href_art = find_article(driver, urls, self['title'], self['description'], self)
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.deactiv_p50}))#------------------------message---------------------------		
		status = 'non deactive'
		for i in range(len(href)):
			driver.get(href[i])
			time.sleep(2)
			if support.wait_for_load(driver, '#adsTable a[href="' + href_art[i] + '"]', 4):
				ar_id = remove_element(driver, href[i], href_art[i])
				ar_id.click()
				time.sleep(1)
				if driver.find_element_by_css_selector('#reasonInnerHeight').is_displayed():
  					if driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(3)').is_displayed():
  						driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(3) span').click()
  					elif driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(4)').is_displayed():
  						driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(4) span').click()
  				wait_actions(ar_id)
				status = 'deactive'
		if 	status != 'deactive':
			raise Exception(ErrorMessage.not_found)	
		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.deactiv_p75}))#------------------------message---------------------------		
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.deactiv_p100}))#------------------------message---------------------------		
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_olx_ua.png')}))
	except NoSuchElementException, InvalidElementStateException:
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		raise Exception(ErrorMessage.change)
	return True								
def delete_article(self, login, password, driver, write, id):
	#start	--------------------------------------------------
	try:
		log_in(driver, login, password)
		driver.get('http://olx.ua/myaccount/')
		time.sleep(2)
		write.publish("response_" + id, json.dumps({"progress": "25%","message": PostingMessage.del_p25}))#------------------------message---------------------------		
		urls = ['http://olx.ua/myaccount/moderated/', 'http://olx.ua/myaccount/', 'http://olx.ua/myaccount/waiting/', 'http://olx.ua/myaccount/archive/']
		href, href_art = find_article(driver, urls, self['title'], self['description'], self)
		write.publish("response_" + id, json.dumps({"progress": "50%","message": PostingMessage.del_p50}))#------------------------message---------------------------		
		for i in range(len(href)):
			driver.get(href[i])
			time.sleep(2)
			if support.wait_for_load(driver, '#adsTable a[href="' + href_art[i] + '"]', 4):
				ar_id = remove_element(driver, href[i], href_art[i])
				ar_id.click()
				time.sleep(1)
				if driver.find_element_by_css_selector('#reasonInnerHeight').is_displayed():
  					if driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(3)').is_displayed():
  						driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(3) span').click()
  					elif driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(4)').is_displayed():
  						driver.find_element_by_css_selector('#reasonInnerHeight .reasons > label:nth-child(4) span').click()
  				wait_actions(ar_id)
  		write.publish("response_" + id, json.dumps({"progress": "75%","message": PostingMessage.del_p75}))#------------------------message---------------------------		
  		urls = ['http://olx.ua/myaccount/archive/']
  		href, href_art = find_article(driver, urls, self['title'], self['description'], self)
		for i in range(len(href)):
			driver.get(href[i])
			time.sleep(2)
			if support.wait_for_load(driver, '#adsTable a[href="' + href_art[i] + '"]', 4):
				ar_id = remove_element(driver, href[i], href_art[i])
				ar_id.click()
				time.sleep(1)
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.del_p100}))#------------------------message---------------------------		
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		write.publish("response_" + id, json.dumps({"progress": "100%","message": PostingMessage.rander(self["_id"] + 'report_olx_ua.png')}))
		logout(driver)
	except NoSuchElementException, InvalidElementStateException:
		driver.save_screenshot(self["_id"] + 'report_olx_ua.png')
		logout(driver)
		raise Exception(ErrorMessage.change)
	return 0		

def log_in(driver, login, password):
	driver.get('https://ssl.olx.ua/account/')
	time.sleep(2)
	if not support.wait_for_load(driver, "#userEmail", 8):
		raise NoSuchElementException()
	# authorization ------------------------------------------------------
	support.move_mouse(driver, driver.find_element_by_id('userEmail'))
	support.send_text(driver.find_element_by_id('userEmail'), login)
	support.move_mouse(driver, driver.find_element_by_id('userPass'))
	support.send_text(driver.find_element_by_id('userPass'), password)
	support.move_mouse(driver, driver.find_element_by_id("se_userLogin"))
	if not support.wait_for_load(driver, "#topLoginLink > .arrowthindown", 15):
		raise Exception(ErrorMessage.login)

def find_article(driver, urls, title, description, self):
	href, href_art = [], []
	for idx, url in enumerate(urls):
		driver.get(url)
		time.sleep(2)
		elements = []
		if support.wait_for_load(driver, "#adsTable > .tbody > tr", 4):
			elements = driver.find_elements_by_css_selector('#adsTable > .tbody > tr')
		for idx in range(len(elements) / 3):
			try:
				if not support.wait_for_load(driver, '#adsTable > .tbody:nth-child(2) .row-elem:nth-child(' + str(idx * 3 + 1) +') > .td:nth-child(4) > .title > table h3', 8):
					raise Exception(ErrorMessage.load)
				if(driver.find_element_by_css_selector('#adsTable > .tbody:nth-child(2) .row-elem:nth-child(' + str(idx * 3 + 1) +') > .td:nth-child(4) > .title > table h3').get_attribute('title').strip() == title.strip()):
					nth = 1
					if url == 'http://olx.ua/myaccount/moderated/':
						nth = 2
					article_url = driver.find_element_by_css_selector('#adsTable > .tbody:nth-child(2) .row-elem:nth-child(' + str(idx * 3 + 1) +') > .td:nth-child(4) > .title > div a:nth-child(' + str(nth) + ')').get_attribute('href')
					driver.get(article_url)
					time.sleep(2)
					if not support.wait_for_load(driver, "#textContent", 8):
						raise Exception(ErrorMessage.load)
					if compare(driver.find_element_by_css_selector('#textContent > p').text, description):
						href.append(url)
						href_art.append(article_url)
					driver.back()
					time.sleep(2)
			except NoSuchElementException:		
				raise Exception(ErrorMessage.change)
	return href, href_art			
def compare(site_description, bd_description):
	try:
		site_description.strip().index(bd_description.strip())
		return True
	except:
		return False
def logout(driver):
	try:
		driver.get('http://olx.ua/account/logout/')
	except:
		try:
			time.sleep(2)
			Alert(driver).accept()
		except:
			return True	
	return True	
def wait_actions(el):
	times = 0
	while times < 5:
		try:
			el.is_displayed()
		except:
			break
		time.sleep(0.1)
		times += 0.1		