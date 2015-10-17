import sys
import support
import time, math, numpy as np
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
driver = webdriver.Chrome('/home/ura/WebstormProjects/houserielt/python/chromedriver')
# driver = webdriver.PhantomJS('/home/valentin/phantomjs-1.9.8/bin/phantomjs', service_args=['--ignore-ssl-errors=true'])	
driver.set_window_size(1800, 1000)
def test_olx(login, password, driver):
	driver.get('https://ssl.olx.ua/account/') 
	if not support.wait_for_load(driver, "#userEmail", 3):
		return "Nope"
	support.move_mouse(driver, driver.find_element_by_id('userEmail'))
	support.send_text(driver.find_element_by_id('userEmail'), login)
	support.move_mouse(driver, driver.find_element_by_id('userPass'))
	support.send_text(driver.find_element_by_id('userPass'), password)
	support.move_mouse(driver, driver.find_element_by_id("se_userLogin"))
	if not support.wait_for_load(driver, "#topLoginLink > .arrowthindown", 15):
		return "Nope"
	return "Yep"
def test_mir(login, password, driver):
	driver.get('http://mirkvartir.ua/users/login')
	if not support.wait_for_load(driver, "#user_login", 5):
		return "Nope"
	# authorization ------------------------------------------------------
	support.move_mouse(driver, driver.find_element_by_id('user_login'))
	support.send_text(driver.find_element_by_id('user_login'), login)
	support.move_mouse(driver, driver.find_element_by_id('user_password'))
	support.send_text(driver.find_element_by_id('user_password'), password)
	support.move_mouse(driver, driver.find_element_by_id("submit"))
	time.sleep(2)
	if not support.wait_for_load(driver, "#add_notice", 15):
		return "Nope"
	return "Yep"	
	
def test_fn(login, password, driver):
	driver.get("http://fn.ua/user/")
	if not support.wait_for_load(driver, "#uemail", 3):
		return "Nope"
	support.move_mouse(driver, driver.find_element_by_id('uemail'))
	support.send_text(driver.find_element_by_id('uemail'), login)
	support.move_mouse(driver, driver.find_element_by_id('upass'))
	support.send_text(driver.find_element_by_id('upass'), password)
	support.move_mouse(driver, driver.find_element_by_name("go_auth"))
	if not support.wait_for_load(driver, "a[href='/newad/']", 15):
		return "Nope"
	return "Yep"

def test_address(auth, passw, driver):
	COUNTER_TIMES = 5
	SLEEP_TIME = 1	
	
	driver.get("http://address.ua/")
	try:
		WebDriverWait(driver, 20).until( EC.presence_of_element_located((By.CSS_SELECTOR, "a.userRelatedLink")) )
	except:		
		driver.get("http://address.ua/")

	count = 0	
	while True:	
		try:
			driver.execute_script("ShowLoginForm('logindiv');")
			WebDriverWait(driver, 20).until( EC.presence_of_element_located((By.CSS_SELECTOR, "input#UserEmail")) )
			break
		except:
			time.sleep(SLEEP_TIME)
			count+=1
			if count == COUNTER_TIMES:
				return "Nope"

	driver.find_element_by_css_selector('input#UserEmail').send_keys(auth)
	driver.find_element_by_css_selector('input#Password').send_keys(passw)
	driver.find_element_by_css_selector("input[type='image']").click()
	if not support.wait_for_load(driver, ".userMenu img", 15):
		return "Nope"
	return "Yep"

def test_aviso(login, password, driver):
	COUNTER_TIMES = 5
	SLEEP_TIME = 1	
	
	driver.get('http://online.aviso.ua/account2/index.php')
	if not support.wait_for_load(driver, "#inputEmail", 10):
		return "Nope"
	support.move_mouse(driver, driver.find_element_by_id('inputEmail'))
	support.send_text(driver.find_element_by_id('inputEmail'), login)
	support.move_mouse(driver, driver.find_element_by_id('inputPassword'))
	support.send_text(driver.find_element_by_id('inputPassword'), password)
	support.move_mouse(driver, driver.find_element_by_css_selector(".controls button"))
	if not support.wait_for_load(driver, ".span8 li:nth-child(3) a", 40):
		return "Nope"
	return "Yep"

if sys.argv[3] == "olx.ua":
	print test_olx(sys.argv[1], sys.argv[2], driver)
elif sys.argv[3] == "fn.ua":
	print test_fn(sys.argv[1], sys.argv[2], driver)
elif sys.argv[3] == "address.ua":
	print test_address(sys.argv[1], sys.argv[2], driver)
elif sys.argv[3] == "mirkvartir.ua":
	print test_mir(sys.argv[1], sys.argv[2], driver)
elif sys.argv[3] == "aviso.ua":
	print test_aviso(sys.argv[1], sys.argv[2], driver)
else: 
	print "Nope: ", sys.argv	
driver.quit()