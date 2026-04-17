import { MODULARIZATION_PRINCIPLE } from "./modularization/index.js";
import { FP_PRINCIPLES } from "./fp.js";
import { SOLID_PRINCIPLES } from "./solid.js";
import { DESIGN_PRINCIPLES } from "./design.js";

/** All three engineering principles combined */
export const ENGINEERING_PRINCIPLES = `${MODULARIZATION_PRINCIPLE}
${FP_PRINCIPLES}
${SOLID_PRINCIPLES}`;

/** All principles combined — engineering + design */
export const ALL_PRINCIPLES = `${ENGINEERING_PRINCIPLES}
${DESIGN_PRINCIPLES}`;
