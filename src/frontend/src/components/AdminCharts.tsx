import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useI18n } from "@/i18n";
import { formatNumber, formatPrice } from "@/lib/format";
import type { AdminOverview } from "@/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  paid: "oklch(var(--chart-1))",
  pending: "oklch(var(--chart-3))",
  cancelled: "oklch(var(--chart-4))",
};

const STATUS_LABEL_KEYS = {
  paid: "status.paid",
  pending: "status.pending",
  cancelled: "status.cancelled",
} as const;

type StatusKey = keyof typeof STATUS_LABEL_KEYS;

function isStatusKey(value: string): value is StatusKey {
  return value in STATUS_LABEL_KEYS;
}

const revenueConfig = {
  amountDt: { label: "DT", color: "oklch(var(--chart-1))" },
} satisfies ChartConfig;

const statusConfig = {
  count: { label: "Total", color: "oklch(var(--chart-2))" },
} satisfies ChartConfig;

export function RevenueChart({
  data,
}: { data: AdminOverview["revenueByMonth"] }) {
  const { t, language } = useI18n();

  return (
    <Card
      className="gap-4 rounded-lg border-border p-5 shadow-subtle"
      data-ocid="admin.revenue_chart"
    >
      <div>
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.revenueChart")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("admin.revenueChartHint")}
        </p>
      </div>

      {data.length === 0 ? (
        <p
          className="grid h-56 place-items-center text-sm text-muted-foreground"
          data-ocid="admin.revenue_chart.empty_state"
        >
          {t("admin.noData")}
        </p>
      ) : (
        <ChartContainer config={revenueConfig} className="h-56 w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value: number) => formatNumber(value, language)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatPrice(Number(value), language)}
                />
              }
            />
            <Bar
              dataKey="amountDt"
              fill="var(--color-amountDt)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}

export function BookingsStatusChart({
  data,
}: {
  data: AdminOverview["bookingsByStatus"];
}) {
  const { t, language } = useI18n();

  const chartData = data.map(([status, count]) => ({
    status,
    label: isStatusKey(status) ? t(STATUS_LABEL_KEYS[status]) : status,
    count: Number(count),
    fill: STATUS_COLORS[status] ?? "oklch(var(--chart-5))",
  }));

  const total = chartData.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card
      className="gap-4 rounded-lg border-border p-5 shadow-subtle"
      data-ocid="admin.status_chart"
    >
      <div>
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.statusChart")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("admin.statusChartHint")}
        </p>
      </div>

      {total === 0 ? (
        <p
          className="grid h-56 place-items-center text-sm text-muted-foreground"
          data-ocid="admin.status_chart.empty_state"
        >
          {t("admin.noData")}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ChartContainer
            config={statusConfig}
            className="h-48 w-full sm:w-1/2"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="label" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={44}
                outerRadius={72}
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="w-full space-y-2 sm:w-1/2">
            {chartData.map((entry) => (
              <li
                key={entry.status}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                data-ocid={`admin.status_row.${entry.status}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium">
                    {entry.label}
                  </span>
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatNumber(entry.count, language)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
