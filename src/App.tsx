import { useMemo, useState } from "react";
import { crimeData, type CrimeDatum } from "./crimeData";

type Metric = "total" | "prosecution" | "nonProsecution" | "police";

const metrics: { key: Metric; label: string; color: string }[] = [
  { key: "total", label: "전체", color: "#ff725e" },
  { key: "prosecution", label: "기소", color: "#5278ff" },
  { key: "nonProsecution", label: "불기소", color: "#21b89a" },
  { key: "police", label: "경찰 결정", color: "#a576e8" },
];

const summary = [
  ["전체 사건", "40,597"],
  ["형법범", "21,581"],
  ["특별법범", "19,016"],
  ["기소", "15,235"],
];

const format = (value: number) => value.toLocaleString("ko-KR");

export default function App() {
  const [count, setCount] = useState(10);
  const [group, setGroup] = useState("전체");
  const [visible, setVisible] = useState<Set<Metric>>(
    new Set(["total", "prosecution", "nonProsecution"]),
  );
  const [hovered, setHovered] = useState<number | null>(null);

  const data = useMemo(
    () =>
      crimeData
        .filter((item) => group === "전체" || item.group === group)
        .slice(0, count),
    [count, group],
  );

  const width = 1120;
  const height = 430;
  const pad = { top: 24, right: 22, bottom: 92, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.ceil(Math.max(...data.map((d) => d.total)) / 1000) * 1000;
  const x = (index: number) =>
    pad.left + (data.length === 1 ? plotW / 2 : (index / (data.length - 1)) * plotW);
  const y = (value: number) => pad.top + plotH - (value / max) * plotH;

  const toggle = (key: Metric) => {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
      <header className="border-b border-[#e5e7ec] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#172033] text-white">
              <ChartIcon />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7b8497]">
                KOREA CRIME DATA
              </p>
              <p className="text-sm font-bold">외국인 범죄 통계</p>
            </div>
          </div>
          <span className="rounded-full bg-[#f1f3f6] px-3 py-1.5 text-xs font-semibold text-[#667085]">
            2024년 기준
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10 lg:py-14">
        <section className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold tracking-[0.16em] text-[#e75e4d]">
            처분결과 현황
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-[42px] sm:leading-[1.16]">
            범죄별 처분 결과를
            <br className="hidden sm:block" /> 한눈에 비교해 보세요
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#697386]">
            범죄 발생 규모가 큰 순서로 정렬한 통계청 외국인 범죄자 처분결과입니다.
          </p>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summary.map(([label, value], index) => (
            <article
              key={label}
              className={`rounded-2xl border p-5 sm:p-6 ${
                index === 0
                  ? "border-[#172033] bg-[#172033] text-white"
                  : "border-[#e4e7ec] bg-white"
              }`}
            >
              <p className={`text-xs font-semibold ${index === 0 ? "text-[#aeb7c8]" : "text-[#7c8597]"}`}>
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {value}
                <span className="ml-1 text-xs font-medium opacity-60">명</span>
              </p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#e2e5ea] bg-white shadow-[0_12px_40px_rgba(27,35,52,0.06)]">
          <div className="flex flex-col gap-5 border-b border-[#eceef2] p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-lg font-bold">범죄별 처분 추이</p>
              <p className="mt-1 text-xs text-[#8a93a3]">단위: 명 · 합계 기준 내림차순</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Control
                label="범죄군"
                options={["전체", "형법범", "특별법범"]}
                value={group}
                onChange={(value) => setGroup(value)}
              />
              <Control
                label="표시"
                options={["10", "15", "20"]}
                value={String(count)}
                onChange={(value) => setCount(Number(value))}
                suffix="개"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 pt-5 sm:px-7">
            {metrics.map((metric) => {
              const active = visible.has(metric.key);
              return (
                <button
                  key={metric.key}
                  onClick={() => toggle(metric.key)}
                  className={`flex items-center gap-2 text-xs font-semibold transition ${
                    active ? "text-[#344054]" : "text-[#aeb4c0]"
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className="size-2.5 rounded-full transition"
                    style={{ background: active ? metric.color : "#d6d9df" }}
                  />
                  {metric.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto px-3 pb-4 pt-2 sm:px-6">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="min-w-[820px]"
              role="img"
              aria-label="범죄별 외국인 범죄자 처분 결과 선그래프"
              onMouseLeave={() => setHovered(null)}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const value = max * (1 - ratio);
                const lineY = pad.top + plotH * ratio;
                return (
                  <g key={ratio}>
                    <line
                      x1={pad.left}
                      x2={width - pad.right}
                      y1={lineY}
                      y2={lineY}
                      stroke="#eceef2"
                      strokeDasharray={ratio === 1 ? "0" : "4 5"}
                    />
                    <text x={pad.left - 12} y={lineY + 4} textAnchor="end" className="chart-axis">
                      {format(value)}
                    </text>
                  </g>
                );
              })}

              {hovered !== null && (
                <line
                  x1={x(hovered)}
                  x2={x(hovered)}
                  y1={pad.top}
                  y2={pad.top + plotH}
                  stroke="#cfd4dd"
                  strokeDasharray="3 4"
                />
              )}

              {metrics.filter((m) => visible.has(m.key)).map((metric) => {
                const points = data.map((item, index) => `${x(index)},${y(item[metric.key])}`).join(" ");
                return (
                  <g key={metric.key}>
                    <polyline
                      points={points}
                      fill="none"
                      stroke={metric.color}
                      strokeWidth={metric.key === "total" ? 3.5 : 2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {data.map((item, index) => (
                      <circle
                        key={item.name}
                        cx={x(index)}
                        cy={y(item[metric.key])}
                        r={hovered === index ? 5 : 3.5}
                        fill="white"
                        stroke={metric.color}
                        strokeWidth="2.5"
                      />
                    ))}
                  </g>
                );
              })}

              {data.map((item, index) => (
                <g key={item.name}>
                  <rect
                    x={x(index) - Math.max(28, plotW / data.length / 2)}
                    y={pad.top}
                    width={Math.max(56, plotW / data.length)}
                    height={plotH + 60}
                    fill="transparent"
                    onMouseEnter={() => setHovered(index)}
                  />
                  <text
                    x={x(index)}
                    y={pad.top + plotH + 25}
                    textAnchor="end"
                    transform={`rotate(-38 ${x(index)} ${pad.top + plotH + 25})`}
                    className="chart-label"
                  >
                    {item.name.length > 12 ? `${item.name.slice(0, 12)}…` : item.name}
                  </text>
                </g>
              ))}

              {hovered !== null && (
                <ChartTooltip item={data[hovered]} index={hovered} xPos={x(hovered)} metrics={metrics} />
              )}
            </svg>
          </div>
        </section>
        <p className="mt-4 text-right text-[11px] text-[#98a0ae]">
          출처: 통계청 국가통계포털 · 외국인범죄자 처분결과 (2024)
        </p>
      </div>
    </main>
  );
}

function Control({
  label,
  options,
  value,
  onChange,
  suffix = "",
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center rounded-xl bg-[#f3f5f7] p-1">
      <span className="px-2 text-[11px] font-semibold text-[#8b94a4]">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === option ? "bg-white text-[#172033] shadow-sm" : "text-[#8992a2] hover:text-[#4b5565]"
          }`}
        >
          {option}{suffix}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({
  item,
  index,
  xPos,
  metrics,
}: {
  item: CrimeDatum;
  index: number;
  xPos: number;
  metrics: { key: Metric; label: string; color: string }[];
}) {
  const boxX = index > 6 ? xPos - 184 : xPos + 14;
  return (
    <g className="pointer-events-none">
      <rect x={boxX} y={36} width="170" height="126" rx="12" fill="#172033" opacity=".97" />
      <text x={boxX + 14} y={58} className="tooltip-title">
        {item.name.length > 15 ? `${item.name.slice(0, 15)}…` : item.name}
      </text>
      {metrics.map((metric, i) => (
        <g key={metric.key}>
          <circle cx={boxX + 16} cy={80 + i * 20} r="3" fill={metric.color} />
          <text x={boxX + 26} y={84 + i * 20} className="tooltip-label">{metric.label}</text>
          <text x={boxX + 156} y={84 + i * 20} textAnchor="end" className="tooltip-value">
            {format(item[metric.key])}
          </text>
        </g>
      ))}
    </g>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 14.5 6.4 10l3 2.2 5.8-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.4" cy="10" r="1.2" fill="currentColor" />
      <circle cx="9.4" cy="12.2" r="1.2" fill="currentColor" />
      <circle cx="15.2" cy="5.2" r="1.2" fill="currentColor" />
    </svg>
  );
}
