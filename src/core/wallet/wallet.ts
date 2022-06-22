//여기 wallet은  검증의 용도
import { Transaction } from '@core/transaction/transaction'
import { unspentTxOut } from '@core/transaction/unspentTxOut'
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

    constructor(_sender: string, _signature: Signature, unspentTxOuts: unspentTxOut[]) {
        this.publickey = _sender
        this.account = Wallet.getAccount(this.publickey)
        this.balance = Wallet.getBalance(this.account, unspentTxOuts)
        this.signature = _signature
    }

    static sendTransaction(_receivedTx: any, unspentTxOuts: unspentTxOut[]) {
        //TODO:완성후 __receivedTx: any부분 수정하기
        //TODO:서명검증

        //공개키,보내는 사람:공개키, 받느사람:계정,보낼금액
        const verify = Wallet.getVerify(_receivedTx)
        if (verify.isError) throw new Error(verify.error)

        console.log(verify.isError) //false

        //TODO:보내는 사람의 지갑정보 최신화 //publicKey
        const myWallet = new this(_receivedTx.sender, _receivedTx.signature, unspentTxOuts)
        //TODO:Balance(잔액)  확인
        if (myWallet.balance < _receivedTx.amount) throw new Error('잔액이 모자랍니다')
        //나의 지갑의 잔액이 보낼양보다 크면 되는거
        //TODO:transaction만드는 과정   createTransacton()
        const myUTXO: unspentTxOut[] = unspentTxOut.getMyUnspentTxOuts(myWallet.account, unspentTxOuts)

        const tx: Transaction = Transaction.creataTransaction(_receivedTx, myUTXO)

        return tx
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

    static getAccount(publicKey: string): string {
        return Buffer.from(publicKey).slice(26).toString()
    }

    //필요한값:account,unspentTxOut[]
    static getBalance(_account: string, _UnspentTxOuts: IUnspentTxOut[]): number {
        //_UnspentTxOuts=node.getUnspentTxOuts()
        return _UnspentTxOuts
            .filter((v) => {
                return v.account === _account
            })
            .reduce((acc, utxo) => {
                return (acc += utxo.amount)
                // acc =acc+ utxo.amount
            }, 0)
    }
}

/***배열 매서드filter(걸러낸다)

이 함수의 인수는 element, index, array
index와 array는 생략이 가능
함수의 테스트를 통과하는 모든 요소를 모아 새로운 배열로 반환한다.
다시 말해서 대상인 배열에서 요소 하나씩 뽑아온 다음에 필터링 콜백함수에 전달해서 결과가 true인 요소들만 모아놓은 배열을 반환해주는 메서드이다.
단, 어떤 요소도 통과하지 못하면 빈 배열을 반환한다.

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log(
        arr.filter((v) => {
            // return v % 5 === 0;
            if (v % 5 === 0) {
                return v;
            }
        }),
    );


/***배열 매서드 reduce(누적한다)

첫 번째 인자로 콜백함수가 들어오고, (생략가능한) 두 번째 인자는 콜백의 첫 호출에서 accumulator값으로 적용될 값입니다.
그럼 2번쨰 인자값을  0으로 정해주면  v=0, k=0번쨰 인덱스값,   1로 정해주면  v=1,  k=0번쨰 인덱스값이 된다
일반적으로 reduce 메서드는 배열 요소들의 평균을 구할 때 많이 쓴다.


const array1 = [20, 35, 1, 98, 46, 5];
array1.reduce((a, b) => return(a += b))   //a=20, b=35
//결과 : 205


(1) a : 20, b : 35
(2) a : 55(20 + 35), b : 1
(3) a : 56(20 + 35 + 1), b : 98
(4) a : 154(20 + 35 + 1 + 98), b : 46
(5) a : 200(20 + 35 + 1 + 98 + 46), b : 5
(6) array1.reduce((a, b) => (a + b)) 에서 return 되는 값 = a + b = 205 
(7) 205 / 6 = 34.166666666666664

---->reduce 메서드의 첫번째 인수인 콜백함수의 a는 누적 값, b 는 현재 값이다.
reduce 를 호출했을 때 return 되는 값은 마지막 최종 누적값이다.



const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log(
        arr.reduce((v, k) => {
            console.log("v =?", v);
            console.log("k =?", k);
            return (v += k); // v = v + k
            // return k;
        }, 0), // default option
    );


***배열 매서드 map(맵핑, 매치해준다)
 배열의 길이를 유지하면서 기존의 배열을 활용한 새로운 배열을 만드는데 유용한 메서드

let arr = [1, 2, 3, 4, 5]
console.log(
    arr.map((v) => {
        return v * 2
    }),
)


*/
