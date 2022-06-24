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

    public updateTransactionPool(_newBlock: IBlock): void {
        //상태만 변하는 코드라 리턴값은 없어서 :void
        let txPool: ITransaction[] = this.getTransactionPool()
        _newBlock.data.forEach((tx: ITransaction) => {
            txPool = txPool.filter((txp) => {
                txp.hash !== tx.hash
            })
        })

        this.transactionPool = txPool

        // for (const tx of txPool) {
        //     for (const txin of tx.txIns) {
        //         const foundTxIn = this.unspentTxOuts.find((utxo: unspentTxOut) => {
        //             return utxo.txOutId === txin.txOutId && utxo.txOutIndex === txin.txOutIndex
        //         })

        //         if (!foundTxIn) {
        //             this.transactionPool = this.transactionPool.filter((_tx) => {
        //                 return JSON.stringify(_tx) !== JSON.stringify(tx)
        //             })
        //             break
        //         }
        //     }
        // }

        // for (const tx of txPool) {}

        //위코드와 같은 근데 아래는 중간에 멈출수 없고 위는 멈출수 있따
        // txPool.forEach(tx=>{
        // })
    }

    public miningBlock(_account: string): Failable<Block, string> {
        //TODO:Transaction 만드는 코드를 넣고
        //TODO:addBlock

        const txin: ITxIn = new TxIn('', this.getLatestBlock().height + 1)
        const txout: ITxOut = new TxOut(_account, 50)
        const transaction: Transaction = new Transaction([txin], [txout]) //여기까지가 코인베이스 내용
        // const utxo = transaction.createUTXO()
        // this.appendUTXO(utxo) //마이닝되어야 거래내역이 생기는건데
        // //여기서 이코드를 실행하면  마이닝을 시도하면 거래내역이 생김
        // // console.log('마이닝 하고 T-pool', ...this.getTransactionPool())
        return this.addBlock([transaction, ...this.getTransactionPool()]) //이코드에서 블럭에 거래내역을 넣어서 마이닝하는?
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

        newBlock.data.forEach((_tx: ITransaction) => {
            this.updateUTXO(_tx)
        })

        this.updateTransactionPool(newBlock)

        //block.data.transactions  블럭안에 데이터안에 트랜잭션내용들과
        //transactionpool  내가 가지고 있는 트랜잭션풀과 똑같은 것들을 뺴야된다 즉 트랜잭션 풀의 내용을 최신화해야된다
        //이게 조금 어려움 이걸 처리하는 매서드를 updateTransactionPool()이라고 하겠다
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
        // console.log('fff', _receivedBlock)
        // console.log('ggg', this.getLatestBlock())
        if (isValid.isError) {
            // console.log('안됨;')
            // console.log(isValid.error)
            return { isError: true, error: isValid.error }
        }
        // console.log('됨')
        this.blockchain.push(_receivedBlock)

        _receivedBlock.data.forEach((tx) => {
            this.updateUTXO(tx)
        })
        this.updateTransactionPool(_receivedBlock)
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

    updateUTXO(_tx: ITransaction): void {
        // const consumedTxOuts = tx.txIns
        // const newUnspentTxOuts = tx.txOuts
        // const unspentTxOuts: unspentTxOut[] = this.getUnspentTxOuts()

        // let newUTXO = unspentTxOuts
        // consumedTxOuts.forEach((txin: TxIn) => {
        //     newUTXO = newUTXO.filter((utxo: unspentTxOut) => {
        //         return txin.txOutId !== utxo.txOutId && txin.txOutIndex !== utxo.txOutIndex
        //     })
        // })
        const latestUTXO: unspentTxOut[] = this.getUnspentTxOuts() //가장최근까지의 UTXO모음(30,20이 안들가고 50도아직안쓴)
        const newUnspentTxOuts = _tx.txOuts.map((txout, index) => {
            //거래로인해 발생한 새로운 UTXO(30,20)
            return new unspentTxOut(_tx.hash, index, txout.account, txout.amount)
        })

        const tmp = latestUTXO //이제 50을뺴고 30,20을 넣어주어야된다
            .filter((utxo: unspentTxOut) => {
                const isSameUTXO = _tx.txIns.find((txIn: TxIn) => {
                    return utxo.txOutId === txIn.txOutId && utxo.txOutIndex === txIn.txOutIndex
                }) //utxo에있는  id, index/txin에 있는 id,index가 같은건 utxo에있는게 사용되었기때문에
                //UTXO에서 삭제되어야됨
                //그래서 여기코드에서 같은걸 찾음 즉 50
                //그걸  isSameUTXO변수로 지정해줌
                return !isSameUTXO
                //그거와 반대되는값(50을 뺀나머지값)을 필터로 걸러서 다시 배열로 지정
            })
            .concat(newUnspentTxOuts) //배열매서드//그값에서 concat매서드를 사용해서 원래배열에
        //newUnspentTxOuts 변수로 정한 배열을 합쳐주었다  즉  20.30을 넣어주었다

        //*173번쨰 코드를 보면 전부찾아야 되는데 find로 찾으면  만족하는 맨 첫번쨰만 찾아지는 데 어쩌냐
        //filter로 게속 전부찾을 떄까지 돌리니까 상관없다

        let unspentTmp: unspentTxOut[] = []
        const result = tmp.reduce((acc, utxo) => {
            const find = acc.find(({ txOutId, txOutIndex }) => {
                return txOutId === utxo.txOutId && txOutIndex === utxo.txOutIndex
            })
            if (!find) acc.push(utxo) //못찾았을때 즉 값이 undefinde일때 트루
            return acc
        }, unspentTmp)

        this.unspentTxOuts = result //위에 새로운 거래내역이 생기고 utxo가 생기고 그 거래내역이  transaction pool에 추가됨
        //트랜잭션풀과 utxo는  밀접한 관련이 있다  왜냐 트랜잭션이 생기면 utxo내용도 바뀌기 때문
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

        //UTXO

        //POOL
        this.blockchain.forEach((_block: IBlock) => {
            this.updateTransactionPool(_block)
            _block.data.forEach((_tx) => {
                this.updateUTXO(_tx)
            })
        })

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
