import { PHYSICS } from "@/lib/physics";
import { convert } from "@/lib/physics";
import { roundPhysics } from "../../utils/physics-values";
import type { ConstantRecord, ConversionPractice, FormulaIndexEntry, GraphPracticeItem, LabDesignQuestion, SafetyReminder, ScaleComparison, TablePracticeItem, UnitRecord } from "../types";

export function createFormulaIndex(): FormulaIndexEntry[] {
  return [
    { id: "fx-fma", latex: "F=ma", plainText: "F_net = ma", topicId: "dynamics", conceptId: "newtons-laws", variables: [{ symbol: "F", unit: "N" }, { symbol: "m", unit: "kg" }, { symbol: "a", unit: "m/s²" }], simulationId: "sim-kinematics-track" },
    { id: "fx-vat", latex: "v=v_0+at", plainText: "v = v0 + at", topicId: "kinematics", conceptId: "kinematics", variables: [{ symbol: "v", unit: "m/s" }] },
    { id: "fx-xat", latex: "x=x_0+v_0t+\\tfrac12 at^2", plainText: "x = x0 + v0 t + 1/2 a t^2", topicId: "kinematics", conceptId: "kinematics", variables: [{ symbol: "x", unit: "m" }] },
    { id: "fx-p", latex: "p=mv", plainText: "p = mv", topicId: "momentum", conceptId: "momentum", variables: [{ symbol: "p", unit: "kg·m/s" }] },
    { id: "fx-k", latex: "K=\\tfrac12 mv^2", plainText: "K = 1/2 mv^2", topicId: "energy", conceptId: "kinetic-energy", variables: [{ symbol: "K", unit: "J" }] },
    { id: "fx-u", latex: "U=mgh", plainText: "U = mgh", topicId: "energy", conceptId: "gravitational-energy", variables: [{ symbol: "U", unit: "J" }] },
    { id: "fx-ohm", latex: "V=IR", plainText: "V = IR", topicId: "circuits", conceptId: "ohms-law", variables: [{ symbol: "V", unit: "V" }], simulationId: "sim-circuit" },
    { id: "fx-wave", latex: "v=f\\lambda", plainText: "v = f λ", topicId: "waves", conceptId: "wave-motion", variables: [{ symbol: "v", unit: "m/s" }] },
    { id: "fx-snell", latex: "n_1\\sin\\theta_1=n_2\\sin\\theta_2", plainText: "n1 sinθ1 = n2 sinθ2", topicId: "optics", conceptId: "snells-law", variables: [{ symbol: "n", unit: "1" }], simulationId: "sim-optics" },
    { id: "fx-period", latex: "T=2\\pi\\sqrt{L/g}", plainText: "T = 2π√(L/g)", topicId: "oscillations", conceptId: "pendulum", variables: [{ symbol: "T", unit: "s" }], simulationId: "sim-pendulum" },
    { id: "fx-photon", latex: "E=hf", plainText: "E = hf", topicId: "modern-physics", conceptId: "photons", variables: [{ symbol: "E", unit: "J" }] },
    { id: "fx-emc", latex: "E=mc^2", plainText: "E = mc^2", topicId: "relativity", conceptId: "mass-energy", variables: [{ symbol: "E", unit: "J" }] },
    { id: "fx-escape", latex: "v=\\sqrt{2GM/r}", plainText: "v_esc = √(2GM/r)", topicId: "gravitation", conceptId: "escape-velocity", variables: [{ symbol: "v", unit: "m/s" }] },
    { id: "fx-ideal", latex: "PV=nRT", plainText: "PV = nRT", topicId: "thermodynamics", conceptId: "ideal-gas-law", variables: [{ symbol: "P", unit: "Pa" }] },
    { id: "fx-lens", latex: "1/f=1/d_o+1/d_i", plainText: "1/f = 1/do + 1/di", topicId: "optics", conceptId: "thin-lenses", variables: [{ symbol: "f", unit: "m" }] },
  ];
}

export function createUnitRecords(): UnitRecord[] {
  return [
    { id: "u-m", symbol: "m", name: "metre", kind: "si-base" },
    { id: "u-s", symbol: "s", name: "second", kind: "si-base" },
    { id: "u-kg", symbol: "kg", name: "kilogram", kind: "si-base" },
    { id: "u-A", symbol: "A", name: "ampere", kind: "si-base" },
    { id: "u-K", symbol: "K", name: "kelvin", kind: "si-base" },
    { id: "u-N", symbol: "N", name: "newton", kind: "derived", siEquivalent: "kg·m/s²" },
    { id: "u-J", symbol: "J", name: "joule", kind: "derived", siEquivalent: "N·m" },
    { id: "u-W", symbol: "W", name: "watt", kind: "derived", siEquivalent: "J/s" },
    { id: "u-Pa", symbol: "Pa", name: "pascal", kind: "derived", siEquivalent: "N/m²" },
    { id: "u-V", symbol: "V", name: "volt", kind: "derived", siEquivalent: "J/C" },
    { id: "u-ohm", symbol: "Ω", name: "ohm", kind: "derived", siEquivalent: "V/A" },
    { id: "u-Hz", symbol: "Hz", name: "hertz", kind: "derived", siEquivalent: "1/s" },
    { id: "u-kilo", symbol: "k", name: "kilo (10³)", kind: "prefix" },
    { id: "u-milli", symbol: "m", name: "milli (10⁻³)", kind: "prefix" },
    { id: "u-micro", symbol: "μ", name: "micro (10⁻⁶)", kind: "prefix" },
    { id: "u-nano", symbol: "n", name: "nano (10⁻⁹)", kind: "prefix" },
    { id: "u-centi", symbol: "c", name: "centi (10⁻²)", kind: "prefix" },
  ];
}

export function createConversions(): ConversionPractice[] {
  return [
    { id: "conv-cm", fromValue: 250, fromUnit: "cm", toUnit: "m", expected: convert(250, "cm", "m"), quantity: "length" },
    { id: "conv-ms", fromValue: 350, fromUnit: "ms", toUnit: "s", expected: convert(350, "ms", "s"), quantity: "time" },
    { id: "conv-g", fromValue: 500, fromUnit: "g", toUnit: "kg", expected: convert(500, "g", "kg"), quantity: "mass" },
    { id: "conv-kmh-note", fromValue: 18, fromUnit: "m", toUnit: "km", expected: convert(18, "m", "km"), quantity: "length" },
    { id: "conv-min", fromValue: 2, fromUnit: "min", toUnit: "s", expected: convert(2, "min", "s"), quantity: "time" },
    { id: "conv-km", fromValue: 1.5, fromUnit: "km", toUnit: "m", expected: convert(1.5, "km", "m"), quantity: "length" },
    { id: "conv-mm", fromValue: 40, fromUnit: "mm", toUnit: "m", expected: convert(40, "mm", "m"), quantity: "length" },
    { id: "conv-h", fromValue: 0.5, fromUnit: "h", toUnit: "s", expected: convert(0.5, "h", "s"), quantity: "time" },
    { id: "conv-g2", fromValue: 75, fromUnit: "g", toUnit: "kg", expected: convert(75, "g", "kg"), quantity: "mass" },
  ];
}

export function createConstants(): ConstantRecord[] {
  return [
    { id: "const-c", symbol: "c", value: PHYSICS.c, siUnit: "m/s", description: "Speed of light in vacuum (defined).", relatedTopics: ["relativity", "optics"] },
    { id: "const-G", symbol: "G", value: 6.6743e-11, siUnit: "m³/kg/s²", description: "Newtonian gravitational constant.", relatedTopics: ["gravitation"] },
    { id: "const-h", symbol: "h", value: PHYSICS.h, siUnit: "J·s", description: "Planck constant (defined).", relatedTopics: ["modern-physics"] },
    { id: "const-e", symbol: "e", value: PHYSICS.elementaryCharge, siUnit: "C", description: "Elementary charge (defined).", relatedTopics: ["electricity"] },
    { id: "const-kB", symbol: "k_B", value: 1.380649e-23, siUnit: "J/K", description: "Boltzmann constant.", relatedTopics: ["thermodynamics"] },
    { id: "const-NA", symbol: "N_A", value: 6.02214076e23, siUnit: "1/mol", description: "Avogadro constant.", relatedTopics: ["thermodynamics"] },
    { id: "const-e0", symbol: "ε₀", value: 8.8541878128e-12, siUnit: "F/m", description: "Vacuum permittivity.", relatedTopics: ["electricity"] },
    { id: "const-mu0", symbol: "μ₀", value: 1.25663706212e-6, siUnit: "N/A²", description: "Vacuum permeability.", relatedTopics: ["magnetism"] },
    { id: "const-g", symbol: "g", value: PHYSICS.g, siUnit: "m/s²", description: "Standard acceleration of gravity (conventional).", relatedTopics: ["kinematics", "forces"] },
  ];
}

export function createScales(): ScaleComparison[] {
  return [
    { id: "scale-atom-human", left: "hydrogen atom (~0.1 nm)", right: "human (~2 m)", ratioOrder: 10, domain: "length" },
    { id: "scale-earth-sun", left: "Earth radius", right: "Earth–Sun distance", ratioOrder: 4, domain: "length" },
    { id: "scale-sun-galaxy", left: "Solar System", right: "Milky Way disk", ratioOrder: 9, domain: "length" },
    { id: "scale-fs-day", left: "femtosecond", right: "day", ratioOrder: 19, domain: "time" },
    { id: "scale-eV-kWh", left: "1 eV", right: "1 kWh", ratioOrder: 22, domain: "energy" },
    { id: "scale-electron-earth", left: "electron mass", right: "Earth mass", ratioOrder: 54, domain: "mass" },
  ];
}

export function createGraphPractice(graphIds: string[]): GraphPracticeItem[] {
  const asks: GraphPracticeItem["ask"][] = ["slope", "intercept", "maximum", "minimum", "area", "trend", "crossing", "rate"];
  const items: GraphPracticeItem[] = [];
  for (let index = 0; index < 100; index += 1) {
    const graphId = graphIds[index % Math.max(1, graphIds.length)] ?? "graph-ohm-vi";
    const ask = asks[index % asks.length];
    items.push({
      id: `gprac-${index + 1}`,
      graphId,
      ask,
      prompt: `From ${graphId}, estimate the ${ask}.`,
      expected: expectedAsk(ask),
      conceptId: index % 2 ? "motion-graphs" : "ohms-law",
    });
  }
  return items;
}

function expectedAsk(ask: GraphPracticeItem["ask"]): string {
  switch (ask) {
    case "slope":
      return "Δy/Δx with units";
    case "area":
      return "Quantity whose unit is x-unit × y-unit";
    case "trend":
      return "linear, quadratic, inverse, or decaying — name one";
    default:
      return "Read the axis units first, then the feature.";
  }
}

export function createTablePractice(csvIds: string[]): TablePracticeItem[] {
  return Array.from({ length: 100 }, (_, index) => ({
    id: `tprac-${index + 1}`,
    csvId: csvIds[index % Math.max(1, csvIds.length)] ?? "csv-ohms-law",
    prompt: index % 2 ? "Which column is the independent variable?" : "Estimate the mean of the dependent column.",
    expected: index % 2 ? "The controlled column listed first in the metadata." : "Sum divided by row count.",
    conceptId: "motion-graphs",
  }));
}

export function createLabDesignQuestions(): LabDesignQuestion[] {
  return [
    { id: "ld-g", prompt: "How should you measure g with a drop timer?", independent: "height", dependent: "time", controls: ["shape", "release method"], bestGraph: "t² vs h", errorSource: "reaction time", conceptId: "free-fall" },
    { id: "ld-ohm", prompt: "How do you test ohmic behavior?", independent: "voltage", dependent: "current", controls: ["temperature", "resistor identity"], bestGraph: "I vs V", errorSource: "meter on wrong range", conceptId: "ohms-law" },
    { id: "ld-pend", prompt: "How do you test T vs L?", independent: "length", dependent: "period", controls: ["amplitude", "mass"], bestGraph: "T² vs L", errorSource: "counting swings", conceptId: "pendulum" },
    { id: "ld-lens", prompt: "How do you find f?", independent: "object distance", dependent: "image distance", controls: ["lens"], bestGraph: "1/di vs 1/do", errorSource: "parallax on the screen", conceptId: "thin-lenses" },
    { id: "ld-boyle", prompt: "How do you test Boyle’s law?", independent: "volume", dependent: "pressure", controls: ["temperature", "amount"], bestGraph: "P vs 1/V", errorSource: "fast compression heating the gas", conceptId: "ideal-gas-law" },
  ];
}

export function createSafetyReminders(): SafetyReminder[] {
  return [
    { id: "safe-e", domain: "electricity", reminder: "Treat classroom supplies as low-voltage educational sources. Do not improvise mains wiring." },
    { id: "safe-h", domain: "heat", reminder: "Hot metal and steam can burn. Use tongs and announced cooling time in the lab narrative." },
    { id: "safe-l", domain: "light", reminder: "Do not look into lasers. Educational benches use low-power classified pointers under supervision." },
    { id: "safe-m", domain: "mechanics", reminder: "Keep hands clear of falling masses and spinning wheels. These are demo notes, not shop instructions." },
  ];
}

export { roundPhysics };
