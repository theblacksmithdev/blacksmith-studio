import { spacing, radii } from "@/components/shared/ui";

export const bubbleTokens = {
  maxWidthUser: "78%",
  maxWidthAgent: "88%",
  paddingY: spacing.sm,
  paddingX: spacing.lg,
  radius: {
    user: `${radii["2xl"]} ${radii["2xl"]} ${radii.xs} ${radii["2xl"]}`,
    agent: `${radii.xs} ${radii["2xl"]} ${radii["2xl"]} ${radii["2xl"]}`,
    neutral: radii["2xl"],
    pill: radii.full,
  },
  enter: {
    duration: 220,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export const bubbleKeyframes = {
  animationName: "studio-bubble-in",
  css: `
    @keyframes studio-bubble-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes studio-thinking-dot {
      0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-2px); }
    }
  `,
};
