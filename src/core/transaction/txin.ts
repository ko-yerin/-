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
}
