import SteamOpenid from "./index.js";
import {Server as HTTPServer} from "http";
import {parse as parseURL} from 'url'

const PORT = 9090
const returnUrl = 'http://localhost:'+PORT+'/signin/staem'
const steamSignIn = new SteamOpenid(returnUrl)

steamSignIn.getAuthUrl()
  .then(url => console.log('use this url to start signIn process: \n' + url))

const processRequest = req => {
  const url = parseURL(req.url, true)
  if(url.pathname !== steamSignIn.returnUrl.pathname) return
  console.log('user request to your server "returnUrl" with params that you should verify', url.query)

  // you may try to replace your steamid with someone else or change signature to see that verification is failed
  // url.search = url.search.replaceAll('76561000000000', '76561000000001')

  steamSignIn.verifyAssertion(url.search) //you may also just pass a "req" here
    .then(steamID => console.log('verified user SteamID: ' + steamID))
    .catch(err => console.error(err))
}

new HTTPServer()
  .on("request", processRequest)
  .listen(PORT)
