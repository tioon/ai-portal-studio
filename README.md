# AI Server Request

온프레미스 AI 서버 요청서와 HP / Dell 추천 서버 카드를 함께 보여주는 정적 웹사이트입니다.

## 실행

```bash
cd /Users/gim-yechan/.openclaw/workspace/project/ai-server-portal
npm start
```

브라우저에서 `http://localhost:4173/#vendors` 를 열면 됩니다.

## GitHub Pages

이 프로젝트는 정적 파일만으로 동작하므로 GitHub Pages로 무료 배포할 수 있습니다.
레포를 만든 뒤 `index.html`, `app.js`, `styles.css`, `server.js`를 그대로 올리면 됩니다.

## 포함 기능

- 워크로드 / GPU 급 기반 자동 스펙 추천
- 전력 / 냉각 / PSU 추천
- 한국어 벤더 요청서 템플릿
- HPE / Dell 기준 서버 카드
- 로컬 호스팅용 SVG 이미지 일러스트
