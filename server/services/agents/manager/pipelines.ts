import type { AgentRole } from "../types.js";

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  steps: {
    role: AgentRole;
    promptTemplate: string;
    dependsOn: number | null;
  }[];
}

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: "feature",
    name: "Full Feature Pipeline",
    description:
      "Architect designs → Fullstack implements → QA tests → Reviewer signs off",
    steps: [
      {
        role: "architect",
        promptTemplate: "Design the architecture for: {prompt}",
        dependsOn: null,
      },
      {
        role: "fullstack-engineer",
        promptTemplate:
          "Implement the following feature based on this architecture:\n\n{previous_result}\n\nOriginal request: {prompt}",
        dependsOn: 0,
      },
      {
        role: "qa-engineer",
        promptTemplate:
          "Write tests for the feature that was just implemented: {prompt}",
        dependsOn: 1,
      },
      {
        role: "code-reviewer",
        promptTemplate: "Review the code changes for: {prompt}",
        dependsOn: 2,
      },
    ],
  },
  {
    id: "frontend-feature",
    name: "Frontend Feature Pipeline",
    description: "Designer designs → Frontend implements → QA tests",
    steps: [
      {
        role: "ui-designer",
        promptTemplate: "Design the UI for: {prompt}",
        dependsOn: null,
      },
      {
        role: "frontend-engineer",
        promptTemplate:
          "Implement the following UI based on this design:\n\n{previous_result}\n\nOriginal request: {prompt}",
        dependsOn: 0,
      },
      {
        role: "qa-engineer",
        promptTemplate: "Write frontend tests for: {prompt}",
        dependsOn: 1,
      },
    ],
  },
  {
    id: "backend-feature",
    name: "Backend Feature Pipeline",
    description:
      "DB engineer designs schema → Backend implements → QA tests → Security reviews",
    steps: [
      {
        role: "database-engineer",
        promptTemplate: "Design the data model and migrations for: {prompt}",
        dependsOn: null,
      },
      {
        role: "backend-engineer",
        promptTemplate:
          "Implement the API and business logic using this schema:\n\n{previous_result}\n\nOriginal request: {prompt}",
        dependsOn: 0,
      },
      {
        role: "qa-engineer",
        promptTemplate: "Write backend tests for: {prompt}",
        dependsOn: 1,
      },
      {
        role: "security-engineer",
        promptTemplate: "Security review the backend changes for: {prompt}",
        dependsOn: 2,
      },
    ],
  },
  {
    id: "review",
    name: "Review Pipeline",
    description: "Code review → Security audit",
    steps: [
      {
        role: "code-reviewer",
        promptTemplate: "Review the recent code changes: {prompt}",
        dependsOn: null,
      },
      {
        role: "security-engineer",
        promptTemplate: "Security audit the recent changes: {prompt}",
        dependsOn: null,
      },
    ],
  },
  {
    id: "ship",
    name: "Ship Readiness",
    description:
      "QA runs tests → Reviewer checks code → Technical writer updates docs",
    steps: [
      {
        role: "qa-engineer",
        promptTemplate: "Run all tests and report status for: {prompt}",
        dependsOn: null,
      },
      {
        role: "code-reviewer",
        promptTemplate: "Final code review for shipping: {prompt}",
        dependsOn: null,
      },
      {
        role: "technical-writer",
        promptTemplate: "Update documentation for the changes in: {prompt}",
        dependsOn: 1,
      },
    ],
  },
];
