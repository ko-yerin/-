import { Block } from '@core/blockchain/block'
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from '@core/config'
import { TxIn } from '@core/transaction/txin'
import { TxOut } from '@core/transaction/txout'
import { Transaction } from '@core/transaction/transaction'
import { unspentTxOut } from '@core/transaction/unspentTxOut'

export class Chain {
    private blockchain: Block[]
    private unspentTxOuts: unspentTxOut[]
    private transactionPool: ITransaction[]

    constructor() {
        this.blockchain = [Block.getGENESIS()]
        this.unspentTxOuts = []
        this.transactionPool = [] //트랜잭션이 생성될떄마다 여기에 차곡차곡쌓임
    }

    public getUnspentTxOuts(): unspentTxOut[] {
        return this.unspentTxOuts
    }
    //                [asdf]
    public appendUTXO(utxo: unspentTxOut[]): void {
        this.unspentTxOuts.push(...utxo) //...으로 펼쳐서 넣으면  배열에서 빠져서 asdf로 들감
    }

    public getChain(): Block[] {
        return this.blockchain
    }

    public getLength(): number {
        return this.blockchain.length
    }

    public getLatestBlock(): Block {
        return this.blockchain[this.blockchain.length - 1]
    }

    public getTransactionPool(): ITransaction[] {
        return this.transactionPool
    }

    public appendTransactionPool(_Transaction: ITransaction): void {
        this.transactionPool.push(_Transaction)
    }

    public miningBlock(_account: string): Failable<Block, string> {
        //TODO:Transaction 만드는 코드를 넣고
        //TODO:addBlock

        const txin: ITxIn = new TxIn('', this.getLatestBlock().height + 1)
        const txout: ITxOut = new TxOut(_account, 50)
        const transaction: Transaction = new Transaction([txin], [txout])
        const utxo = transaction.createUTXO()
        this.appendUTXO(utxo) //마이닝되어야 거래내역이 생기는건데
        //여기서 이코드를 실행하면  마이닝을 시도하면 거래내역이 생김

        return this.addBlock([transaction])
    }

    public addBlock(_data: ITransaction[]): Failable<Block, string> {
        // TODO : 1. 내가 앞으로 생성할 블록의 높이값을 가져올 수 있는가?
        // 현재 높이값 - block interval 햇을때 음수가 나오면, genesisblock 을 보게 만들면 된다.
        // 2. 난이도를 구하기 (difficulty) -> 생성시간이 필요함
        const previousBlock = this.getLatestBlock()
        const adjustmentBlock = this.getAdjustmentBlock() // 높이에 해당하는 block
        const newBlock = Block.generateBlock(previousBlock, _data, adjustmentBlock)
        const isValid = Block.isValidNewBlock(newBlock, previousBlock)

        if (isValid.isError) return { isError: true, error: isValid.error }

        this.blockchain.push(newBlock)
        return { isError: false, value: newBlock }
    }
    //addBlock의 역할은?새로운 블럭을 추가시키는것
    //근데 새로운블럭을 추가시키기위해서는 이전블럭을 가지고와야됨
    //이전블럭을 쉽게 가져오기 위해서 그래서 chain에구현되어있다
    //data값만 넣어주면 알아서다해줬다
    //근데 우리가 data를 스트링으로 넣어놨는데  이젠 트랜잭션을 넣어야됨
    //그래서 addblock전에  마이닝블럭 호출하고 그안에서 addblock호출시키자
    //그런데 마이닝블럭안에서 데이터값(트랜잭션)필요하니까 그거만드는것도 마이닝블럭안에서

    public addToChain(_receivedBlock: Block): Failable<undefined, string> {
        const isValid = Block.isValidNewBlock(_receivedBlock, this.getLatestBlock())
        console.log('fff', _receivedBlock)
        console.log('ggg', this.getLatestBlock())
        if (isValid.isError) {
            console.log('안됨;')
            console.log(isValid.error)
            return { isError: true, error: isValid.error }
        }
        console.log('됨')
        this.blockchain.push(_receivedBlock)
        return { isError: false, value: undefined }
    }

    public isValidChain(_chain: Block[]): Failable<undefined, string> {
        // todo: 제네시스 블럭을 검사하는 코드가 들어간다.
        const genesis = _chain[0]
        // todo: 나머지 체인에 대한 코드부분
        for (let i = 1; i < _chain.length; i++) {
            const newBlock = _chain[i]
            const previousBlock = _chain[i - 1]
            const isValid = Block.isValidNewBlock(newBlock, previousBlock)
            if (isValid.isError) return { isError: true, error: isValid.error }
        }
        return { isError: false, value: undefined }
    }

    updateUTXO(_tx: Transaction): void {
        // const consumedTxOuts = tx.txIns
        // const newUnspentTxOuts = tx.txOuts
        // const unspentTxOuts: unspentTxOut[] = this.getUnspentTxOuts()

        // let newUTXO = unspentTxOuts
        // consumedTxOuts.forEach((txin: TxIn) => {
        //     newUTXO = newUTXO.filter((utxo: unspentTxOut) => {
        //         return txin.txOutId !== utxo.txOutId && txin.txOutIndex !== utxo.txOutIndex
        //     })
        // })
        const unspentTxOuts: unspentTxOut[] = this.getUnspentTxOuts()
        const newUnspentTxOuts = _tx.txOuts.map((txout, index) => {
            return new unspentTxOut(_tx.hash, index, txout.account, txout.amount)
        })

        this.unspentTxOuts = unspentTxOuts
            .filter((utxo: unspentTxOut) => {
                const bool = _tx.txIns.find((txIn: TxIn) => {
                    return utxo.txOutId === txIn.txOutId && utxo.txOutIndex === txIn.txOutIndex
                })
                return !bool //없는건  true, 있는건  false로 반환됨
            })
            .concat(newUnspentTxOuts) //배열매서드

        this.appendTransactionPool(_tx) //트랜잭션풀과 utxo는  밀접한 관련이 있다  왜냐 트랜잭션이 생기면 utxo내용도 바뀌기 때문
    }

    replaceChain(_receivedChain: Block[]): Failable<undefined, string> {
        // 내 체인과 상대체인에 대해 검사
        // 2. 받은체인의 이전해시값 === 내 체인의 해시값
        // 3. 받은체인의 길이가 ===1 (제네시스밖에 없네) return
        // 4. 내 체인이 더 짧다. 다 바꾸자.
        const latestReceivedBlock: Block = _receivedChain[_receivedChain.length - 1]
        const latestBlock: Block = this.getLatestBlock()

        // 1. 받은체인의 최신블록.index < 내체인최신블록.index return
        if (latestReceivedBlock.height === 0) {
            return { isError: true, error: '받은 최신블록이 제네시스 블록입니다.' }
        }
        if (latestReceivedBlock.height <= latestBlock.height) {
            return { isError: true, error: '자신의 블록이 길거나 같습니다.' }
        }
        if (latestReceivedBlock.previousHash === latestBlock.hash) {
            // addToChain()
            return { isError: true, error: '블록이 하나만큼 모자릅니다.' }
        }

        // 체인을 바꿔주는 코드를 작성하면됨.
        this.blockchain = _receivedChain

        return { isError: false, value: undefined }
    }
    /*
        생성기준으로 블럭높이가 -10 구해오기
    */
    public getAdjustmentBlock() {
        // 현재 마지막블럭에서 -10 (DIFFICULTY_ADJUSTMENT_INTERVAL)
        const currentLength = this.getLength()
        const adjustmentBlock: Block =
            this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL
                ? Block.getGENESIS()
                : this.blockchain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL]
        return adjustmentBlock // 높이에 해당하는 블럭
    }
}
