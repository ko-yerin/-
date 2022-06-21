import { Sign } from 'crypto'
import { SHA256 } from 'crypto-js'
import { TxIn } from './txin'
import { TxOut } from './txout'
import { unspentTxOut } from './unspentTxOut'

export class Transaction {
    public hash: string
    public txIns: TxIn[]
    public txOuts: TxOut[]

    constructor(_txIns: TxIn[], _txOuts: TxOut[]) {
        this.txIns = _txIns
        this.txOuts = _txOuts
        this.hash = this.createTransactionHash() //transaction 고유값(txIns,txOuts  value값을  다긁어와서 스트링으로 연결시켜서 hash화 시켜서 만듬)
    }

    createTransactionHash(): string {
        const txoutContent: string = this.txOuts.map((v) => Object.values(v).join('')).join('')
        const txinContent: string = this.txIns.map((v) => Object.values(v).join('')).join('')
        console.log('tx:', txoutContent, txinContent)
        return SHA256(txoutContent + txinContent).toString()

        /*txOuts안에는 이렇게 되있을거
        [
        {
        account:'adasfdasf',
        amount:50        
        }{
        account:'동훈',
        amount:25 
        }
        ]


        * adasfdasf50동훈25   --->이렇게 만들고싶은거
        */
    }

    createUTXO(): unspentTxOut[] {
        // public txOutId: string //14250b0a74ddc2e1d94b3cea94c5507791cba5887b9d5e5d5e982d2c9637640a
        // public txOutIndex: number //0
        // public account: string //e7916d4d449f22bc65eec91ec01e8f98391f6a31
        // public amount: number //50

        return this.txOuts.map((txout: TxOut, index: number) => {
            return new unspentTxOut(this.hash, index, txout.account, txout.amount)
        })
    }
}
