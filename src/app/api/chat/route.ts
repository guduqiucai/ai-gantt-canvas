import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { ProjectPlanSchema } from "@/lib/schema";

export const maxDuration = 60;

const deepseek = createOpenAICompatible({
  name: "deepseek",
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = {
  renderGanttChart: tool({
    description:
      "把用户的项目需求解析为结构化的项目计划（项目名称、说明、阶段、每个任务的起止日期与进度），用于在右侧画布渲染甘特图。只要用户提出了项目/计划/排期类需求，就必须调用本工具。",
    inputSchema: ProjectPlanSchema,
    execute: async () => ({ rendered: true }),
  }),
};

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek(process.env.OPENAI_MODEL ?? "deepseek-flash"),
    system:
      "你是一名 AI 项目规划专家，擅长把模糊需求拆解成可执行的任务与时间计划。收到项目规划需求时，先调用 renderGanttChart 工具生成结构化计划，再用一两句话说明整体思路。所有日期使用 YYYY-MM-DD 格式，任务进度初始为 0，回答使用中文。",
    tools,
    stopWhen: stepCountIs(2),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
