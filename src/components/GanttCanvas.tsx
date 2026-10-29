"use client";

import React from "react";
import { ProjectPlan } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, User, Clock, Layers } from "lucide-react";

interface GanttCanvasProps {
  plan: ProjectPlan | null;
}

export function GanttCanvas({ plan }: GanttCanvasProps) {
  if (!plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 mb-3">
          <CalendarDays className="h-7 w-7" />
        </div>
        <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">暂无项目画布数据</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          请在左侧向 AI 发送项目规划指令（例如：“帮我制定一个 2 个月的小程序开发计划”），右侧将实时渲染可视化甘特图。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto pr-2 space-y-6">
      {/* 项目总览头部卡片 */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Layers className="h-4 w-4" />
          AI 生成的项目蓝图
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {plan.projectTitle}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* 阶段与甘特图时间轴列表 */}
      <div className="space-y-6">
        {plan.stages.map((stage, stageIdx) => (
          <Card key={stage.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="py-3.5 px-5 bg-slate-50/80 dark:bg-slate-900/80 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-mono">
                  {stageIdx + 1}
                </span>
                {stage.title}
              </CardTitle>
              <span className="text-xs text-slate-500 font-mono">
                {stage.tasks.length} 个核心任务
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {stage.tasks.map((task) => (
                <div key={task.id} className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                  {/* 任务顶栏信息 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                      {task.name}
                    </span>
                    <div className="flex items-center gap-3 text-slate-500 font-mono">
                      {task.assignee && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[11px]">
                          <User className="h-3 w-3" />
                          {task.assignee}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.startDate} ~ {task.endDate}
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  {/* 视觉进度条与时间轴表现 */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}