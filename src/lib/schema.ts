import { z } from "zod";

// 单个任务的 Schema
export const TaskSchema = z.object({
  id: z.string().describe("任务唯一ID，如 task-1"),
  name: z.string().describe("任务名称"),
  startDate: z.string().describe("开始日期，格式 YYYY-MM-DD"),
  endDate: z.string().describe("结束日期，格式 YYYY-MM-DD"),
  progress: z.number().min(0).max(100).describe("完成进度 (0-100)"),
  assignee: z.string().optional().describe("负责人名称"),
});

// 单个阶段/里程碑的 Schema
export const StageSchema = z.object({
  id: z.string().describe("阶段唯一ID，如 stage-1"),
  title: z.string().describe("阶段/里程碑标题，如 '需求调研与设计'"),
  tasks: z.array(TaskSchema).describe("该阶段下的任务列表"),
});

// 完整的项目甘特图计划 Schema
export const ProjectPlanSchema = z.object({
  projectTitle: z.string().describe("项目总体名称"),
  description: z.string().describe("项目简要说明"),
  stages: z.array(StageSchema).describe("包含的所有阶段"),
});

// 导出 TypeScript 类型定义
export type Task = z.infer<typeof TaskSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;