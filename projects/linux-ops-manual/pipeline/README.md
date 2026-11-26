# Linux Ops Manual — 데이터팩 파이프라인

화면에 보이는 옵션·설명은 손으로 적은 것이 아니라, 배포판 공식 저장소의 패키지에서 꺼낸 man 페이지 원문입니다.
이 디렉터리는 그 데이터를 다시 만드는 스크립트입니다. Python 3 표준 라이브러리와 `mandoc`, `bsdtar`, `zstd`만 사용합니다.

## 범위 (`scope_config.py`)

| 배포판 | 저장소 | 범위 |
| --- | --- | --- |
| Rocky Linux 9.6 | `dl.rockylinux.org/vault/rocky/9.6` BaseOS, AppStream | man 1·8절이 있는 모든 패키지 |
| Ubuntu 22.04 | `archive.ubuntu.com` jammy / -updates / -security | `main` 전체 + `universe` 선별 목록 |
| EPEL 9 | `dl.fedoraproject.org/pub/epel/9` | 선별 목록만 (9.6에 고정된 저장소가 아님) |

60MB를 넘는 패키지(브라우저 등)는 건너뛰고 `data/coverage.json`에 기록합니다.

## 다시 만들기

```sh
# 1. 저장소 색인 내려받기 (~/.cache/linux-ops-manual/meta, LOM_CACHE 로 변경 가능)
python3 fetch_meta.py
# 2. 패키지를 받아 SHA-256 을 색인과 대조하고 man 원문만 추출 (이어받기 가능, 약 3GB 전송)
python3 fetch.py
# 3. 데이터팩 생성: data/index.json, data/cmd/**, data/manifest.json, data/coverage.json
python3 build.py
# 4. 한국어 운영 카드·옵션 노트를 공식 옵션 목록과 대조해 연결: data/curated.json
python3 build_curated.py
# 검사
python3 test_manparse.py     # 파서 회귀 검사
python3 check_ko.py          # 한국어 옵션 노트가 실제 옵션만 가리키는지
```

## 파일

- `common.py` — 저장소 색인 읽기 (RPM repodata, Debian Packages/Contents), 최신 빌드 선택
- `fetch_meta.py` — repomd/primary/filelists, Contents, Packages 색인 내려받기
- `fetch.py` — 다운로드, 체크섬 검증, man1/man8 추출, 패키지별 `manifest.json`
- `manparse.py` — `mandoc -T html` 결과를 허용 태그만 남긴 HTML로 정리하고 옵션 정의에 `data-o` 표시
- `build.py` — 배포판별 병합, 동일 본문 중복 제거, 옵션 집합 비교(배포판 차이), 색인 생성
- `build_curated.py` — `content/cards.json`, `content/ko/*.json` 의 모든 플래그를 공식 옵션 목록과 대조
- `dump_options.py` — 한 명령의 옵션을 원문 그대로 출력 (한국어 노트를 쓸 때 근거로 사용)
- `export_legacy_cards.cjs` — 예전 `app.js` 안의 카드를 `content/cards.json` 으로 옮길 때 한 번 사용

## 사람이 쓰는 내용 (`../content`)

- `cards.json` — 한국어 운영 카드 (요약, 대표 명령, 자주 쓰는 옵션, 예시, 주의점). 공식 문서가 아닙니다.
- `ko/<명령>.<절>.json` — 옵션 한 줄 한국어 설명. 키는 반드시 매뉴얼에 실제로 있는 플래그여야 하며,
  없는 플래그는 `build_curated.py` 가 버리고 `coverage.json` 의 `ko_rejected` 에 남깁니다.

## 알려진 한계

- 옵션 표는 매뉴얼의 목록 구조(`.TP`, `.IP`, `.It`, docbook `.PP`+`.RS`)를 읽은 결과입니다.
  옵션을 본문 문장으로만 설명하는 매뉴얼은 표가 비어 있고 전문만 제공됩니다.
- macOS 의 mandoc 이 변환하지 못하는 페이지는 `coverage.json` 의 `parse_failures` 에 남습니다.
- 5·7절(설정 파일, 개념)은 수집하지 않습니다.
