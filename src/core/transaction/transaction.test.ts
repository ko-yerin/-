import { TxIn } from './txin'
import { TxOut } from './txout'
import { Transaction } from './transaction'

describe('Tracsaction생성', () => {
    //코인베이스
    let txin: TxIn
    let txout: TxOut
    let transaction: Transaction

    it('txin 생성해보기', () => {
        txin = new TxIn('', 0)
        //원래 인자가 3개들가야되는데 코인베이스라 input내용이 없어서 서명값이 없음
        //그래서 signature?로 속성이 들어가도되고 안들가도되게
    })

    it('txout 생성해보기', () => {
        txout = new TxOut('e7916d4d449f22bc65eec91ec01e8f98391f6a31', 50)
    })

    it('transaction 생성해보기', () => {
        transaction = new Transaction([txin], [txout]) //여기서 unspentTxOut도 생성되는거
        console.log(transaction)
        const utxo = transaction.createUTXO()
        console.log('utxo', utxo)
    })
})

//npx jest ./src/core/transaction/transaction.test.ts
