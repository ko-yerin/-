import { randomBytes } from 'crypto'
import elliptic from 'elliptic'
import fs from 'fs' //file system 의 약자
import path from 'path'

const dir = path.join(__dirname, '../data') //__dirname이건 머지??

const ec = new elliptic.ec('secp256k1')

export class Wallet {
    public account: string
    public privateKey: string
    public publicKey: string
    public balance: number

    constructor(_privateKey: string = '') {
        this.privateKey = _privateKey || this.getPrivateKey()
        //여기가 작동한다라는건 객체를 생성했다 ==개인키를 생성했다

        // this.privateKey = this.getPrivateKey()
        this.publicKey = this.getPublicKey()
        this.account = this.getAccount()
        this.balance = 0 //잔액

        Wallet.createWallet(this) //static을 썻기때문에 Wallet으로 한거다. 아님 this로 하면됨
    }

    static createWallet(myWallet: Wallet): void {
        //return 값이 없기때문에  void로
        const filename = path.join(dir, myWallet.account)
        const filecontent = myWallet.privateKey
        //파일명을  account
        //파일안내용을  privatekey
        fs.writeFileSync(filename, filecontent)
    }

    static getWalletList(): string[] {
        const files: string[] = fs.readdirSync(dir) //dir 디렉토리에 있는 목록들을 가져오는 매서드
        return files
    }

    static getWalletPrivateKey(_account: string) {
        const filepath = path.join(dir, _account)
        const filecontent = fs.readFileSync(filepath) //dir라는 변수에 account값을 합친 file을 가져오는 매서드
        return filecontent.toString()
    }

    public getPrivateKey(): string {
        return randomBytes(32).toString('hex')
    }

    public getPublicKey(): string {
        const keyPair = ec.keyFromPrivate(this.privateKey)
        return keyPair.getPublic().encode('hex', true)
    }

    public getAccount(): string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
}
