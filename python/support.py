from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
import time, math, numpy as np
def wait_for_load(driver, selector, delay = 3):
	try:
	    WebDriverWait(driver, delay).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
	    return True
	except TimeoutException:
	    return False
def move_mouse(driver, element):
	actions = ActionChains(driver)
	actions.move_to_element(element).click(element).perform()
	#element.click()
def move_mouse_dc(driver, element):
	actions = ActionChains(driver)
	actions.move_to_element(element).double_click(element).perform()
def move(driver, element):
	actions = ActionChains(driver)
	actions.move_to_element(element).perform()	

def send_text(element, text):
	element.send_keys(text)
	# a, sigma = 0.2, 0.07
	# for letter in text:
	# 	delay_time = math.fabs(np.random.normal(a, sigma))
	# 	time.sleep(delay_time)
	# 	element.send_keys(letter)
def send_text_long(element, text):
	# element.send_keys(text)
	a, sigma = 0.2, 0.07
	for letter in text:
		delay_time = math.fabs(np.random.normal(a, sigma))
		time.sleep(delay_time)
		element.send_keys(letter)	