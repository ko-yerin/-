export class TxIn {
    public txOutId: string
    public txOutIndex: number
    //원래 인덱스값인데 코인베이스일때는 여기값이 없다
    //그땐  블럭의 높이(항상다름)로 넣어준다-필요는없지만 강제로 넣었다
    //왜냐 여기값이 없을때 hash했을때 값이 똑같이 나옴
    public signature?: string

    constructor(_txOutId: string, _txOutIndex: number, _signature: string | undefined = undefined) {
        this.txOutId = _txOutId
        this.txOutIndex = _txOutIndex
        this.signature = _signature
    }

    static createTxIns(_receivedTx: any, myUTXO: IUnspentTxOut[]) {
        let sum = 0
        let txins: TxIn[] = []
        for (let i = 0; i < myUTXO.length; i++) {
            //101010있음  ,보낼금액을 19라고 침
            const { txOutId, txOutIndex, amount } = myUTXO[i]
            const item: TxIn = new TxIn(txOutId, txOutIndex, _receivedTx.signature)
            txins.push(item)

            sum += amount
            if (sum >= _receivedTx.amount) return { sum, txins }
        }
        //위랑 같은거
        // for(const utxo of myUTXO){

        // }
        return { sum, txins }
    }
}
