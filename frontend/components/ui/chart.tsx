import type React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export const Chart = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <LineChart data={[]}>{children}</LineChart>
    </ResponsiveContainer>
  )
}

export const ChartContainer = ({
  children,
  className,
  style,
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export const ChartGrid = ({ vertical }: { vertical?: boolean }) => {
  return <CartesianGrid stroke="#ccc" vertical={vertical} horizontal={true} />
}

export const ChartLine = ({
  dataKey,
  stroke,
  strokeWidth,
  dot,
  activeDot,
  type,
  data,
}: { dataKey: string; stroke: string; strokeWidth: number; dot: any; activeDot: any; type: string; data: any[] }) => {
  return (
    <Line
      type={type}
      dataKey={dataKey}
      stroke={stroke}
      strokeWidth={strokeWidth}
      dot={dot}
      activeDot={activeDot}
      data={data}
    />
  )
}

export const ChartXAxis = ({
  dataKey,
  tickLine,
  axisLine,
  tick,
  tickMargin,
}: { dataKey: string; tickLine: boolean; axisLine: boolean; tick: any; tickMargin: number }) => {
  return <XAxis dataKey={dataKey} tickLine={tickLine} axisLine={axisLine} tick={tick} tickMargin={tickMargin} />
}

export const ChartYAxis = ({
  tickLine,
  axisLine,
  tick,
  tickMargin,
  domain,
  tickCount,
}: { tickLine: boolean; axisLine: boolean; tick: any; tickMargin: number; domain: number[]; tickCount: number }) => {
  return (
    <YAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tick={tick}
      tickMargin={tickMargin}
      domain={domain}
      tickCount={tickCount}
    />
  )
}

export const ChartTooltip = ({ content }: { content: any }) => {
  return <Tooltip content={content} />
}

export const ChartTooltipContent = ({
  title,
  items,
  className,
}: { title: string; items: any[]; className?: string }) => {
  return (
    <div className={className}>
      <p className="font-bold">{title}</p>
      {items.map((item, index) => (
        <p key={index} style={{ color: item.color }}>
          {item.label}: {item.value}
        </p>
      ))}
    </div>
  )
}
