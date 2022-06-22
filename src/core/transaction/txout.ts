import { Wallet } from '@core/wallet/wallet'

export class TxOut {
    public account: string
    public amount: number

    constructor(_account: string, _amount: number) {
        this.account = _account
        this.amount = _amount
    }

    //가져와야됨:보내는사람계정 , 받는사람계정,  sum,amount
    static createTxOuts(sum: number, _receivedTx: any): TxOut[] {
        //TODO:_receivedTx  any타입변경

        // _receivedTx.amount//보낼금액
        // _receivedTx.sender//공개키
        // _receivedTx.received//계정

        const { sender, received, amount } = _receivedTx
        const senderAccount: string = Wallet.getAccount(sender)

        /*
        받는사람계정:amount
        보내는사람계정:sum 단  sum-amount 가 0일 경우 보내는 사람을 만들면 안된다
        */

        const receivedTxOut = new TxOut(received, amount)
        const senderTxOut = new TxOut(senderAccount, sum - amount)
        if (senderTxOut.amount <= 0) return [receivedTxOut]

        return [receivedTxOut, senderTxOut]
    }
}
