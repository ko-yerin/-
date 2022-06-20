\*\*npm run dev:ts index.ts

# TypeScript

런타임이 없다==실행할수있는 환경, 실행시켜줄수있는 실행기
typescript는 컴퓨터가 알아먹을수 있는 언어는 아니다
작성후 번들링을 통해 js언어로 바꿔준후 브라우저나 nodejs환경에서 실행해줘야된다

-   npm init -y
-   npm install -D typescript ts-node @types/node(Node.js에서 typescript를 사용하기 위해 필요한 것)

-   npx tsc index.ts(ts를 js로 번들링해주는 명령어)

번들/빌드하기너무 기찬다 ..

-   npx ts-node 파일명 (배포할떄는 사용하면안되고 개발테스트할때만사용)
    (Typescript는 코드작성을 마친후, javascript로 변환(컴파일)되는데,
    Node.js에서는 javascript만 사용하므로, 변환 => 실행해야 하는 번거로움이 있다.
    ts-node는, 이 변환 => 실행 작업을 한번에 해준다.)
    터미널에서 바로찍어볼수있다

-   tsconfig.json생성
    ( 타입스크립트를 작성할 때 어떤 규칙을 설정할 것인지 적는 문서 )

```json
{
    "compilerOptions": {
        "outDir": "./dist/", //밑에index.js바로생기는게 싫어서 여기에 따로 생성되게 해주는 속성( 해당 디렉토리로 결과 구조를 보냅니다. )
        "esModuleInterop": true, //import문법을 사용할수있게 해주는 속성    import React from 'react'
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "strict": true, // /* 모든 엄격한 타입-체킹 옵션 활성화 여부 */
        "baseUrl": ".", //  /* non-absolute한 모듈 이름을 처리할 기준 디렉토리 */
        "typeRoots": ["./node_modules/@types", "./@types"], //typeRoots를 지정하면 typeRoots 아래에 있는 패키지만 포함
        "paths": {
            "@core/*": ["src/core/*"], //core안에있는 경로를  현재위치서부터가아닌  src디렉토리안의 core디렉토리부터 시작(../../ 를  최소화할수있다)
            "*": ["@types/*"] //core를 제외한 모든경로를  @type에서 시작
        }
    }
}
```

-   npx tsc --build 모든ts파일을 위설정을 적용해서 js언어로 번들링해주는 명령어

//경로쓴거 되나해보쟈

**index.ts**

```typescript
import { a } from '@core/utils/utils.ts'
```

**utils.ts**

```typescript
export const a = 10
```

-   npm install -D tsconfig-paths
    (tsconfig.json에서 paths설정을 써주기 위한 명령어)

-   npx ts-node -r tsconfig-paths/register [파일명]
    (경로에 별칭이 사용된 ts파일을 실행할 수 있다.)

매번치기 기찬으니
package.json에 설정해두기
"dev:ts":"ts-node -r tsconfig-paths/register"
(npm run dev:ts)

`외부라이브러리가져올때 개빡침`

-   npm i --save-dev @types/express //큰것들은 이거설치

//작은것들은 머해줄지 안떠서 @types디렉토리에 hex-to-binary 처럼 별칭 설정

-   eslint
    ->배열의 반복문을 돌릴 때 일반 for문을 돌릴 수도 있지만, forEach, map 등 Array 내장 함수를 사용할 수도 있다.

이처럼 여러 방식의 코드 작성법이 있는데, 이러한 방식을 일관성 있는 방식으로 구현할 수 있도록 잡아주는 것이 eslint가 하는 역할

-   prettier

-> prettier는 eslint처럼 '코드 구현 방식'이 아닌, 줄 바꿈, 공백, 들여 쓰기 등 에디터에서 '텍스트'를 일관되게 작성되도록 도와주는 것이다.

-   npm install -D eslint prettier eslint-plugin-prettier eslint-config-prettier

# .eslintrc 파일생성

# .prettierrc 파일생성

# .eslintrc

```json
{
    "extends": ["plugin:prettier/reccommend"]
}
```

# .prettierrc

```json
{
    "printWidth": 120,
    "tabWdith": 4,
    "singleQuote": true,
    "trailingComma": "all",
    "semi": false
}
```

설정들가는법
Ctrl + ,

객체지향적
작은것부터 만들면서 큰거를 만들기
근데 테스트가 힘들다
테스트코드를 작성하는 프레임워크를 설치하려고함

javascript ->jest
typescript -> jest

-   npm install -D ts-jest @types/jest babel -core
-   npm isntall -D @babel/preset-typescript @babel/preset-env

**babel.config.js**
(node환경에서 typescript언어를 읽을수 있게 도와주는 아이)

```js
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: { node: 'current' },
            },
        ],
        '@babel/preset-typescript',
    ],
}
```

**jest.config.ts**

```ts
import type { Config } from '@jest/types'
const config: Config.InitialOptions = {
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['<rootDir>/**/*.test.(js|ts)'],
    moduleNameMapper: {
        //별칭
    },
    testEnvironment: 'node',
    verbose: true,
    preset: 'ts-jest',
}

export default config

//터미널에 npx jest쓰면  실행됨
```

-   마이닝

마이닝을 하기위해서:
블럭이 생성되는 평균시간을 구해야됨
평균적으로 블럭을 생성할때 10분 정도 걸리게 하고싶다
평균시간을 구하는 블럭갯수를 10개로 하겠다
그럼 블럭을 담을수있는공간필요

#작업순서 ##목적은 마이닝구현
->마이닝을 구현하려면 난이도가 필요하고 난이도를 구현하려면 체인필요

1.체인구현 2.난이도 구현 3.마이닝 구현

해쉬값은 16진수로 구성되어있다(64글자)
16진수를 2진수로 바꾼다면 1개의글자를 4글자로 치환할수있다 (64\*4 글자)

16진수는 2진수(0,1)랑 친구다

16진수 1글자 4 bit
16진수 2글자 8 bit

8bit=1byte

왜16진수를 2진수로 바꾸려고 하는가
작업증명중 pow는 hash값을 통해서
앞에있는 자릿수0이 몇개들어갔는가를 찾는거

difficulty=4 라면
hash값으로 변환했을때  
0이 앞에 4개있는걸 찾는거
0000

첫번쨰 순서는 hash에서 2진수로 바꿀줄 알아야됨

core

> blockchain

    -block
    -chain

> serve

    -http
    -websocket

## 지갑

-   비트코인과 같은 암호화폐를 보관하거나 주고 받을 수 있도록 만들어진 소프트웨어

*   공개키, 개인키
    개인키(계좌의 비밀번호)
    공개키(은행들에서 암묵적으로쓰는 코드분류번호)
    이 개인키를 가지고 특정알고리즘(타원곡선 암호 알고리즘)을 사용하여 공개키라는 걸 만든다
    생성된 공개키를 가지고 다시한번 해쉬함수(=임의의 길이를 가진 값을 고정된 길이의 문자로 만들어주는 역할)를 이용해서 최종적으로 지갑주소(내가만든 편리한 계좌번호)를 생성하게 된다

개인키 -> (타원곡선 알고리즘) -> 공개키 ->(해시) ->계정주소(지갑) ->서명 ->검증

-   공통점: 알파벳과 숫자를 조합한 아주 긴 나열
-   차이점: 퍼블릭 키는 공개가능, 프라이빗 키는 비밀번호처럼 절대 유출되면 안됨

*   서명

-   나의 지갑이 유효하는 것인지 검증하는 용도
    서명을 만들때 필요한값으로는 개인키,해쉬값(transaction hash)이 있다
    개인키값에 해쉬값을 넣어서 만든다

지갑은 토스와비슷
토스는 어떤은행이든 연결되면 잔액을 볼수있었다
지감은 내가 지갑에 나의 계좌번호를 넣으면 지갑이라는 프로그램이 나의 잔액을 보여줄수있는 프로그램
거래에 있어서 중요한 정보는 누가누구에게 얼마를 보냈느냐
그 내용을 확인하려면 인증절차를 걸침

블록체인도 이 보내는이와 받는이를 만들어낼수있어야하고 얼마가 있는지와 인증이라는 절차기능도 들어가야됨

지갑은 보내는이와 받는이의 계좌번호만 모아서 관리하는 프로그램이다

지갑을 만드는 방법은
랜덤값으로 0,1이 뜨게하는걸 256번하면 256숫자 그럼 256bit로 돌여서 32byte로 바까서 나오는 64자리의 해쉬값

동전을 256번던지는 값을 계좌번호 비밀번호=개인키
개인키를 넣고 해쉬를 써서 돌리면 공개키가 된다
공개키를 가지고2번정도의 암호화를 진행 그게 공개키의 주소/계정

즉 처음에 개인키(=otp같은거, 혼자만알고있어야됨)를 만듬
개인키를 가지고 공개키(은행들에서 암묵적으로쓰는 코드분류번호)를 만듬
공개키를 가지고 계정(계좌번호, 즉 단사람도 알수있음)을 만듬

즉 지갑은 개인키를 16진수 즉 64자리 숫자를 로컬에 저장하는 시스템+공개키,계정등을 관리해주는 프로그램
개인키자체를 네트워크자체에 실어서주면안되고
해쉬로 만들어서 줘야됨
내가 나임을 인증하는방법이 서명
개인키는 누구나 만들수있다
개인키로 공개키를 만든다
계정은 공개키에서 앞자리 12바이트를 빼서 만드는거다

https://brunch.co.kr/@nujabes403/13- 개인키에 관련된 내용

우리가 만든거 여러가지 node들(프로세스)-core, http서버, p2p 하나더 만들게 월넷(지갑) 근데 지갑은 만드는게 선택조건임
그래서 비트코인이든 이더리움이든 지갑은 따로 구현해서 만들어있음

트랜잭션에 들어갈 속성으로는 input(signature를 만듬),output(돈의 내용이 들어감)

8bit=1byte=2nible

1nible=4bit
4bit=2의4승=16글자

1byte는 2글자로 표현 16진수로 표현했을때
32byte는 64글자

개인키를 가지고 뽑앚진 결과물이 서명
ㅡ 서명을 블록체인에 던져줌
블록체인은 그서명을 가지고 +공개키를 가지고
그값이 트루인지 펄스인지만 구별해주면된다

///너가보낸 트랜잭션맞아?

트랜잭션(송신자, 수신사, 보낼금액)적힘
이 트랜잭션의 진위여부가 중요
=송신자의 개인키로 서명을 만들어야하고 그 서명이 송신자의 것이 맞다는 것을 확인할수 있어야 한다
그리고 이 형태의 싸인을 만들수 있는 기술이 타원곡선이다

맞다는 것을 확인할수 있으려면 모든사람들은 공통적으로 타원곡선위의 어느한점을 알고있어야 한다
이점을 타원곡선의 기준점, G라고 부른다 그리고 G의 좌표가 무엇이냐에 따라 별명이 있다

타원곡선 방정식은 y2=x3+ax+b
이더리움과 비트코인에 사용되는 타원곡선은 a가0 b가 7이며 기준점 G가 "02 70~~~~98"인 타원곡선을 말한다 = y2=x3+7
얘의 별명은 SECP256K1이다

이제 SECP256K1를 가지고 이 트랜잭션 너가 보낸것 맞니?를 할것이다
서명을 보내는쪽과 받아서 검증하는 쪽의 스텝으로 나눠서 해야된다

-   보내는 사람의 절차
    (서명을 만들어서 트랜잭션과 함꼐 보낸다)

    1. 트랜잭션을 만든다
    2. 개인키(단순한 숫자)(1~n-1까지의 정수에서 랜덤하게 뽑음)를 타원곡선이 지정해주는 범위 내에서 정한다
    3. 첫번째서명r, 두번쨰 서명s찾기

    -   개인키를 골랐을때처럼 1~n-1범위의 정수를 랜덤하게 고른다
    -   개인키는 한번고르면 평생 그키만 쓰는데 이값은 트랜잭션을 보낼때마다 랜덤하게 선정해서 골라야 한다
    -   내가 고르는건 아니고 컴터가 랜덤하게 뽑아서 넣어준다

    4. 이제 트랜잭션+서명r과 서명s를 전송하면 된다

-   받는사람의 절차

1. 이거진짜 너가 보낸거 맞아를 확인

지갑이 보내는 사람,받는사람, 금액데이터를 보내주면
블록체인은 트랜잭션을 만드는게 아니라 그걸받아서 블록에 넣는 역할임
즉 블록체인은 데이터를 가지고있지 않고 지갑이 보내주면 그걸 보관하고있다가
블럭이 생성되면 거기에 넣어줌

지갑과 블록체인은 포트가 다르다
그래서 지갑에서 블록체인에 요청을 보내면 cors오류가 터진다

-   Authorization a[Token]--->a가먼가

@기준으로 자르고 앞에걸 가져오면
Authorization :basic web7722

web7722이걸 인코딩한게 나타나고 다시이러케나타내려면 티코딩해줌된다

오늘 이걸실습할거다
근데 토큰방식이아닌 옛날방식이라 구글브라우저에서는 안된다

**지갑 구현하는데 필요한 요소**

tx- 블럭들안에 있는 tx의 맨처음내용은 채굴한사람의 거래내용이고 그사람한테 코인을 주는데
첫번쨰 거래내용을 코인베이스라고 하고 우리는 그것을 구현

tx pool

wallet

\*UTXO
