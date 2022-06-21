// 비트코인

/*컴터입장
a:인구(받음)
b:동훈(보냄)
누군가에게 input은  누군가에겐  output
나의 잔액이 6처넌인데  6처넌을 보낼거면 나에게는  처넌과 5처넌이 한개의 배열에 담겨서 보내지고
받는사람은 6000으로 받음
근데 3처넌을 보내려고하면  5처넌을 보내고 2처넌이 다시들어와서 잔액은 3처넌

컴터입장에서 생각하기 보내는건  output   받는건 input
a가  b한테  0.4코인을 보내야되서 1을 보내면  1은  인풋  b한테주는  0.4  a한테 돌려주는  0.6는 아웃풋  
*/
interface ITxIn {
    // 입금내역, 사용할금액
    txOutId: string //그전 transaction hash값
    txOutIndex: number //그전 index번호
    signature?: any //?를 써주면  signature 속성을 사용해도 되고 안해도된다
}

interface ITxOut {
    //출금내역, 잔액
    account: string //받는 사람의 주소(인구)
    amount: number //받을양(1000)
}

interface ITransaction {
    hash: string
    txins: ITxIn[]
    txouts: ITxOut[]
    //transaction에는 하나의 input과 하나의 output이 있다
    //hash는  transaction의 고유한 번호
}

interface UspentTxouts {
    //미사용내역
    txOutId: string //현재 transaction hash값  0001
    txOutIndex: number // index0은  인구,  index1은  이동훈인데 그중 미사용인덱스  1
    account: string
    amount: number
}
//tx0001
// 50 btc ------------------인구 1 btc(사용), 이동훈 49btc(미사용)
