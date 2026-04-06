import { useRef, useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useContributions, DayData } from "@/hooks/useGitHubData";

const CELL_SIZE = 13;
const GAP = 3;
const LABEL_OFFSET = 30;

const LEVEL_COLORS = [
  "hsl(220 14% 14%)",
  "hsl(142 72% 25%)",
  "hsl(142 72% 35%)",
  "hsl(142 72% 45%)",
  "hsl(142 72% 55%)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_LABELS = ["Mon", "Wed", "Fri"];

const ContributionHeatmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxWeeks, setMaxWeeks] = useState(52);

  const updateMaxWeeks = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth - 48; // padding
    const available = width - LABEL_OFFSET - 10;
    const weeks = Math.max(4, Math.floor(available / (CELL_SIZE + GAP)));
    setMaxWeeks(weeks);
  }, []);

  useEffect(() => {
    updateMaxWeeks();
    const observer = new ResizeObserver(updateMaxWeeks);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateMaxWeeks]);

  const { data: days, isLoading, error } = useContributions();

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="container max-w-5xl mx-auto">
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </section>
    );
  }

  if (error || !days || days.length === 0) return null;

  // Trim days to fit maxWeeks
  const visibleDays = days.slice(-(maxWeeks * 7));

  const firstDate = new Date(visibleDays[0].date);
  const startDow = firstDate.getDay();
  const padded: (DayData | null)[] = [...Array(startDow).fill(null), ...visibleDays];

  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const validDay = week.find((d) => d !== null);
    if (validDay) {
      const m = new Date(validDay.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTHS[m], col: wi });
        lastMonth = m;
      }
    }
  });

  const gridWidth = weeks.length * (CELL_SIZE + GAP);
  const gridHeight = 7 * (CELL_SIZE + GAP);

  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-primary text-sm">{">"}</span>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Contribution Activity
          </h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        <div ref={containerRef} className="rounded-lg border border-border bg-card p-6">
          <TooltipProvider delayDuration={100}>
            <svg
              width={gridWidth + LABEL_OFFSET + 10}
              height={gridHeight + 30}
              className="block"
            >
              {monthLabels.map((m) => (
                <text
                  key={`${m.label}-${m.col}`}
                  x={LABEL_OFFSET + m.col * (CELL_SIZE + GAP)}
                  y={10}
                  className="fill-muted-foreground"
                  style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                >
                  {m.label}
                </text>
              ))}

              {DAYS_LABELS.map((label, i) => (
                <text
                  key={label}
                  x={0}
                  y={20 + (i * 2 + 1) * (CELL_SIZE + GAP) + CELL_SIZE * 0.75}
                  className="fill-muted-foreground"
                  style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                >
                  {label}
                </text>
              ))}

              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (!day) return null;
                  const x = LABEL_OFFSET + wi * (CELL_SIZE + GAP);
                  const y = 20 + di * (CELL_SIZE + GAP);
                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <rect
                          x={x}
                          y={y}
                          width={CELL_SIZE}
                          height={CELL_SIZE}
                          rx={2}
                          fill={LEVEL_COLORS[day.level]}
                          className="transition-colors hover:stroke-foreground hover:stroke-1 cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs font-mono">
                        <p>{day.count} contribution{day.count !== 1 ? "s" : ""} on {day.date}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}
            </svg>
          </TooltipProvider>

          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground font-mono">
            <span>Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionHeatmap;
