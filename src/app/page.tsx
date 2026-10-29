"use client";

import { supabase } from "@/lib/supabase";
import React, { useMemo, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  GanttChartSquare,
  Sparkles,
  Download,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { ProjectPlan, ProjectPlanSchema } from "@/lib/schema";
import { GanttCanvas } from "@/components/GanttCanvas";

/** 从消息历史里找出最近一次 renderGanttChart 工具的入参 */
function extractPlan(messages: UIMessage[]): ProjectPlan | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    for (let j = message.parts.length - 1; j >= 0; j--) {
      const part = message.parts[j] as { type: string; state?: string; input?: unknown };
      // input-streaming 状态下 input 只是残缺片段，必须等参数收全
      if (part.type !== "tool-renderGanttChart") continue;
      if (part.state !== "input-available" && part.state !== "output-available") continue;
      const parsed = ProjectPlanSchema.safeParse(part.input);
      if (parsed.success) return parsed.data;
    }
  }
  return null;
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");
}

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "submitted" || status === "streaming";
  const currentPlan = useMemo(() => extractPlan(messages), [messages]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCloud = async () => {
    if (!currentPlan) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("project_plans").insert({
        title: currentPlan.projectTitle,
        description: currentPlan.description,
        plan_data: currentPlan,
      });

      if (error) throw error;
      alert("🎉 项目计划成功保存到 Supabase 云端数据库！");
    } catch (err: any) {
      alert("保存失败: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* 1. 顶部 Header */}
      <header className="flex h-14 items-center justify-between border-b bg-white dark:bg-slate-900 px-4 shrink-0">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>AI Project Canvas</span>
          <span className="rounded bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
            v0.5-ToolCalling
          </span>
        </div>
        <div className="flex items-center gap-2">
           <Button
            variant="default"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!currentPlan || isSaving}
            onClick={handleSaveToCloud}
          >
            {isSaving ? "保存中..." : "保存到云端"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!currentPlan}
            onClick={() => {
              if (!currentPlan) return;
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(currentPlan, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `${currentPlan.projectTitle || "project-plan"}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            导出 JSON
          </Button>
        </div>
      </header>

      {/* 2. 主体可拖拽分屏区域 */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          {/* 左侧面板：AI 对话窗口 */}
          <ResizablePanel defaultSize="38" minSize="28" maxSize="55">
            <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r">
              <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-500">
                AI 规划助手 (Tool Calling Enabled)
              </div>

              {/* 消息列表 */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 text-sm mt-10 leading-relaxed">
                      💡 发送提示词体验 Tool Calling 自动生成：<br />
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
                        “帮我规划一个为期 2 个月的 Web3 跨链钱包研发项目”
                      </span>
                    </div>
                  )}
                  {messages.map((m) => {
                    const text = messageText(m);
                    const calledTool = m.parts.some(
                      (part) => (part as { type: string }).type === "tool-renderGanttChart",
                    );

                    return (
                      <div key={m.id} className="flex flex-col gap-2">
                        {(text || m.role === "user") && (
                          <div
                            className={`flex gap-3 text-sm ${
                              m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {m.role === "assistant" && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
                                <Bot className="h-4 w-4" />
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2.5 max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                                m.role === "user"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {text}
                            </div>
                            {m.role === "user" && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 显示 Tool Calling 触发提示卡片 */}
                        {calledTool && (
                          <div className="ml-11 max-w-[80%]">
                            <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5 text-xs text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300">
                              <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                              <span>已成功调用甘特图工具渲染看板</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 text-sm justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 animate-pulse">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 italic">
                        正在分析需求并生成结构化任务节点...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* 底部 Input 表单 */}
              <div className="p-4 border-t bg-white dark:bg-slate-900">
                <form onSubmit={submit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="例如：制定一个智能家居 APP 开发计划..."
                    className="flex-1 focus-visible:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </ResizablePanel>

          {/* 可拖拽手柄 */}
          <ResizableHandle withHandle />

          {/* 右侧面板：Generative UI 结构化数据展示区 */}
          <ResizablePanel defaultSize="62">
            <div className="flex h-full flex-col bg-slate-100/60 dark:bg-slate-950 p-4 overflow-hidden">
              <Card className="h-full flex flex-col shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-3 shrink-0">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5 text-indigo-600" />
                    {currentPlan ? currentPlan.projectTitle : "项目甘特图画布 (Generative Canvas)"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-auto">
                  <GanttCanvas plan={currentPlan} />
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
