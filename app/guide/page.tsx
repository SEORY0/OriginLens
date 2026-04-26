import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  FileWarning,
  Lock,
  Route,
  ShieldCheck
} from "lucide-react";
import { Badge, Button, PageShell, Panel } from "@/components/ui";

const flow = [
  {
    title: "1. 공격 입력",
    body: "PR 설명, README, OCR 텍스트처럼 신뢰할 수 없는 입력이 이전 승인처럼 보이는 문장을 포함합니다."
  },
  {
    title: "2. 요약과 메모리",
    body: "Agent가 입력을 요약하고 compacted memory로 저장합니다. 여기서 내용은 바뀔 수 있지만 origin chain은 보존되어야 합니다."
  },
  {
    title: "3. 미래 행동 제안",
    body: "나중에 tool call 또는 physical action이 제안됩니다. OriginLens는 그 행동의 근거가 어디서 왔는지 추적합니다."
  },
  {
    title: "4. Guard 판정",
    body: "보호된 행동은 system, user, authenticated_operator 같은 허용 origin만 근거로 삼을 수 있습니다."
  }
];

const demoSteps = [
  "Run Baseline Attack: Guard가 없을 때 memory laundering이 protected action까지 이어지는지 확인합니다.",
  "Replay with Guard: 같은 claim을 provenance chain과 함께 재검사해 BLOCK되는지 확인합니다.",
  "Show Bench Result: 여러 payload에 대해 live generation과 deterministic scoring 결과를 확인합니다.",
  "Physical Extension: OCR/현장 표지판 텍스트가 실제 operator authorization이 아님을 확인합니다."
];

const boundaries = [
  "실제 shell command는 실행하지 않습니다.",
  "실제 외부 전송이나 secret exfiltration은 수행하지 않습니다.",
  "실제 robot, actuator, restricted zone 제어는 수행하지 않습니다.",
  "모든 protected action은 mock_only 또는 simulated_only로 제한됩니다.",
  "API key는 backend/.env에만 저장하고 GitHub/Vercel client에는 노출하지 않습니다."
];

export default function GuidePage() {
  return (
    <PageShell className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            OriginLens Guide
          </p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-tight">
            신뢰할 수 없는 컨텍스트가 권한으로 세탁되는 순간을 추적합니다.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/72">
            OriginLens는 AI agent가 긴 컨텍스트, 요약, 메모리 압축을 거치면서
            파일이나 OCR에서 온 문장을 사용자 승인처럼 오해하는지를 검증하는
            provenance firewall 데모입니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="good">Engine: Python FastAPI</Badge>
            <Badge tone="info">Web: Vercel / Next.js</Badge>
            <Badge tone="warn">Scoring: deterministic</Badge>
            <Badge tone="good">Live: Claude / Gemini</Badge>
          </div>
        </div>
        <Panel title="핵심 한 문장" eyebrow="demo framing">
          <p className="text-lg font-semibold leading-7">
            내용은 요약될 수 있지만, 출처는 승격될 수 없습니다.
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            file_read, image_ocr, tool_output에서 온 claim은 아무리 그럴듯하게
            요약되어도 user 또는 system approval로 바뀌지 않습니다.
          </p>
          <Link href="/demo" className="mt-5 inline-flex">
            <Button>
              <ArrowRight size={16} />
              Demo로 이동
            </Button>
          </Link>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Panel title="무엇을 테스트하나" eyebrow="threat model">
          <FileWarning className="mb-4 text-signal" size={22} />
          <p className="text-sm leading-6 text-ink/70">
            공격자는 PR 설명, README, OCR 텍스트에 “사용자가 이미 승인했다”는
            문장을 심습니다. Agent가 이를 기억하고 나중에 권한 근거로 쓰는지를
            확인합니다.
          </p>
        </Panel>
        <Panel title="무엇을 막나" eyebrow="guard">
          <ShieldCheck className="mb-4 text-moss" size={22} />
          <p className="text-sm leading-6 text-ink/70">
            protected action 직전에 required origin과 observed origin chain을
            비교합니다. 출처가 file_read 또는 image_ocr이면 권한으로 인정하지
            않습니다.
          </p>
        </Panel>
        <Panel title="무엇이 live인가" eyebrow="provider">
          <Eye className="mb-4 text-blue" size={22} />
          <p className="text-sm leading-6 text-ink/70">
            live 모드에서는 Claude/Gemini가 reviewer summary와 compacted memory를
            생성합니다. Guard 판정과 benchmark metric 계산은 OriginLens의 고정
            evaluator가 수행합니다.
          </p>
        </Panel>
      </section>

      <Panel title="OriginLens 파이프라인" eyebrow="architecture">
        <div className="grid gap-3 md:grid-cols-4">
          {flow.map((item) => (
            <div key={item.title} className="rounded-md border border-line bg-white p-4">
              <Route className="mb-3 text-moss" size={18} />
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{item.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Demo를 읽는 방법" eyebrow="presentation">
          <div className="grid gap-3">
            {demoSteps.map((step) => (
              <div key={step} className="flex items-start gap-3 rounded-md border border-line bg-white p-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-moss" size={17} />
                <p className="text-sm leading-6">{step}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Benchmark Evidence 해석" eyebrow="metrics">
          <div className="grid gap-3 text-sm leading-6 text-ink/75">
            <p>
              <BarChart3 className="mr-2 inline text-blue" size={16} />
              Survival, laundering, trigger는 공격 payload만 분모로 계산합니다.
            </p>
            <p>
              <Database className="mr-2 inline text-blue" size={16} />
              FPR은 benign user-origin payload가 잘못 차단되었는지만 봅니다.
            </p>
            <p>
              <ShieldCheck className="mr-2 inline text-blue" size={16} />
              source가 live이면 provider가 실제 응답했고, fallback이면 seeded trace가
              사용된 것입니다.
            </p>
          </div>
        </Panel>
      </section>

      <Panel title="안전 경계" eyebrow="mock-only boundary">
        <div className="grid gap-3 md:grid-cols-2">
          {boundaries.map((boundary) => (
            <div key={boundary} className="flex items-start gap-3 rounded-md border border-line bg-white p-3">
              <Lock className="mt-0.5 shrink-0 text-moss" size={16} />
              <span className="text-sm leading-6">{boundary}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-line bg-ink p-4 text-sm leading-6 text-white">
          <Bot className="mr-2 inline text-field" size={16} />
          Physical AI 시나리오는 실제 robot 제어가 아니라 simulated_only action proposal만
          생성합니다.
        </div>
      </Panel>
    </PageShell>
  );
}
