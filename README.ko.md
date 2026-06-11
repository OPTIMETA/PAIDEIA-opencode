<h1 align="center">ΠΑΙΔΕΙΑ · Paideia <sub>for opencode</sub></h1>

<p align="center">
  <strong>당신의 수업. 당신의 패턴. 당신의 오답. 당신의 치트시트.</strong><br>
  <em>당신의 자료를 영속적이고 편집 가능한 코스별 학습 그래프로 바꾸는 시험대비 하네스 — 모든 산출물이 일반 강의계획서가 아니라 당신에 의해 형성됩니다. opencode 에디션: 에디터 플러그인이 아니라 <a href="https://opencode.ai">opencode</a>를 구동하는 독립 하네스.</em>
</p>

<p align="center">
  <a href="https://github.com/OPTIMETA/PAIDEIA-Alt"><img height="30" src="https://img.shields.io/badge/Exam_Radar-OPTIMETA_Alt_plugin-333333?style=for-the-badge&labelColor=000000&color=333333" alt="Exam Radar — OPTIMETA Alt plugin"></a>
</p>

<p align="center">
  <sub><em><a href="https://github.com/OPTIMETA/PAIDEIA-Alt"><strong>Exam Radar</strong></a>(OPTIMETA의 Alt 플러그인)로 강의를 포착하고 Paideia로 공부하세요. <code>paideia alt</code>로 로드맵을 바로 흘려보낼 수 있습니다.</em></sub>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/OPTIMETA/PAIDEIA-opencode?style=flat-square&labelColor=000000&color=333333&cacheSeconds=3600" alt="License">
  <img src="https://img.shields.io/github/stars/OPTIMETA/PAIDEIA-opencode?style=flat-square&logo=github&logoColor=white&labelColor=000000&color=333333&cacheSeconds=3600" alt="GitHub stars">
  <img src="https://img.shields.io/github/last-commit/OPTIMETA/PAIDEIA-opencode?style=flat-square&labelColor=000000&color=333333&cacheSeconds=3600" alt="Last commit">
  &nbsp;
  <img src="https://img.shields.io/badge/opencode-000000?style=flat-square&logo=opencode&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="opencode">
  <img src="https://img.shields.io/badge/Harness-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Harness">
  <img src="https://img.shields.io/badge/Node.js-000000?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Node.js">
  <img src="https://img.shields.io/badge/Python-000000?style=flat-square&logo=python&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Python">
  <img src="https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Ollama">
  <img src="https://img.shields.io/badge/Qwen3--VL-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Qwen3-VL">
  <img src="https://img.shields.io/badge/Tesseract-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Tesseract">
  <img src="https://img.shields.io/badge/LaTeX-000000?style=flat-square&logo=latex&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="LaTeX">
  <img src="https://img.shields.io/badge/Obsidian-000000?style=flat-square&logo=obsidian&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Obsidian">
</p>

<p align="center">
  <a href="./README.md">English README</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/OPTIMETA/PAIDEIA"><strong>PAIDEIA</strong> — 원본 Claude Code 에디션</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/OPTIMETA/PAIDEIA-codex"><strong>PAIDEIA-codex</strong> — OpenAI Codex CLI 에디션</a>
</p>

> **Claude Code나 Codex 대신 opencode를 쓰시나요?** 같은 도구, 같은 디스크 구조, 같은 라이선스 — opencode를 구동하는 **하네스**로 재구축했습니다. 원본 PAIDEIA는 Claude Code *플러그인*(에디터가 로드하는 커맨드+스킬)이지만, 이 에디션은 opencode 위에 앉아 그것을 구동하는 독립 프로그램입니다(스테이지마다 `opencode run` 한 번). 이미 결제 중인 에이전트 런너를 고르세요 — 만들어지는 학습 그래프는 세 에디션 모두 동일하고 이식 가능합니다.

> **보안 안내.** PAIDEIA for opencode는 일반 npm/Node CLI(`paideia`)로 설치되며, `.zip` 다운로드·`.exe` 실행·별도 인스톨러를 절대 요구하지 않습니다. 이 README에서 명시적으로 링크되지 않은, PAIDEIA 이름을 쓰는 다른 저장소는 본 프로젝트와 무관합니다.

<p align="center">
  <em>일반 학습 도구는 평균 강의계획서를 가르칩니다. Paideia는 <strong>당신의</strong> 강의계획서를 가르칩니다 —<br>
  교수님의 노트, 당신의 과제 강조점, 당신의 손글씨, 당신의 오답으로부터. 모든 산출물은 편집 가능한 마크다운 파일입니다.</em>
</p>

---

## Paideia의 뜻

고대 그리스에서 **Παιδεία**는 수동적인 학생에게 사실을 입력하는 일이 결코 아니었습니다. 그것은 원전과의 구조적 만남, 스승 아래의 안내된 연습, 피드백을 더 깊은 수정으로 접어 넣는 성찰적 대화를 통한 — 한 인간의 평생에 걸친 형성이었습니다.

이 하네스는 그 사이클을, 수학·물리·공학 과목의 **시험 대비**라는 구체적이고 한정된 문제에 대해 구현합니다:

```
  ingest ──▶ analyze ──▶ drill ──▶ grade ──▶ weakmap ──▶ cheatsheet
     ▲                                                        │
     └────────────────── 피드백 루프 ─────────────────────────┘
```

모든 단계는 당신의 코스 폴더에 영원히 남는 마크다운 산출물을 만듭니다. 휘발되는 것도, API 뒤에 숨는 것도, 다음 펀딩 한파에 멈추는 것도 없습니다.

---

## 플러그인이 아니라 하네스

원본 PAIDEIA는 *플러그인*입니다 — 에디터(Claude Code)가 자기 에이전트 루프 안에서 로드·실행하는 커맨드·스킬이죠. 이 에디션은 **하네스**입니다. opencode *위에* 앉아 그것을 구동하는 독립 프로그램입니다.

```
┌──────────────────────────────────────────────────────────────┐
│  paideia  (하네스 — 시험대비 로직 전부를 소유)               │
│                                                              │
│   커맨드   ─▶ 결정적 사전작업          ─▶ 스테이지 SPEC 합성  │
│   파싱        (PDF 렌더·OCR·파일 탐색·      (시스템 +        │
│               git·워크스페이스 관리)        코스 컨텍스트 +  │
│                          │                   커맨드 지시문)  │
│                          ▼                        ▼          │
│                  python / poppler        opencode run --dir … │
│                  / ollama / tesseract    -f <spec>           │
└──────────────────────────────────────────────┬───────────────┘
                                                ▼
                          opencode  (실행 엔진)
                  모델 · 도구(Read/Write/Bash/Task) · 인증
```

- **하네스가 학습 로직을 소유합니다.** 모든 커맨드·프롬프트·규칙이 이 저장소에 있습니다. opencode에 PAIDEIA 플러그인/에이전트/스킬을 설치할 필요가 없습니다.
- **opencode는 기반(substrate)입니다.** 모델·파일/셸/서브에이전트 도구·인증을 제공합니다. 각 스테이지는 한 번의 `opencode run`입니다.
- **결정적 작업은 하네스에 남습니다** (PDF 래스터화, 로컬 OCR, 디렉토리 골격, 멱등성, git, PDF 아카이브, 단계 감지) — 토큰 비용도 추측도 없습니다.
- **모델은 모델다운 일만 합니다** (비전 전사, 패턴 추출, 문제 생성, 전략 채점) — 완전히 합성된 명세로.

---

## 일반 학습 도구가 못 하는 것

대부분의 학습 도구는 *당신의* 코스·교수님·실수에 맞출 수 없습니다. 그들이 파는 상품이 일반 커리큘럼이기 때문입니다.

- **Coursera, edX, Khan Academy** — 고정 커리큘럼; 당신의 교수가 무엇을 강조하는지 모릅니다.
- **Quizlet, Anki** — 모든 카드를 직접 큐레이션; 당신의 솔루션에서 패턴을 유도하지 않습니다.
- **ChatGPT Study Mode, Gemini, NotebookLM** — 코스별 영속 상태가 없습니다. 매 세션이 차갑게 시작하고, 지난주 실수가 이번 주 드릴을 형성하지 않습니다.

이 중 어느 것도 눈앞의 구체적 자료를 중심으로 이해를 *형성*하지 않습니다. Paideia는 정반대입니다 — 모든 산출물이 *당신의* 폴더(강의 노트·교재 챕터·과제·솔루션·손글씨 시도)에서 유도되어, 편집 가능한 평문 마크다운으로 영구히 쌓입니다.

| 축 | Paideia | 일반 edu-SaaS / LLM 채팅 |
|-----|---------|------------------------------|
| 풀이 패턴 (`P1..Pk`) | *당신 코스의* 솔루션에서 추출, 당신 파일 인용 | 일반 교재 목록 또는 없음 |
| 드릴 우선순위 | *교수님의* 과제 강조로 가중 (HW 밀도 = 시험 등급) | 고정 커리큘럼 또는 직접 추측 |
| 치트시트 | *당신의* `errors/log.md`에서 — 실제로 틀린 것 | 강의계획서 보일러플레이트 |
| 세션 간 코스 상태 | 영속 마크다운+YAML, 작업하며 성장 | 대화 리셋; 이력은 유료 |
| 동의 안 되는 산출물 편집 | `.md`를 아무 에디터로 열어 저장 | 읽기 전용 UI |
| 산출물 위치 | 당신의 디스크, 텍스트로 | 원격 DB, 유료로만 내보내기 |

하네스는 무거운 작업에 opencode(유료 모델과 통신)를 쓰지만, 만들어지는 모든 것은 디스크에 평문 마크다운으로 남습니다. 런너를 바꾸거나 구독을 멈춰도 course-index·patterns·error log·weakmap·치트시트는 전부 당신 것입니다. 발판은 하네스, 학습 그래프는 당신 것입니다.

기본적으로 OCR은 opencode 에이전트의 네이티브 비전을 거칩니다. 손글씨 PDF가 기기를 절대 떠나지 않길 원하면 `ollama pull qwen3-vl:8b`(일회성 ~6GB)로 이후 모든 OCR을 로컬 Qwen3-VL 추론으로 전환할 수 있습니다.

---

## 핵심 원칙: 과제 밀도 = 시험 출제 확률

"똑똑하게 공부하라"는 조언 대부분은 사각지대를 사냥하라고 합니다. 그건 **거꾸로**입니다. 교수는 과제를 내줌으로써 시험 점수가 어디 있는지 *이미 알려줬습니다.* 과제가 많은 섹션이 🔥🔥 시험 핵심입니다. 과제가 0인 섹션은 "숨은 함정"이 아니라 ⚪ 저위험입니다. 교수의 누락은 그 주제가 시험에서 빠진다는 가장 강력한 신호입니다.

Paideia의 랭킹은 이를 명시하고, 모든 드릴 커맨드가 기본으로 이를 따릅니다:

| 등급 | 섹션 과제 수 | 처리 | 모의고사 배점 비중 |
|------|---------------------|-----------|---------------------------|
| 🔥🔥 시험 핵심 | 3+ | 가장 강하게 드릴 | ≥70% |
| 🔥 시험 유력 | 2 | 다음 드릴 | ~25% |
| 🟡 시험 가능 | 1 | 가볍게 복습 | ≤5% |
| ⚪ 저위험 | 0 | 참고용 | 0 |

`paideia quiz all`, `paideia mock`, `paideia hwmap hot`은 모두 이 등급으로 출력을 가중합니다. ⚪ 섹션 드릴을 고집하면 하네스는 한 번 따르되 시험 확률이 낮다고 경고합니다 — 당신의 유한한 시간은 상상 속 함정보다 가치 있습니다.

---

## Formation Cycle, 단계별

| 단계 | 하는 일 | 커맨드 | 산출물 |
|-------|-------------|----------|----------|
| **Encounter** | 교수의 신호를 읽음 | `paideia ingest` | `converted/**/*.md` — 모든 강의·교재·과제·솔루션을 깔끔한 마크다운으로 |
| **Structure** | 코스의 문법을 추출 | `paideia analyze` | `course-index/{summary,patterns,coverage}.md` — 토픽 트리, 반복 풀이 패턴(P1..Pk), HW밀도 시험등급 |
| **Practice** | 교수가 실제 내는 것에 가중한 능동 회상 | `paideia quiz` `twin` `blind` `chain` `mock` | `quizzes/` `twins/` `chain/` `mock/` — 종이에 푸는 문제 |
| **Reflection** | 손글씨 작업이 점수가 됨 | `paideia grade` | `answers/converted/<name>.md` + `errors/log.md` — 에이전트 비전(기본)/Ollama/Tesseract OCR 후 전략 채점 |
| **Diagnosis** | 오답을 우선순위 약점 리포트로 압축 | `paideia weakmap` | `weakmap/weakmap_<ts>.md` — 추가 전용 이력 |
| **Distillation** | 한 페이지, 오답 기반, 인쇄용 | `paideia cheatsheet` `derive` `pattern` | `cheatsheet/final.md`, `derivations/<slug>.md` |

보조: `paideia hwmap`은 HW밀도 시험확률을, `paideia status`는 사이클상 현재 위치를 보여주고, `paideia init-course`는 새 코스 폴더를 부트스트랩합니다.

---

## 설치

### 사전 요구사항

**필수**

- **Node ≥ 18.17** (하네스 실행 — 순수 ESM, 런타임 의존성 0)
- **[opencode](https://opencode.ai)** (실행 엔진) — `npm i -g opencode-ai`, 그리고 한 번 `opencode auth login`
- **Python 3.9+** + `pdf2image` + `pillow` (PDF 렌더·로컬 OCR)
- Unix 계열 셸(`bash`/`zsh`). Windows는 [WSL2](https://learn.microsoft.com/windows/wsl/install).
- **macOS**: `brew install poppler tesseract tesseract-lang`
- **Linux (Debian/Ubuntu)**: `apt-get install poppler-utils tesseract-ocr tesseract-ocr-kor`

**선택 — `--ocr=ollama` 모드용 (모든 페이지 이미지가 기기에 머무름)**

- `ollama` + `qwen3-vl:8b` 모델 (~6GB). `brew install ollama && ollama pull qwen3-vl:8b`.

Ollama를 설치하지 않으면 기본 OCR 엔진은 opencode 에이전트의 비전입니다 — 추가 설치 없음.

### 하네스 설치

```bash
git clone https://github.com/OPTIMETA/PAIDEIA-opencode
cd PAIDEIA-opencode
npm link          # 또는: npm i -g .  → `paideia`를 PATH에 등록
paideia doctor    # 설치 점검 (opencode, python, poppler, tesseract)
```

빌드 단계 없음. 직접 실행도 가능: `node /경로/PAIDEIA-opencode/bin/paideia.mjs …`.

### 코스별 부트스트랩

이 코스에 쓸 폴더 안에서 터미널을 열고 실행:

```bash
paideia init-course
```

대화형으로:
1. 이 코스의 인터페이스 언어를 물어봅니다 — `en`(기본) 또는 `ko`. 이후 모든 프롬프트·드릴 지시·생성 MD 서술이 이를 따릅니다. 구조 토큰(파일 경로, 커맨드 이름, 패턴 ID `P1, P2, …`, YAML 키, 등급 마커)은 언어와 무관하게 영어로 유지됩니다.
2. 기본 OCR 엔진을 물어봅니다: `vision`(에이전트 비전, 설치 불필요), `ollama`(로컬 Qwen3-VL), `tesseract`.
3. `COURSE_NAME`, `EXAM_DATE`, `EXAM_TYPE`, `USER_WEAK_ZONES`를 물어봅니다.
4. 디렉토리 골격을 생성합니다.
5. `.course-meta`(모든 커맨드와 `vision_ocr.py`가 읽는 `INTERFACE_LANG`+`OCR_ENGINE`), `AGENTS.md` 코스 컨텍스트, 그리고 `instructions` 키로 `AGENTS.md`를 폴더 내 모든 실행에 로드하는 `opencode.json`을 씁니다.
6. `git init`으로 첫 타건부터 버전 관리합니다.

단일 채점 호출에서 엔진 덮어쓰기: `paideia grade --ocr=vision 경로/answer.pdf`.

### 기존 코스 폴더 (마이그레이션)

`.course-meta`에 `INTERFACE_LANG`이 없는 코스는 `en`으로 취급됩니다. 한국어 출력을 유지하려면 `INTERFACE_LANG: ko` 한 줄만 추가하면 됩니다.

---

## 코스 폴더 구조

`paideia init-course` 후 폴더는 이렇게 보입니다:

```
my-course/
├── .course-meta                     # 코스명, 시험일, 인터페이스 언어(en|ko), OCR 엔진
├── AGENTS.md                        # opencode가 매 실행 로드하는 코스 컨텍스트 (opencode.json 경유)
├── opencode.json                    # instructions: ["AGENTS.md"] + 무인 실행용 permission
├── .gitignore                       # 원본 PDF 스캔·OCR 스크래치 숨김; 학습 그래프 자체는 커밋 유지
│
├── materials/                       # 원본 파일을 여기 넣습니다 (PDF/MD)
│   ├── lectures/  textbook/  homework/  solutions/
│
├── converted/                       # 자동 생성 마크다운 — 편집 금지
│   └── lectures/ textbook/ homework/ solutions/   # `paideia ingest` 출력 (비전 전사 LaTeX)
│
├── course-index/                    # 지식 베이스 — `paideia analyze`가 생성
│   ├── summary.md  patterns.md  coverage.md  radar.md
│
├── answers/                         # 손글씨 스캔 PDF를 여기 넣습니다
│   └── converted/                   # `paideia grade`가 OCR 마크다운을 씀
│
├── errors/log.md                    # 추가 전용 YAML 오답 로그 (weakmap+cheatsheet의 씨앗)
│
├── quizzes/ mock/ twins/ chain/     # 생성 문제 (숨김 정답/솔루션 형제 파일 포함)
├── derivations/ cheatsheet/ weakmap/
└── .paideia/run/                    # opencode에 넘긴 합성 스테이지 spec (실행마다 1개)
```

**손으로 편집할 디렉토리는 둘뿐:** `materials/`(원본 PDF/MD)와 `answers/`(손글씨 스캔 PDF). 나머지는 커맨드가 생성하며 재생성 가능합니다. `git log <dir>`로 진행을 보거나, 폴더 전체를 Obsidian 볼트로 가리키세요.

---

## 읽기 팁: Obsidian

Paideia는 모든 것을 LaTeX 수식(`$...$`, `$$...$$`)이 든 평문 마크다운으로 씁니다. 아무 에디터로도 읽히지만 **[Obsidian](https://obsidian.md)**이 자연스럽습니다:

- 설정 없이 MathJax로 수식 렌더링
- 백링크로 `quizzes/q_<ts>.md`에서 인용된 `converted/lectures/chN.md §K`로 바로 이동
- 코스 폴더 전체가 그대로 볼트
- 완전 오프라인·무료·로컬 — Paideia 철학(당신의 노트, 당신의 디스크, 당신의 도구)과 일치

터미널은 마크다운 프리뷰가 있어도 수식에 약합니다 — 그것과 싸우지 마세요.

## 그리고 강의 끝단: Alt

Obsidian이 읽기 끝단의 동반자라면, **[Alt](https://www.altalt.io/ko/)**는 강의가 들어오는 다른 끝단의 동반자입니다. Alt는 강의를 녹음·전사하고, OPTIMETA의 **Exam Radar** 플러그인이 그 안에서 교수가 구두로 얼마나 강조했는지로 토픽을 랭크합니다. 그것을 `paideia alt`로 Paideia에 보내면 루프가 닫힙니다: **강의 참석 → 포착 → 시험 신호 추출 → 중요한 것만 공부.**

---

## 전체 워크플로 — 예시

### 0단계 — 코스당 한 번 (15분)

```bash
cp ~/textbooks/ch*.pdf      ~/courses/my-course/materials/textbook/
cp ~/hw/hw*.pdf             ~/courses/my-course/materials/homework/
cp ~/hw/hw*_sol.pdf         ~/courses/my-course/materials/solutions/

paideia ingest                  # 모든 PDF → 비전 파이프라인 (서브에이전트 병렬, LaTeX 충실)
paideia analyze "약점 힌트"     # patterns + coverage + summary 생성
paideia hwmap hot               # 🔥🔥 시험 핵심 존 표면화
```

### 1단계 — 진단 (40분)

```bash
paideia quiz all 20             # 광범위 진단, 20문제
# 종이에 풀고(40분), answers/diagnostic.pdf 로 스캔
paideia grade                   # OCR + 전략 채점
```

### 2단계 — 표적 드릴 (대부분의 준비 시간)

```bash
paideia weakmap                 # 우선순위 약점 리포트
paideia blind hw3-p2            # 알려진 문제의 전략 전용 드릴
paideia blind hw3-p2 --strategy "유수정리(P7), 등고선 고정, 2πi·Σ유수 형태 예상"
paideia twin hw3-p2             # 같은 패턴 새 표면 변형
paideia chain 3                 # 다중 패턴 통합 문제
paideia quiz weakmap 5          # 최신 weakmap 표적 5문제
```

### 3단계 — 통합 (~90분)

```bash
paideia mock 90                 # HW밀도 가중 90분 모의고사
paideia grade                   # 모의고사 채점
```

### 4단계 — 압축 (시험 전날 60분)

```bash
paideia cheatsheet --pdf        # 오답 기반 1페이지
paideia weakmap                 # 약점 존 한 번 더 점검
```

### 5단계 — 쿨다운 (시험 직전 10분)

```bash
paideia weakmap                 # 상위 3개만. 새로운 건 배우지 말 것.
```

---

## 커맨드 (16개 + status)

| 커맨드 | 용도 |
|---------|---------|
| `paideia init-course` | 새 코스 폴더 부트스트랩 (대화형: 언어, OCR 엔진, 메타, 골격, git) |
| `paideia doctor [--fix]` | 설치+워크스페이스 진단 (opencode+인증, Python, poppler, tesseract, Ollama/Qwen3-VL, 폴더, `.course-meta`, 쓰기 경로); `--fix`는 권한 없이 가능한 항목 복구 |
| `paideia status [--banner]` | 사이클상 위치: `paideia · <COURSE> · D-N · <phase> · P<k> ↑` |
| `paideia ingest [--force]` | `materials/**`의 모든 PDF → `converted/**` 마크다운 (PDF당 서브에이전트 1개, LaTeX 충실) |
| `paideia analyze [힌트]` | `course-index/{summary,patterns,coverage}.md` 생성 |
| `paideia hwmap hot\|<§>` | HW밀도 순 🔥🔥 시험 핵심 섹션 표면화 |
| `paideia pattern <§\|Pk\|키워드>` | course-index의 패턴 카드 표시 |
| `paideia derive <대상>` | `derivations/<slug>.md`에 깔끔한 레퍼런스 유도 |
| `paideia quiz <토픽\|§\|weakmap> [N]` | 연습문제 N개, 정답은 `_answers.md`에 숨김 |
| `paideia blind <id> [--strategy "…"]` | 알려진 문제의 전략 점검 드릴 (제시 후 전략 채점) |
| `paideia twin <id> [--strategy "…"]` | 알려진 문제의 변형 — 같은 패턴, 새 표면 |
| `paideia chain <N>` | N개 패턴을 묶은 다중 패턴 통합 문제 |
| `paideia mock <분>` | HW밀도 가중 전체 모의고사 |
| `paideia grade [--ocr=<엔진>] [경로]` | `.course-meta`의 엔진(에이전트 비전/Ollama/Tesseract)으로 답안 PDF OCR, 전략 채점, `errors/log.md` 추가 |
| `paideia weakmap [개념]` | `weakmap/weakmap_<ts>.md`에 저장되는 우선순위 약점 리포트 |
| `paideia cheatsheet [--pdf]` | 오답 기반 1페이지 |
| `paideia alt [붙여넣기]` | OPTIMETA Exam Radar(Alt) 내보내기 임포트 → `course-index/radar.md` + `coverage.md` 강의강조 열 + 골드존 weakmap |

전역 플래그: `--model <provider/model>` (opencode에 모델 전달), `--dry-run` (모델 실행 없이 스테이지 spec 합성 + 정확한 `opencode` 명령 출력).

---

## 내부 동작

### 스테이지 실행 방식

1. 하네스가 코스 루트(`.course-meta`)를 찾고 선행조건을 확인하고 결정적 사전작업을 합니다.
2. **스테이지 spec**을 합성합니다 = 공유 시스템 프롬프트(`assets/prompts/_system.md`) + 실시간 **코스 컨텍스트** 블록(메타·`D-N`·단계·파일 목록·대상 파일) + 포팅된 커맨드 지시문(`assets/prompts/<command>.md`). `{{COURSE_NAME}}`·`{{INTERFACE_LANG}}`·`{{TS}}` 등을 치환.
3. spec을 `.paideia/run/<stage>-<ts>.md`에 쓰고 `opencode run --dir <course> -f <spec> [-m <model>] --dangerously-skip-permissions`를 실행.
4. opencode가 워크스페이스에 대해 spec을 실행하며 산출물을 씀.
5. 하네스가 결정적 후처리를 함(스크래치 정리, 채점 PDF 아카이브, 요약 표 출력).

`--dry-run`은 모델 호출 없이 정확한 명령과 합성된 spec을 보여줍니다.

### 인제스트 파이프라인: 모든 PDF에 비전

`paideia ingest`는 `materials/**`의 모든 PDF를 같은 비전 파이프라인으로 보냅니다. 텍스트 추출은 먼저 시도했으나 비신뢰로 판명됐습니다 — 평문처럼 *보이는* 페이지도 수식·도형·다단·여백 메모가 섞이는 순간 조용히 단어 샐러드가 됩니다.

하네스가 모든 페이지를 `dpi=160` PNG로 렌더하고, **어떤 에이전트가 읽기 전에** 긴 변 ≤1800px로 리사이즈합니다(many-image 요청은 2000px 초과 이미지를 거부; 16:9 슬라이드는 선제 리사이즈 없이는 이를 넘김). 그 뒤 opencode가 PDF당 서브에이전트 1개를 띄워 각자 자기 페이지를 *순차*로 읽고 LaTeX 마크다운으로 전사합니다 — `ℏ ∂ p2 ℏ 2 ∂ 2 p ̂` 대신 `$$\hat H = -\frac{\hbar^2}{2m}\partial_x^2 + V(x)$$`. 렌더가 결정적이라 하네스가 소유합니다(토큰 비용 없음, "읽기 전 리사이즈" 순서 보장).

### 손글씨 OCR: 세 엔진, 당신이 선택

종이에 풀고 PDF로 스캔해 `answers/`에 넣고 `paideia grade`를 돌립니다. 하네스가 코스별(`.course-meta`의 `OCR_ENGINE`)로 고르고 호출별(`paideia grade --ocr=<엔진>`)로 덮어쓸 수 있는 세 엔진 중 하나로 마크다운으로 변환합니다:

| 엔진 | 기본? | 동작 | 선택 시점 |
|---|---|---|---|
| `vision` | **예** | 하네스가 각 페이지를 래스터화 → opencode가 각 PNG를 읽어 한 번에 마크다운 합성. 추가 모델/설치 없음. | 기본 경로. 한국어+LaTeX에 강함. opencode에 비전 모델 필요. |
| `ollama` | 선택 | `vision_ocr.py --engine=ollama` → 로컬 Qwen3-VL 8B, tesseract 자동 폴백. | 페이지 이미지가 기기를 절대 떠나지 않길 원할 때. `ollama pull qwen3-vl:8b`(~6GB) 1회 필요. |
| `tesseract` | 선택 | `vision_ocr.py --engine=tesseract` → pytesseract(`eng`, ko면 `eng+kor`). | 가장 빠르고 가벼움; 타이핑 스캔에 적합; 손글씨엔 약함. |

각 엔진은 `answers/converted/<stem>.md`를 `<!-- SOURCE: ... -->`/`<!-- TIER: ... -->` 헤더와 함께 써서 `grade`가 저신뢰 OCR을 단서로 처리하게 합니다.

### 줄단위가 아닌 전략 기반 채점

손글씨 수식 OCR 노이즈는 엄격한 대수 채점을 무용하게 합니다 — `∫`를 `∑`로 한 번만 오독해도 연쇄됩니다. 더 중요하게, **패턴 인식이 실제 시험 병목**이지 산수가 아닙니다. 채점기는 문제마다 세 가지를 봅니다:

1. **패턴** — `course-index/patterns.md`에서 올바른 Pk를 골랐는가?
2. **변수** — 올바른 치환/기저/지표/등고선을 짚었는가?
3. **최종형** — 최종 식의 형태(차원·점근·구조)가 맞는가?

오답은 타입 분류(`pattern-missed | wrong-variable | wrong-end-form | algebraic | sign | definition`)와 함께 YAML로 `errors/log.md`에 기록됩니다. 이 로그가 `paideia weakmap`의 씨앗이자 `paideia cheatsheet`의 *유일한* 입력입니다.

### 추가 전용 이력 & status

`weakmap/`는 절대 덮어쓰지 않습니다 — 매 실행이 `weakmap/weakmap_<ISO타임스탬프>.md`를 만들어, `git log weakmap/`이 "내 이해를 시간순으로 `git diff`"가 됩니다.

`paideia status`는 사이클상 위치(`paideia · <COURSE> · D-<일수> · <phase> · P<top-miss> ↑`)를 **디스크 활동**(달력 아님)에서 유도해 보여줍니다: `setup`(`patterns.md` 없음) → `diag`(채점 오답 없음) → `drill`(퀴즈 문제 + 채점된 `- problem_id:` 항목) → `mock`(mock 출처 항목 등장) → `cram`(`cheatsheet/final.*` 존재) → `cool`(`D-0`). `<top-miss>`는 최신 weakmap의 최빈 `pattern:` 태그(없으면 `errors/log.md`). `paideia status --banner`는 같은 내용을 2줄 세션 브리핑으로 출력합니다.

---

## 무엇이 들어 있나

```
PAIDEIA-opencode/
├── LICENSE                         # MIT
├── README.md  README.ko.md         # 본 파일 + 한국어 미러
├── package.json                    # bin: paideia · ESM · 런타임 의존성 0
├── bin/paideia.mjs                 # 진입점
├── src/
│   ├── cli.mjs                     # 전역 플래그 + 서브커맨드 디스패치
│   ├── core/                       # 하네스 엔진
│   │   ├── opencode.mjs            # 드라이버 — argv 합성, `opencode run` 실행
│   │   ├── prompts.mjs             # 스테이지 spec 합성기 (시스템 + 컨텍스트 + 커맨드)
│   │   ├── render.mjs              # 결정적 PDF → PNG (렌더 + 리사이즈)
│   │   ├── meta.mjs  workspace.mjs phase.mjs  stage.mjs  args.mjs  i18n.mjs
│   └── commands/                   # 16 커맨드 + status (init-course, ingest, analyze, …)
└── assets/
    ├── prompts/                    # 포팅된 커맨드 지시문 + 공유 _system.md
    └── scripts/
        ├── render_pages.py         # PDF → PNG 렌더 + ≤1800px 리사이즈 (pdf2image + Pillow)
        └── vision_ocr.py           # 선택: ollama qwen3-vl 드라이버 + tesseract, --ocr=ollama|tesseract 용
```

---

## 설계 신념

1. **터미널은 수식에 약하다.** 하네스가 마크다운 파일을 만들고 당신이 읽는다(이상적으로 Obsidian에서).
2. **풀이 타이핑은 느리고 오류가 잦다.** 종이에 풀고 스캔하면 하네스가 로컬로 OCR한다.
3. **OCR 노이즈는 불가피하다.** 그래서 채점은 줄단위 대수가 아니라 전략 기반(패턴/변수/최종형)이다 — 실제 시험 채점관이 보는 것도 그것이다.
4. **패턴은 *당신* 코스의 솔루션에서 추출되어야 한다** — 일반 목록이 아니라.
5. **당신의 오답이 가장 가치 있는 학습 신호다** — 교재보다, 강의보다. 치트시트는 강의계획서가 아니라 `errors/log.md`에서 생성된다.
6. **HW 밀도가 시험을 말해준다.** 시간은 유한하니, 점수가 있는 곳에 써라.
7. **모든 것은 당신이 편집한다.** 패턴·weakmap·치트시트·오답 로그 — 전부 당신의 git 이력 속 평문 마크다운/YAML. 하네스는 발판, 학습 그래프는 당신 것.

---

## FAQ

**비수학 과목에도 되나요?**
문제-패턴 추출 중심이라 정량 분야(수학·물리·EE·CS이론·ML이론·통계·공학)에서 빛납니다. 역사·문학도 인제스트·요약은 되지만, 드릴 커맨드는 문제에 풀이 패턴이 있다고 가정합니다.

**한·영 혼합 자료는?**
됩니다. 인제스트·OCR이 `eng+kor`로 구성됩니다. 패턴·채점 응답이 원자료의 언어 혼합을 존중합니다. 인터페이스 언어는 `init-course`에서 코스별로 설정합니다.

**LLM에 그냥 공부 도와달라는 것과 뭐가 다른가요?**
코스별 영속성입니다. LLM 채팅은 2주 전 HW2에서 놓친 패턴도, 교수가 강조하는 섹션 랭킹도, "당신의 전형적 오답 타입"도 기억하지 못합니다. Paideia는 그 모두를 디스크의 마크다운에 씁니다. 오늘의 `paideia weakmap`은 코스 시작 이래 모든 `paideia grade`에서 정보를 받습니다 — `errors/log.md`가 추가 전용이기 때문입니다.

**왜 opencode 플러그인이 아니라 하네스인가요?**
플러그인은 한 에디터의 루프 안에 삽니다. 하네스는 학습 로직 자체를 소유하고 opencode를 교체 가능한 실행 엔진으로 구동합니다 — 그래서 같은 학습 그래프가 Claude Code·Codex·opencode 에디션에 걸쳐 이식됩니다. 모델에 보내는 정확한 지시(`.paideia/run/*.md`)를 읽을 수 있고, 어떤 스테이지든 `--dry-run`으로 재현할 수 있습니다.

**Ollama / Qwen3-VL가 필요한가요?**
아니요. 기본 OCR 엔진은 opencode 에이전트의 네이티브 비전 — 추가 설치 없음. Ollama + `qwen3-vl:8b`는 페이지 이미지를 기기에 두고 싶은 사용자용 선택지이고, `tesseract`는 최소 설치/타이핑 스캔용 세 번째 옵션입니다.

**내 데이터는 안전한가요?**
PDF·마크다운·오답·weakmap 모두 로컬 코스 폴더에 있습니다. 네트워크 트래픽은 OCR 엔진에 따라 다릅니다: `vision`은 페이지 이미지가 opencode가 설정한 모델 제공자를 거치고, `ollama`/`tesseract`는 아무것도 기기를 떠나지 않습니다.

---

## Connect

<p align="center">
  <a href="https://github.com/TaewoooPark"><img src="https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white&cacheSeconds=3600" alt="GitHub"></a>
  <a href="https://x.com/theoverstrcture"><img src="https://img.shields.io/badge/-X-000000?style=for-the-badge&logo=x&logoColor=white&cacheSeconds=3600" alt="X (Twitter)"></a>
  <a href="https://www.linkedin.com/in/taewoo-park-427a05352"><img src="https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white&cacheSeconds=3600" alt="LinkedIn"></a>
  <a href="https://taewoopark.com"><img src="https://img.shields.io/badge/-taewoopark.com-000000?style=for-the-badge&logo=safari&logoColor=white&cacheSeconds=3600" alt="Personal site"></a>
</p>

---

## 라이선스

MIT. 자유롭게 쓰세요. 당신의 코스에 맞게 포크·수정하세요 — 핵심은, 이것이 만드는 학습 그래프가 감내해야 할 고정 상품이 아니라 당신이 빚는 당신의 것이라는 점입니다.

개념·학습 모델·원본 Claude Code 플러그인: **[OPTIMETA/PAIDEIA](https://github.com/OPTIMETA/PAIDEIA)**. 실행 엔진: **[opencode](https://opencode.ai)**.

---

<p align="center">
  <em>일반 커리큘럼은 평균적인 학생을 가르친다. Παιδεία — 한 번에 한 학생씩의 형성.</em>
</p>
