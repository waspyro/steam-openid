import openid from 'openid'
import {URL} from 'url'

export default class SteamOpenid {
  constructor(returnURL) {
    this.returnUrl = new URL(returnURL)
    if(this.returnUrl.protocol !== 'https:' && this.returnUrl.protocol !== 'http:')
      throw new Error('returnURL missing or have wrong protocol part (http or https is required)')
    this.relyingParty = new openid.RelyingParty(this.returnUrl.href, this.returnUrl.origin, true, true, [])
  }

  getAuthUrl() {
    return new Promise((resolve, reject) => {
      this.relyingParty.authenticate("https://steamcommunity.com/openid", false, (error, authUrl) => {
        if (error) return reject(error)
        if (!authUrl) return reject("Authentication failed")
        resolve(authUrl);
      })
    })
  }

  verifyAssertion(reqOrParams) {
    return new Promise((resolve, reject) => {
      this.relyingParty.verifyAssertion(reqOrParams, (error, result) => {
        if (error) return reject(error?.message ?? error)
        if (!result || !result.authenticated) return reject("Failed to authenticate user:\n")
        const match = result.claimedIdentifier.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/)
        if(!match?.[0] || !match[1]) reject('Failed to authenticate user:\n' + JSON.stringify(result))
        return resolve(match[1])
      });
    });
  }

}