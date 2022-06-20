//여기 wallet은  검증의 용도
import { SHA256 } from 'crypto-js'
import elliptic from 'elliptic'

const ec = new elliptic.ec('secp256k1')

export type Signature = elliptic.ec.Signature
export interface ReceivedTx {
    sender: string
    received: string
    amount: number
    signature: Signature
}

export class Wallet {
    public publickey: string
    public account: string
    public balance: number
    public signature: Signature

    constructor(_sender: string, _signature: Signature) {
        this.publickey = _sender
        this.account = this.getAccount()
        this.balance = 0
        this.signature = _signature
    }

    static sendTransaction(_receivedTx: ReceivedTx) {
        //TODO:서명검증

        //공개키,보내는 사람:공개키, 받느사람:계정,보낼금액
        const verify = Wallet.getVerify(_receivedTx)
        if (verify.isError) throw new Error(verify.error)

        console.log(verify.isError) //false

        //TODO:보내는 사람의 지갑정보 최신화 //publicKey
        const myWallet = new this(_receivedTx.sender, _receivedTx.signature)
        //TODO:balance(잔액)  확인
        //TODO:transaction만드는 과정
    }

    static getVerify(_receivedTx: ReceivedTx): Failable<undefined, string> {
        const { sender, received, amount, signature } = _receivedTx
        const data: any[] = [sender, received, amount]
        const hash: string = SHA256(data.join('')).toString()

        //TODO:타원곡선알고리즘 사용

        const keyPair = ec.keyFromPublic(sender, 'hex')
        const isVerify = keyPair.verify(hash, signature)
        if (!isVerify) return { isError: true, error: '서명이 올바르지 않습니다' }
        return { isError: false, value: undefined }
    }

    getAccount(): string {
        return Buffer.from(this.publickey).slice(26).toString()
    }
}
