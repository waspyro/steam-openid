# steam-openid

## Example

```ts
import SteamOpenID from './src'
import {Server} from 'http'

let sessionid = 0
const sessions = new Map

async function startSteamOpenIDHTTPServer(port) {
    const baseURL = 'http://localhost:' + port
    const returlURL = baseURL + '/claim'
    const steamSignIn = new SteamOpenID(returlURL)
    const authUrl = await steamSignIn.getAuthURL()

    new Server().on('request', async (req, res) => {
        const url = new URL(req.url, 'http://localhost:9090')
        console.log('>', url.toString())
        switch (url.pathname) {

            case '/': {
                const sessionidMatch = req.headers.cookie.match(/session=(\d+)/)
                const steamid = sessionidMatch && sessions.get(Number(sessionidMatch[1]))
                if(steamid) return res.end(
                    '<p>your verified steamid: ' + steamid +
                    '</p><a href="/logout">logout</a>')
                return res.end(`<a href=/logon>logon</a>`)
            }

            case '/logon': { //user wants to logon, redirecting to auth url steam gave us
                return res.writeHead(302, {
                    Location: authUrl
                }).end()
            }

            case '/claim': { //user returned (redirected) from auth url with url params which we should verify
                const steamid = await steamSignIn.verifyAssertion(url.toString())
                sessions.set(++sessionid, steamid)
                return res.writeHead(302, {
                    Location: '/',
                    'Set-Cookie': 'session=' + sessionid
                }).end()
            }

            case '/logout': {
                const sessionidMatch = req.headers.cookie.match(/session=(\d+)/)
                sessionidMatch && sessions.delete(Number(sessionidMatch[1]))
                return res.writeHead(302, {
                    Location: '/',
                    'Set-Cookie': 'session=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                }).end()
            }

        }
    })
        .listen(port)
        .on('listening', () => console.log(baseURL))
}

startSteamOpenIDHTTPServer(9090)
```