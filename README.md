
<h1>📖 Chargehere(amdin/front) - 전기차 관련 쇼핑몰 관리자 페이지</h1>
<a href="http://43.200.244.229/"><img alt="main" src="https://github.com/user-attachments/assets/613e5a26-d058-4bc2-8f0e-445232ff1680"/></a>

<br/><br/>

- 배포 URL : http://3.36.65.201/admin/login/

<br/><br/>

## ❓ 프로젝트 소개

- Chargehere 쇼핑몰에 대한 관리자 페이지 입니다

<br>

## 💻 개발 환경

- 기술 스택 : Next.js, Typescript, React, Styled-component
- 버전 관리 : GitHub
- 툴 : Photoshop
- 배포 : AWS

<br>

## 👤 팀원 소개

3인 프로젝트


## 📅 프로젝트 일정

- 전체 프로젝트 일정 : 2024-10-02 ~ 2024-11-21
- 기획 설계 : 2024-10-02 ~ 2024-10-05
- 기능 구현 : 2024-10-06 ~ 2024-11-20
- 발표 및 시연 : 2024-11-21

<br>

## 💻 구현 사항

### 로그인 페이지
<a><img src="https://github.com/user-attachments/assets/d782fa96-1266-4932-8d32-ac0584aba224" alt="User page"/></a>

<br>

- 관리자 페이지 로그인 페이지입니다. 

<br>

### 회원관리
<a><img src="https://github.com/user-attachments/assets/613e5a26-d058-4bc2-8f0e-445232ff1680" alt="User page"/></a>

<br>

<a><img src="https://github.com/user-attachments/assets/6a8f6305-55d3-4a87-8e7b-79cf3c3f3364" alt="User page"/></a>

- 회원관리 페이지입니다. 
- 유저에 대한 정보를 모달에서 관리 가능합니다.

<br>

### 1:1 관리
<a><img src="https://github.com/user-attachments/assets/a65a3d4d-559a-49aa-a870-7f828f994378" alt="Inquries page"/></a>

<br>

<a><img src="https://github.com/user-attachments/assets/ea428a07-fb76-460e-8773-454f4fd91ea8" alt="Inquries page"/></a>

- 1:1 문의에 대한 페이지입니다.
- 관리자가 답변이 가능합니다.
- 답변을 하면 상태가 즉시 변화합니다.
- 
<br>

### 포인트 관리
<a><img src="https://github.com/user-attachments/assets/a13c6511-9f23-443e-b102-b8f9a358b04c" alt="performances detail page"/></a>

<br>

- 포인트 관리 페이지입니다.
- 포인트 증감 버튼으로 모달에서 유저별로 검색하여 포인트 지급이 가능합니다.
- 취소 버튼으로 지급된 포인트를 취소 가능합니다.
- 한 번 취소한 포인트는 다시 취소가 불가합니다.


<br>

### 쿠폰 관리
<a><img src="https://github.com/user-attachments/assets/ec948f72-e2a1-4c45-ba73-2c73dba464f3" alt="favourite page"/></a>

<br>

- 쿠폰 관리 페이지입니다.
- 메인 테이블은 쿠폰 사용에 대한 리스트입니다.
- 쿠폰 생성 버튼으로 모달에서 쿠폰 생성이 가능합니다.
- 쿠폰 발급 버튼으로 모달에서 쿠폰 발급이 가능합니다. (유저에게 직접 지급)
- 쿠폰 리스트 버튼으로 모달에서 쿠폰 관리가 가능합니다.

<br>

### 배너 관리
<a><img src="https://github.com/user-attachments/assets/1376e183-cd43-4bec-8a56-667def93543b" alt="performances detail page"/></a>

<br>

- 배너 관리 페이지입니다.
- 셀렉트 박스로 원하는 위치의 배너를 변경 가능합니다.
- 이미지를 S3에 저장해서 가장 최신으로 업로드 된 이미지를 적용시킵니다.


<br>

### 상품 관리
<a><img src="https://github.com/user-attachments/assets/6ef28566-1a0f-42cc-b1b0-f508bcc0d0fe" alt="favourite page"/></a>

<br>

<a><img src="https://github.com/user-attachments/assets/dd078ae6-af1d-4b5f-9445-92e2dceb23e1" alt="favourite page"/></a>

<br>

- 상품 관리 페이지입니다.
- 상품에 대해 수정/삭제가 가능하고 활성/비활성을 토글 버튼으로 선택 가능합니다.
- 상품 등록 버튼으로 모달에서 상품등록이 가능합니다.
- 상품 등록에서 썸네일 이미지 등록/삭제가 가능하고 상품 내용도 react-quill 에디터를 이용해서 원하는대로 저장이 가능합니다.
- 상품 내용에 있는 내용은 텍스트/이미지가 html형태로 S3에 저장하여 url로 db에 저장하고 불러옵니다.
- 상품 이미지를 메인 테이블에서 바로 볼 수 있습니다.

  <br>

### 리뷰 관리
<a><img src="https://github.com/user-attachments/assets/c269ecc0-500e-4406-b7d4-e4b8ab19f024" alt="favourite page"/></a>

<br>

- 리뷰 관리 페이지입니다.
- 리뷰 이미지를 메인 테이블에서 미리보기 할 수 있습니다.


<br>

### QnA 관리
<a><img src="https://github.com/user-attachments/assets/9b122aef-ce69-4c52-bbc7-28e8621d1b58" alt="favourite page"/></a>

<br>


- QnA 문의에 대한 페이지입니다.
- 관리자가 답변이 가능합니다.
- 답변을 하면 상태가 즉시 변화합니다.

  <br>

### 사이트 관리
<a><img src="https://github.com/user-attachments/assets/7f726103-000b-4f27-bcee-66b76a955287" alt="favourite page"/></a>

<br>

- 사이트 관리 페이지입니다.
- 로고 변경 시 S3에 저장되서 실제 페이지에 적용 됩니다.
- 로고 삭제 버튼을 클릭하면 적용되었던 로고가 삭제되고 기본 로고가 보이게 됩니다.
- 파비콘 변경 시 S3에 적용되어 실제 사이트에 적용 됩니다.


<br>

### 공지사항 관리
<a><img src="https://github.com/user-attachments/assets/337baab0-35db-4eec-8e06-202bfdcc5a3c" alt="favourite page"/></a>

<br>


- 공시하항에 대한 페이지입니다.
- 관리자가 게시 가능합니다.

<br>

### 결제 관리
<a><img src="https://github.com/user-attachments/assets/098d24e0-4d4e-470e-b02b-e44d6a6cb7c9" alt="favourite page"/></a>

<br>

<a><img src="https://github.com/user-attachments/assets/c53e464e-bb21-4915-ab1d-10f5b8db809f" alt="favourite page"/></a>

<br>

- 결제 관리 페이지입니다.
- 결제에 대한 상태를 변경 가능합니다. 

  

<br/><br/>
