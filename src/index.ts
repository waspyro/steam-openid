import {RelyingParty} from 'openid'

export class ErrorWithContext extends Error {
    constructor(message: string, public context: any) {
        super(message);
    }
}

export default class SteamOpenID {
    readonly returnURL: URL
    private relyingParty: RelyingParty

    constructor(
        returnURL: URL | string,
        private steamOpenidProviderURL = 'https://steamcommunity.com/openid/'
    ) {
        if(typeof returnURL === 'string') returnURL = new URL(returnURL)
        this.returnURL = returnURL
        this.relyingParty = new RelyingParty(returnURL.href, returnURL.origin, true, true, [])
    }

    getAuthURL = (): Promise<string> => new Promise((resolve, reject) => {
        this.relyingParty.authenticate(this.steamOpenidProviderURL, false, (err, authUrl) => {
            if(err) reject(err)
            if(!authUrl) reject(new Error('malformed response, missing "authUrl" param'))
            resolve(authUrl)
        })
    })

    verifyAssertion = (urlString: string): Promise<string> => new Promise((resolve, reject) => {
        this.relyingParty.verifyAssertion(urlString, (err, result) => {
            if(err) reject(err)
            if(!result || !result.authenticated)
                return reject(new ErrorWithContext("Failed to authenticate user", {urlString, result}))
            const match = result.claimedIdentifier?.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/)
            if(!match?.[0] || !match[1])
                reject(new ErrorWithContext('Unable to retrieve steamID from claimed identifier', {urlString, result}))
            return resolve(match[1])
        })
    })

}