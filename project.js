
const webdriver = require("selenium-webdriver"),
    driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build(),
    until = require("selenium-webdriver/lib/until"),
    By = webdriver.By,
    config = require('./config.json'),
    login = config["login"],
    password = config["password"],
    url = config["channel_url"],
    min_time = Number(config["min_time"]),
    max_time = Number(config["max_time"]),
    minute = 60 * 1000,
    need = Number(config["count"]),
    blackList = config["blackList"].split(","),
    sleep_time = Number(config["sleep_time"]) * 1000,
    sleep_time_short = Number(config["sleep_time_short"]) * 1000;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function pass_gen(len) {
    const chars = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ';
    let str = '';
    for (let i = 0; i < len; i++) {
        const pos = Math.floor(Math.random() * chars.length);
        str += chars.substring(pos, pos + 1);
    }
    return str;
}

async function login_(login, password) {
    await driver.get("https://www.mql5.com/en/auth_login");
    await driver.findElement(By.className('qa-login')).sendKeys(login);
    await sleep(sleep_time);
    await driver.findElement(By.className('qa-password')).sendKeys(password);
    await sleep(sleep_time);
    await driver.findElement(By.className('qa-submit')).click();
    await sleep(sleep_time);
}

async function add_to_channel(url) {
    //переход на канал
    await driver.get(url);
    await sleep(sleep_time);
    //нажатие на канал
    let button = await driver.wait(until.elementLocated(By.className('chat-window-header__button-icon')), 20000);
    await button.click();
    await sleep(sleep_time_short);
    //изменение пользователь канала
    button = await driver.wait(until.elementLocated(By.className('qa-edit-members')), 20000);
    await button.click();
    await sleep(sleep_time_short);
    //добавить людей
    button = await driver.wait(until.elementLocated(By.className('member-block')), 20000);
    console.log((await driver.findElements(By.className('member-block'))).length, "Пользователей перед началом добавления");
    button = await driver.wait(until.elementLocated(By.className('qa-add-members')), 20000);
    await button.click();
    await sleep(sleep_time_short);
    button = await driver.wait(until.elementLocated(By.className('qa-dialog-ok')), 20000);
    await sleep(200);
    //выбор всех пользователей
    await add_all();
    right = await driver.findElement(By.className('form-members-add__right-part'));
    members_r = await right.findElements(By.className('member-block'));
    //добавление пользователей
    await sleep(sleep_time_short);
    button = await driver.wait(until.elementLocated(By.className('qa-dialog-ok')), 20000);
    await button.click();
    await sleep(500);
    button = await driver.wait(until.elementLocated(By.className('member-block')), 20000);
    console.log((await driver.findElements(By.className('member-block'))).length, "Пользователей после добавления");
}

//выбор одного пользователя
async function add_all() {
    for (let i = 0; i < need; i++) {
        await driver.findElement(By.className('input')).clear();
        const inputElement = await driver.findElement(By.className('input'));
        await inputElement.sendKeys(pass_gen(2));
        await sleep(5000);
        
        const left = await driver.findElement(By.className('form-members-add__left-part'));
        const memberBlocks = await left.findElements(By.className('member-block'));

        for (let j = 0; j < memberBlocks.length; j++) {
            const linkElement = await memberBlocks[j].findElement(By.tagName('a'));
            const profileLink = await linkElement.getAttribute('href');
            const usernameInProfileLink = profileLink.split('/').pop();

            if (blackList.includes(usernameInProfileLink)) {
                console.log(`Пользователь ${usernameInProfileLink} находится в черном списке.`);
                continue; // Пропускаем текущего пользователя и переходим к следующему блоку
            }

            await linkElement.click();
            await sleep(sleep_time_short);
            break; // Переходим к следующей итерации цикла
        }
    }
}

async function main() {
    while (true) {
        console.log("Начало добавления", new Date());
        await add_to_channel(url);
        console.log("Закончил добавление", new Date());
        await sleep(Math.random() * (max_time - min_time) * minute + min_time * minute);
    }
}

login_(login, password).then(() => {
    setTimeout(() => main(), 2000);
});
