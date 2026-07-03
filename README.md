# AI Portal Studio

여러 개의 AI 웹페이지를 한 레포에서 묶어 배포하는 정적 포털입니다.
현재 첫 번째 앱은 온프레미스 AI 서버 요청서와 HP / Dell 추천 서버 카드를 보여주는 화면입니다.

## Live Pages

- Hub: `https://tioon.github.io/ai-portal-studio/`
- Current app: `https://tioon.github.io/ai-portal-studio/#builder`
- Vendor cards: `https://tioon.github.io/ai-portal-studio/#vendors`

앞으로 추가될 프로젝트도 같은 도메인 아래에서 관리합니다.
예시:

- `https://tioon.github.io/ai-portal-studio/#<project-id>`
- `https://tioon.github.io/ai-portal-studio/<project-id>/`

## 실행

```bash
cd /Users/gim-yechan/.openclaw/workspace/project/ai-server-portal
npm start
```

브라우저에서 `http://localhost:4173/#vendors` 를 열면 됩니다.

## GitHub Pages

이 프로젝트는 정적 파일만으로 동작하므로 GitHub Pages로 무료 배포할 수 있습니다.
허브 페이지에서 여러 프로젝트 링크를 한 번에 보여주고, 각 프로젝트는 같은 도메인의 서브 경로로 추가할 수 있습니다.

현재 Pages 소스:

- Repo: `tioon/ai-portal-studio`
- Branch: `main`
- Path: `/`

## 포함 기능

- 프로젝트 허브
- 워크로드 / GPU 급 기반 자동 스펙 추천
- GPU 폼팩터(PCIe / SXM) 선택과 연결 부품 표시
- 전력 / 냉각 / PSU 추천
- 한국어 벤더 요청서 템플릿
- HPE / Dell 기준 서버 카드
- 로컬 호스팅용 SVG 이미지 일러스트

## 프로젝트 추가 방식

- `sites.json`에 새 프로젝트 메타데이터를 추가
- 상단 허브 카드에서 새 URL을 연결
- 이후 프로젝트가 많아지면 `sites/<project-id>/` 구조로 분리 가능
