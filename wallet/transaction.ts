//transaction에는 하나의 input과 하나의 output이 있다

// interface ITxIn {
//     // 입금내역, 사용할금액
//     txOutId: string //그전 transaction hash값
//     txOutIndex: number //그전 index번호
//     signature?: any //?를 써주면  signature 속성을 사용해도 되고 안해도된다
// }

// interface ITxOut {
//     //출금내역, 잔액
//     account: string //받는 사람의 주소(인구)
//     amount: number //받을양(1000)
// }

// interface ITransaction {
//     hash: string
//     txins: ITxIn[]
//     txouts: ITxOut[]
//
//     //hash는  transaction의 고유한 번호
// }

// interface UnspentTxouts {
//     //미사용내역
//     txOutId: string     //현재 transaction hash값  0001
//     txOutIndex: number // index0은  인구,  index1은  이동훈인데 그중 미사용인덱스  1
//     account: string
//     amount: number
// }

//ex)
//tx0001
// 50 btc ------------------인구 1 btc(사용), 이동훈 49btc(미사용)
