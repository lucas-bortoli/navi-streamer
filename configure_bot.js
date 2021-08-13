const puppeteer = require('puppeteer-core')
const fs = require('fs/promises')

const main = async () => {
    // reset the browser user data directory
    console.log('Deleting user data directory...')
    await fs.rm('usrdata', { recursive: true, force: true })

    // start browser
    const browser = await puppeteer.launch({
        userDataDir: './usrdata',
        executablePath: '/usr/bin/google-chrome',
        headless: false
    })
    
    // login routine
    const loginPage = await browser.newPage()
    await loginPage.goto('https://discord.com/login')
    console.log('Login page reached. Waiting for manual login by user.')
    await loginPage.waitForFunction('location.pathname === \'/channels/@me\'', { timeout: 0, polling: 1000 })
    console.log('Login finished.')

    await browser.close()
}

main()