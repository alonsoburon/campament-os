"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type TooltipValue = number | string | readonly (number | string)[];
type TooltipName = string | number;

type TooltipPayloadItem = {
  color?: string;
  dataKey?: TooltipName;
  fill?: string;
  name?: TooltipName;
  payload?: (Record<string, unknown> & { fill?: string }) | undefined;
  value?: TooltipValue;
};

type FormatterFn = (
  value: TooltipValue,
  name: TooltipName,
  item: TooltipPayloadItem,
  index: number,
  payload: TooltipPayloadItem["payload"],
) => React.ReactNode;

type LabelFormatterFn = (
  value: React.ReactNode,
  payload: TooltipPayloadItem[],
) => React.ReactNode;

type LegendPayloadItem = {
  color?: string;
  dataKey?: TooltipName;
  value?: React.ReactNode;
  payload?: Record<string, unknown>;
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme ?? itemConfig.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: LabelFormatterFn;
  labelClassName?: string;
  formatter?: FormatterFn;
  color?: string;
  nameKey?: string;
  labelKey?: string;
};

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...divProps
}: ChartTooltipContentProps) {
  const { config } = useChart();
  const payloadItems = React.useMemo(
    () =>
      Array.isArray(payload) ? payload.filter(isTooltipPayloadItem) : [],
    [payload],
  );

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || payloadItems.length === 0) {
      return null;
    }

    const [item] = payloadItems;
    const key = String(labelKey ?? item.dataKey ?? item.name ?? "value");
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    let resolvedLabel: React.ReactNode = itemConfig?.label;

    if (!labelKey && typeof label === "string") {
      resolvedLabel = Object.prototype.hasOwnProperty.call(config, label)
        ? config[label]?.label ?? label
        : label;
    }

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(resolvedLabel ?? label ?? key, payloadItems)}
        </div>
      );
    }

    if (resolvedLabel == null) {
      return null;
    }

    return (
      <div className={cn("font-medium", labelClassName)}>{resolvedLabel}</div>
    );
  }, [
    label,
    labelFormatter,
    payloadItems,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || payloadItems.length === 0) {
    return null;
  }

  const nestLabel = payloadItems.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
      {...divProps}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payloadItems.map((item, index) => {
          const key = String(nameKey ?? item.name ?? item.dataKey ?? "value");
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor =
            color ?? item.payload?.fill ?? item.color ?? item.fill;
          const indicatorStyle: React.CSSProperties | undefined =
            indicatorColor
              ? {
                  "--color-bg": indicatorColor,
                  "--color-border": indicatorColor,
                }
              : undefined;
          const formattedValue = formatTooltipValue(item.value);

          return (
            <div
              key={String(item.dataKey ?? item.name ?? index)}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter &&
              item.value !== undefined &&
              item.name !== undefined ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={indicatorStyle}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>
                    {formattedValue !== null && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {formattedValue}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  ...divProps
}: React.HTMLAttributes<HTMLDivElement> & {
  hideIcon?: boolean;
  payload?: LegendPayloadItem[];
  verticalAlign?: RechartsPrimitive.LegendProps["verticalAlign"];
  nameKey?: string;
}) {
  const { config } = useChart();
  const payloadItems = Array.isArray(payload)
    ? payload.filter(isLegendPayloadItem)
    : [];

  if (!payloadItems.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
      {...divProps}
    >
      {payloadItems.map((item, index) => {
        const key = String(nameKey ?? item.dataKey ?? "value");
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={`legend-${String(item.dataKey ?? index)}`}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color ?? "var(--chart-color, currentColor)",
                }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (!isRecord(payload)) {
    return undefined;
  }

  const payloadRecord = payload;

  const nestedPayload = isRecord(payloadRecord.payload)
    ? payloadRecord.payload
    : undefined;

  let configLabelKey: string = key;

  if (key in payloadRecord) {
    const candidate = payloadRecord[key];
    if (typeof candidate === "string") {
      configLabelKey = candidate;
    }
  } else if (nestedPayload && key in nestedPayload) {
    const nestedValue = nestedPayload[key];
    if (typeof nestedValue === "string") {
      configLabelKey = nestedValue;
    }
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

function isTooltipPayloadItem(value: unknown): value is TooltipPayloadItem {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value;
  const rawValue = candidate.value;

  const isValidValue =
    rawValue === undefined ||
    typeof rawValue === "number" ||
    typeof rawValue === "string" ||
    (Array.isArray(rawValue) && rawValue.every(isTooltipPrimitive));

  if (!isValidValue) {
    return false;
  }

  if (candidate.payload !== undefined && !isRecord(candidate.payload)) {
    return false;
  }

  if (
    candidate.dataKey !== undefined &&
    !isTooltipName(candidate.dataKey)
  ) {
    return false;
  }

  if (candidate.name !== undefined && !isTooltipName(candidate.name)) {
    return false;
  }

  if (candidate.color !== undefined && typeof candidate.color !== "string") {
    return false;
  }

  if (candidate.fill !== undefined && typeof candidate.fill !== "string") {
    return false;
  }

  return true;
}

function isLegendPayloadItem(value: unknown): value is LegendPayloadItem {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value;

  if (candidate.payload !== undefined && !isRecord(candidate.payload)) {
    return false;
  }

  if (
    candidate.dataKey !== undefined &&
    !isTooltipName(candidate.dataKey)
  ) {
    return false;
  }

  if (candidate.color !== undefined && typeof candidate.color !== "string") {
    return false;
  }

  return true;
}

function formatTooltipValue(
  value: TooltipPayloadItem["value"],
): string | null {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const safeValues = value.filter(isTooltipPrimitive);
    return safeValues.map((item) => `${item}`).join(", ");
  }

  return null;
}

function isTooltipPrimitive(value: unknown): value is number | string {
  return typeof value === "number" || typeof value === "string";
}

function isTooltipName(value: unknown): value is TooltipName {
  return typeof value === "string" || typeof value === "number";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
