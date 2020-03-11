const puppeteer = require('puppeteer');

async function scrapeVkPage(url) {

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('//*[@id="main"]/section/header/h1/span')
    const nameText = await el.getProperty('textContent');
    const name = await nameText.jsonValue();

    const [el1] = await page.$x('//*[@id="main"]/section/aside[1]/div[2]/div[1]/div[2]/div/div[1]/div/span')
    const priceText = await el1.getProperty('textContent');
    const price = await priceText.jsonValue();

    const [el2] = await page.$x('//*[@id="main"]/section/aside[1]/div[1]/div/div/div/div/ul/li[1]/span/img');
    const src = await el2.getProperty('src');
    const image = await src.jsonValue();

    

    browser.close()


    

    return {name,price, image, url}
}

module.exports = {
    scrapeVkPage
}

