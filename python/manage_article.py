import sys, json, redis, time
from selenium import webdriver
from manage.controle import post, delete_article, find_status, activate_article, deactivate_article
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

counter = 0
TIMEOUT = 60

def choose_method(str):
	if str == 'add_article':
		return post
	if str == 'delete_article':	
		return delete_article
	if str == 'find_status':	
		return find_status
	if str == 'activate_article':	
		return activate_article	
	if str == 'deactivate_article':	
		return deactivate_article		
	raise Exception('Unknown command')

def choose_response(str, response):
	if str == 'add_article':
		return 'posted'
	if str == 'delete_article':	
		return 'deleted'
	if str == 'find_status':
		return response
	if str == 'activate_article':	
		return 'activate'
	if str == 'deactivate_article':	
		return 'deactivate'			
	return 'Unknown command'

def choose_start(str, title, site):
	if str == 'add_article':
		return 'Posting at ' + site + '. Article: ' + title
	if str == 'delete_article':	
		return 'Deleting at ' + site + '. Article: ' + title
	if str == 'find_status':	
		return 'Finding status at ' + site + '. Article: ' + title
	if str == 'find_status':	
		return 'Finding status at ' + site + '. Article: ' + title
	if str == 'activate_article':	
		return 'Activating at ' + site + '. Article: ' + title	
	if str == 'deactivate_article':	
		return 'Deactivating at ' + site + '. Article: ' + title	
	raise Exception('Unknown command')


# dc = dict(DesiredCapabilities.PHANTOMJS)
# dc["phantomjs.page.settings.userAgent"] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
# driver = webdriver.PhantomJS('/home/ura/WebstormProjects/houserielt/python/phantomjs', service_args=['--ignore-ssl-errors=true', "--ssl-protocol=tlsv1"], desired_capabilities=dc)
# driver = webdriver.Chrome('/usr/lib/chromium-browser/chromedriver')
driver = webdriver.Chrome('/home/ura/WebstormProjects/houserielt/python/chromedriver')
driver.set_window_size(1800, 1000)
driver.set_page_load_timeout(20)
try:
	r = redis.StrictRedis(host='localhost', port=6379)
	read = r.pubsub(ignore_subscribe_messages=True)

	write = redis.StrictRedis(host='localhost', port=6380) 

	id = sys.argv[1]

	read.subscribe('commands_' + id)
	write.publish("response_" + id, "start at " + id)

	while True:
		counter += 1
		message = read.get_message()
		if message:
			counter = 0
			try: 
				input = json.loads(message['data'])
			except: 
				write.publish("response_" + id, message['data'])
				break
			if input['command'] == 'end':
				write.publish("response", "end")
				break
			if input['command'] != 'end':
				errors = False
				response = 0
				try:
					try:
						write.publish("response_" + id, json.dumps({"start": choose_start(input['command'], input['data']['article']['title'], input['data']['site'])}))
						response = choose_method(input['command'])(input['data'], driver, write, id)
					except Exception as e:
						errors = True
						if len(e.args[0]) < 5:
							raise Exception()
						write.publish("response_" + id, json.dumps({"result": e.args[0]}))	
				except:
					errors = True
					write.publish("response_" + id, json.dumps({"result": "Unexpected error"}))
				if not errors:	
					write.publish("response_" + id, json.dumps({"result": choose_response(input['command'], response)}))
		if counter > TIMEOUT * 10:
			write.publish("response_" + id, json.dumps({"result": "TIMEOUT"}))
			break		
		time.sleep(0.1)		
except:
	driver.quit()
	exit(1)
driver.quit()
exit(0)

	