import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GITHUB_USERNAME = "vitorhugo-java";
const DAYS = 365;
const CELL_SIZE = 13;
const GAP = 3;

interface DayData {
  date: string;
  count: number;
  level: number; // 0-4
}

const fetchContributions = async (): Promise<DayData[]> => {
  // Use the GitHub events API to approximate contributions
  const allEvents: any[] = [];
  // Fetch multiple pages to get more data
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${page}`
    );
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    allEvents.push(...data);
  }

  // Count events per day
  const countMap: Record<string, number> = {};
  allEvents.forEach((event: any) => {
    const date = event.created_at.split("T")[0];
    countMap[date] = (countMap[date] || 0) + 1;
  });

  // Build day array for the last year
  const today = new Date();
  const days: DayData[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = countMap[dateStr] || 0;
    days.push({
      date: dateStr,
      count,
      level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
    });
  }
  return days;
};

const LEVEL_COLORS = [
  "hsl(220 14% 14%)",       // level 0 - empty
  "hsl(142 72% 25%)",       // level 1
  "hsl(142 72% 35%)",       // level 2
  "hsl(142 72% 45%)",       // level 3
  "hsl(142 72% 55%)",       // level 4
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_LABELS = ["Mon", "Wed", "Fri"];

const ContributionHeatmap = () => {
  const { data: days, isLoading, error } = useQuery({
    queryKey: ["contribution-heatmap"],
    queryFn: fetchContributions,
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="container max-w-5xl mx-auto">
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </section>
    );
  }

  if (error || !days) return null;

  // Organize into weeks (columns)
  // First day should be a Sunday to align the grid
  const firstDate = new Date(days[0].date);
  const startDow = firstDate.getDay(); // 0=Sun
  const padded: (DayData | null)[] = [
    ...Array(startDow).fill(null),
    ...days,
  ];

  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels
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
  const labelOffset = 30;

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

        <div className="rounded-lg border border-border bg-card p-6 overflow-x-auto">
          <TooltipProvider delayDuration={100}>
            <svg
              width={gridWidth + labelOffset + 10}
              height={gridHeight + 30}
              className="block"
            >
              {/* Month labels */}
              {monthLabels.map((m) => (
                <text
                  key={`${m.label}-${m.col}`}
                  x={labelOffset + m.col * (CELL_SIZE + GAP)}
                  y={10}
                  className="fill-muted-foreground"
                  style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                >
                  {m.label}
                </text>
              ))}

              {/* Day labels */}
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

              {/* Cells */}
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (!day) return null;
                  const x = labelOffset + wi * (CELL_SIZE + GAP);
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

          {/* Legend */}
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
