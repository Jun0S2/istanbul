# İstanbul 일정 앱 — 공유 설정

파일 7개를 전부 같은 폴더(리포 루트)에 둬야 해.
`index.html` · `sw.js` · `manifest.webmanifest` · `icon-180.png` · `icon-512.png`
(`firestore.rules`와 이 파일은 참고용이라 올려도 되고 안 올려도 돼.)

---

## 1. Firebase 프로젝트 만들기

1. https://console.firebase.google.com → **프로젝트 추가**
2. 이름 아무거나 (예: `istanbul-trip`). Google Analytics는 **끄기**
3. 생성 완료까지 30초쯤

## 2. Firestore + 익명 로그인 켜기

**Firestore**
1. 왼쪽 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**
2. 위치: `eur3 (europe-west)` — 베를린/이스탄불 둘 다 가까움
3. **프로덕션 모드**로 시작 (규칙은 4단계에서 넣음)

**익명 로그인**
1. **빌드 → Authentication → 시작하기**
2. **Sign-in method** 탭 → **익명** → 사용 설정 → 저장

## 3. 설정값 복사해서 index.html에 넣기

1. 왼쪽 위 톱니바퀴 → **프로젝트 설정**
2. 아래로 스크롤 → **내 앱** → **</>** (웹) 아이콘 클릭
3. 닉네임 아무거나, 호스팅 체크는 **안 함** → 앱 등록
4. 화면에 나오는 `firebaseConfig` 값들을 복사
5. `index.html` 위쪽 `window.FIREBASE_CONFIG = {...}` 안에 그대로 붙여넣기

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "istanbul-trip.firebaseapp.com",
  projectId: "istanbul-trip",
  storageBucket: "istanbul-trip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

이 값들은 공개돼도 되는 식별자야. 실제 접근 제어는 4단계 규칙이 함.

## 4. 보안 규칙 넣기

**Firestore Database → 규칙** 탭에 아래를 붙여넣고 **게시**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, write: if request.auth != null && tripId == "istanbul-2026";
    }
  }
}
```

## 5. GitHub Pages에 올리기

1. GitHub에 public 리포 생성 (예: `ist`)
2. 파일 5개 업로드 → 커밋
3. **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `/ (root)` → Save
4. 1분 뒤 `https://<아이디>.github.io/ist/` 접속

## 6. Firebase에 도메인 허용 추가

**Authentication → Settings → 승인된 도메인 → 도메인 추가**
→ `<아이디>.github.io`

이거 빠뜨리면 로그인이 막혀서 배지가 계속 `sync error`로 뜸. 가장 흔한 실수야.

## 7. 폰에 설치

1. **Safari**로 Pages 주소 열기 (Chrome 아님 — 홈 화면 추가가 Safari여야 제대로 됨)
2. 공유 → **홈 화면에 추가**
3. 아이콘으로 실행 → 헤더 배지가 **shared**면 연결 완료
4. 같이 쓸 사람에게 같은 주소 보내서 똑같이 하면 끝

---

## 헤더 배지 읽는 법

| 배지 | 뜻 |
|---|---|
| `shared` (초록) | 연결됨. 변경이 서로 실시간 반영 |
| `syncing` | 방금 쓴 게 아직 올라가는 중 |
| `offline · saved here` (노랑) | 인터넷 없음. 로컬에 쌓이고, 연결되면 자동 전송 |
| `sync error` (빨강) | 6단계 도메인 허용 또는 4단계 규칙 확인 |
| `this device only` | 설정값이 비어 있음. 3단계 확인 |

## 충돌 처리

항목 단위로 마지막에 고친 쪽이 이겨. 서로 **다른** 일정을 건드리면 둘 다 남고,
**같은** 일정을 동시에 고치면 나중 것만 남아. 삭제는 흔적으로 남겨서
오프라인이던 기기가 다시 연결돼도 되살아나지 않게 했어.

원격에서 새로 들어온 항목은 잠깐 초록으로 깜빡여.

## 비용

Firestore 무료 한도는 하루 읽기 5만 / 쓰기 2만이야.
세 명이 일주일 쓰면 수천 건 수준이라 요금 나올 일 없어.

## 여행 끝나고

Firebase 콘솔에서 프로젝트 삭제하면 깔끔하게 정리돼.
