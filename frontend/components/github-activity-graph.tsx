"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Static data for the GitHub activity
const githubData = [
  { month: "Jan", commits: 32, pullRequests: 18, issues: 12 },
  { month: "Feb", commits: 48, pullRequests: 28, issues: 20 },
  { month: "Mar", commits: 30, pullRequests: 18, issues: 15 },
  { month: "Apr", commits: 52, pullRequests: 32, issues: 22 },
  { month: "May", commits: 60, pullRequests: 40, issues: 28 },
  { month: "Jun", commits: 56, pullRequests: 38, issues: 25 },
  { month: "Jul", commits: 70, pullRequests: 52, issues: 32 },
  { month: "Aug", commits: 62, pullRequests: 48, issues: 30 },
  { month: "Sep", commits: 78, pullRequests: 56, issues: 35 },
  { month: "Oct", commits: 92, pullRequests: 62, issues: 42 },
  { month: "Nov", commits: 98, pullRequests: 70, issues: 48 },
  { month: "Dec", commits: 110, pullRequests: 75, issues: 52 },
]

interface GitHubActivityGraphProps {
  className?: string
  height?: number
}

export function GitHubActivityGraph({ className, height = 400 }: GitHubActivityGraphProps) {
  // Find the maximum value to set the y-axis domain
  const maxValue = Math.max(...githubData.map((data) => Math.max(data.commits, data.pullRequests, data.issues)))
  // Round up to the nearest 20 for a clean y-axis
  const yAxisMax = Math.ceil(maxValue / 20) * 20

  return (
    <Card className={`${className} bg-[#1a1f2a] border-gray-700`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">GitHub Activity</CardTitle>
        <CardDescription className="text-gray-400 text-xs">Repository activity over the past year</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={githubData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3548" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#888", fontSize: 10 }}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#888", fontSize: 10 }}
                tickMargin={8}
                domain={[0, yAxisMax]}
                tickCount={5}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#242a38",
                  border: "1px solid #3a4256",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  fontSize: "12px",
                  padding: "8px 10px"
                }}
                itemStyle={{ color: "white", fontSize: "11px", padding: "2px 0" }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px", color: "#d1d5db", fontSize: "12px" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", color: "#d1d5db" }}
              />
              <Line
                type="monotone"
                dataKey="commits"
                stroke="#00c8ff"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: "#00c8ff" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#00c8ff" }}
                name="Commits"
              />
              <Line
                type="monotone"
                dataKey="pullRequests"
                stroke="#b088ff"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: "#b088ff" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#b088ff" }}
                name="Pull Requests"
              />
              <Line
                type="monotone"
                dataKey="issues"
                stroke="#0080ff"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: "#0080ff" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#0080ff" }}
                name="Issues"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}