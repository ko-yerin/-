// 비트코인
interface ITxIn {
    txOutId: string
    txOutIndex: number
    signature?: any //?를 써주면  signature 속성을 사용해도 되고 안해도된다
}
interface ITxOut {
    address: string
    amount: number //거래양
}
interface ITransaction {
    hash: string
    txins: []
    txouts: []
}
