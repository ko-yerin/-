import { randomBytes } from 'crypto' //node에 내장되어있는  라이브러리
//암호화,복호화 기능을 제공하는 crypto 모듈
//randomBytes() 메소드로 64바이트 길이의 랜덤 문자열을 만들어 사용
import elliptic from 'elliptic' //우리가 깔아준 라이브러리
//타원곡선 알고리즘의 결과를 리턴해주는 라이브러리
import fs from 'fs' //node에 내장되어있는  라이브러리
// 파일 입출력 처리를 할 때 사용(file system 의 약자 )
import path from 'path' //node에 내장되어있는  라이브러리
//폴더와 파일의 경로를 쉽게 조작할 수 있도록 도와주는 모듈
import { SHA256 } from 'crypto-js' //우리가 깔아준 라이브러리
//해시 알고리즘을 사용할 수 있는 라이브러리

//import 다음에 쓰는건  사용할 매서드 이름,  from다음은  사용할 라이브러리 이름

const dir = path.join(__dirname, '../data')
//path.join(경로, .. .): 여러 인자를 넣으면 하나의 경로로 합쳐준다.
//경로도 스트링! , __dirname  이 변수의 타입도 스트링

const ec = new elliptic.ec('secp256k1')

export class Wallet {
    public account: string
    public privateKey: string
    public publicKey: string
    public balance: number

    constructor(_privateKey: string = '') {
        this.privateKey = _privateKey || this.getPrivateKey()
        //여기가 작동한다라는건 객체를 생성했다 ==개인키를 생성했다

        // this.privateKey = this.getPrivateKey()
        this.publicKey = this.getPublicKey()
        this.account = this.getAccount() //계정
        this.balance = 0 //잔액

        Wallet.createWallet(this) //static을 썻기때문에 Wallet으로 한거다. 아님 this로 하면됨
    }

    static createWallet(myWallet: Wallet): void {
        //void:return할 자료가 없는 함수의 타입으로 사용가능
        //return 값이 없기때문에  void로
        const filename = path.join(dir, myWallet.account)
        const filecontent = myWallet.privateKey
        //파일명을  account
        //파일안내용을  privatekey
        fs.writeFileSync(filename, filecontent)
    }

    static getWalletList(): string[] {
        const files: string[] = fs.readdirSync(dir) //dir 디렉토리에 있는 목록들을 가져오는 매서드
        return files
    }

    static getWalletPrivateKey(_account: string) {
        const filepath = path.join(dir, _account)
        const filecontent = fs.readFileSync(filepath) //dir라는 변수에 account값을 합친 file을 가져오는 매서드
        return filecontent.toString()
    }

    static createSign(_obj: any): elliptic.ec.Signature {
        const {
            sender: { account, publicKey },
            received,
            amount,
        } = _obj

        //hash
        const hash: string = SHA256([publicKey, received, amount].join('')).toString()

        //privateKey
        const privateKey: string = Wallet.getWalletPrivateKey(account)

        const keyPair: elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey)
        return keyPair.sign(hash, 'hex') //블록체인 해쉬값이 16진수니까 16진수로 바꿔주려고 hex사용
    }

    public getPrivateKey(): string {
        return randomBytes(32).toString('hex')
    }

    public getPublicKey(): string {
        const keyPair = ec.keyFromPrivate(this.privateKey)
        return keyPair.getPublic().encode('hex', true)
    }

    public getAccount(): string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
    //slice매서드
    //0부터로 세서 26번쨰 index값부터 반환하겠다

    //ex) var a = [1, 2, 3, 4, 5];
    //a.slice(3); 		// index 3번쨰꺼부터 반환  //[4, 5]를 반환한다.

    //a.slice(0, 3);    //index 0번쨰꺼부터 3번째전꺼까지 반환  // [1, 2, 3]을 반환한다.
}
