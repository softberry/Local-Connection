const webdriver = require('selenium-webdriver');

// Input capabilities
const capabilities = {
    'browserName': 'IE',
    'browser_version': '8.0',
    'os': 'Windows',
    'os_version': '7',
    'resolution': '1024x768',
    'browserstack.user': 'emresakarya1',
    'browserstack.key': 'CB9bMNeeuhspxLYo9Bqz'
}

const driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

driver.get('http://www.consoler.online/local-connection').then(function () {
    driver.findElement(webdriver.By.name('q'))
        .sendKeys('BrowserStack\n').then(function () {
            driver.getTitle().then(function (title) {
                console.log(title);
                driver.quit();
            });
        });
});