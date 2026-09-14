import { kineticEnergy, momentum, ohmsLaw, projectile, wave, gravitationalPotentialEnergy, elasticPotentialEnergy } from "@/lib/physics";
import { roundPhysics } from "../../utils/physics-values";
import { CATALOG } from "../ai-catalog";
import { runVerifiedCalc } from "../ai-verification";
import { stableId } from "../../utils/ids";
import type { PredictionVerdict, WhatIfScenario } from "./types";

function pair(id: string, question: string, conceptId: string, parameter: string, before: WhatIfScenario["before"], after: WhatIfScenario["after"], principle: string, assumption: string): WhatIfScenario {
  return { id: stableId("wif", id), question, conceptId, parameter, before, after, principle, assumption };
}

let cache: WhatIfScenario[] | null = null;

export function getWhatIfScenarios(): WhatIfScenario[] {
  if (cache) return cache;
  const rows: WhatIfScenario[] = [];
  for (const topic of CATALOG) {
    const known = topic.example.known;
    if (topic.verified?.kind === "projectile-range") {
      const [speed, angle, height] = topic.verified.inputs;
      const base = projectile({ speed, angleDeg: angle, height });
      const doubledMass = projectile({ speed, angleDeg: angle, height });
      const halfG = projectile({ speed, angleDeg: angle, height, gravity: 9.80665 / 2 });
      rows.push(
        pair(`${topic.id}-mass`, "What if mass doubles?", topic.conceptId, "mass", { name: "range", value: roundPhysics(base.range), unit: "m" }, { name: "range", value: roundPhysics(doubledMass.range), unit: "m" }, "Vacuum projectile range is independent of mass.", "neglect air resistance"),
        pair(`${topic.id}-g`, "What if gravity halves?", topic.conceptId, "g", { name: "range", value: roundPhysics(base.range), unit: "m" }, { name: "range", value: roundPhysics(halfG.range), unit: "m" }, "Flight time grows as g falls.", "uniform g, no drag"),
      );
    }
    if (topic.verified?.kind === "kinetic") {
      const [m, v] = topic.verified.inputs;
      const k = kineticEnergy(m, v);
      rows.push(
        pair(`${topic.id}-m`, "What if mass doubles?", topic.conceptId, "mass", { name: "K", value: roundPhysics(k), unit: "J" }, { name: "K", value: roundPhysics(kineticEnergy(2 * m, v)), unit: "J" }, "K scales linearly with m.", "point mass"),
        pair(`${topic.id}-v`, "What if speed doubles?", topic.conceptId, "speed", { name: "K", value: roundPhysics(k), unit: "J" }, { name: "K", value: roundPhysics(kineticEnergy(m, 2 * v)), unit: "J" }, "K scales with v².", "inertial frame"),
      );
    }
    if (topic.verified?.kind === "ohms-current") {
      const [V, R] = topic.verified.inputs;
      const I = ohmsLaw(V, R).current;
      rows.push(
        pair(`${topic.id}-r`, "What if resistance doubles?", topic.conceptId, "R", { name: "I", value: roundPhysics(I), unit: "A" }, { name: "I", value: roundPhysics(ohmsLaw(V, 2 * R).current), unit: "A" }, "I = V/R for an ohmic resistor.", "ohmic, steady DC"),
        pair(`${topic.id}-v`, "What if voltage doubles?", topic.conceptId, "V", { name: "I", value: roundPhysics(I), unit: "A" }, { name: "I", value: roundPhysics(ohmsLaw(2 * V, R).current), unit: "A" }, "Current doubles at fixed R.", "ohmic"),
      );
    }
    if (topic.verified?.kind === "wave-speed") {
      const [f, lam] = topic.verified.inputs;
      const w = wave({ frequencyHz: f, wavelengthM: lam });
      rows.push(
        pair(`${topic.id}-lam`, "What if wavelength doubles at fixed frequency?", topic.conceptId, "λ", { name: "v", value: roundPhysics(w.speedMps), unit: "m/s" }, { name: "v", value: roundPhysics(wave({ frequencyHz: f, wavelengthM: 2 * lam }).speedMps), unit: "m/s" }, "v = fλ", "same medium only if v is allowed to change"),
        pair(`${topic.id}-f`, "What if frequency doubles at fixed wavelength?", topic.conceptId, "f", { name: "v", value: roundPhysics(w.speedMps), unit: "m/s" }, { name: "v", value: roundPhysics(wave({ frequencyHz: 2 * f, wavelengthM: lam }).speedMps), unit: "m/s" }, "v = fλ", "wavelength held fixed by the fixture"),
      );
    }
    if (topic.verified?.kind === "momentum") {
      const [m, v] = topic.verified.inputs;
      const p = momentum(m, v);
      rows.push(
        pair(`${topic.id}-m`, "What if mass doubles?", topic.conceptId, "mass", { name: "p", value: roundPhysics(p), unit: "kg·m/s" }, { name: "p", value: roundPhysics(momentum(2 * m, v)), unit: "kg·m/s" }, "p = mv", "classical, v ≪ c"),
        pair(`${topic.id}-v`, "What if velocity reverses?", topic.conceptId, "velocity", { name: "p", value: roundPhysics(p), unit: "kg·m/s" }, { name: "p", value: roundPhysics(momentum(m, -v)), unit: "kg·m/s" }, "Momentum is signed.", "1D sign convention"),
      );
    }
    if (topic.verified?.kind === "grav-energy") {
      const [m, h] = topic.verified.inputs;
      const u = gravitationalPotentialEnergy(m, h);
      rows.push(pair(`${topic.id}-h`, "What if height doubles?", topic.conceptId, "h", { name: "U", value: roundPhysics(u), unit: "J" }, { name: "U", value: roundPhysics(gravitationalPotentialEnergy(m, 2 * h)), unit: "J" }, "U = mgh near Earth", "constant g"));
    }
    if (topic.verified?.kind === "spring") {
      const [k, x] = topic.verified.inputs;
      const u = elasticPotentialEnergy(k, x);
      rows.push(pair(`${topic.id}-x`, "What if displacement doubles?", topic.conceptId, "x", { name: "U", value: roundPhysics(u), unit: "J" }, { name: "U", value: roundPhysics(elasticPotentialEnergy(k, 2 * x)), unit: "J" }, "U = ½kx²", "Hooke’s law"));
    }
    known.forEach((item, index) => {
      const variants: Array<[string, number, string]> = [
        [`k${index}`, 2, "doubles"],
        [`kh${index}`, 0.5, "halves"],
        [`kt${index}`, 3, "triples"],
        [`k10-${index}`, 10, "grows tenfold"],
        [`k01-${index}`, 0.1, "drops to a tenth"],
      ];
      for (const [suffix, factor, verb] of variants) {
        rows.push(pair(`${topic.id}-${suffix}`, `What if ${item.name} ${verb} in ${topic.title}?`, topic.conceptId, item.name, { name: item.name, value: item.value, unit: item.unit }, { name: item.name, value: Number((item.value * factor).toPrecision(6)), unit: item.unit }, topic.example.principle, "other variables held fixed; check whether the model still applies"));
      }
    });
    if (topic.verified) {
      const base = runVerifiedCalc(topic.verified.kind, topic.verified.inputs);
      rows.push(pair(`${topic.id}-id`, `What if we keep the same ${topic.title} inputs?`, topic.conceptId, "identity", base, base, base.principle, "sanity check that doubling nothing changes nothing"));
      rows.push(pair(`${topic.id}-si`, `What if we keep ${topic.title} in SI units?`, topic.conceptId, "units", base, base, base.principle, "unit conversion must precede substitution; no invented digits"));
    }
  }
  cache = rows;
  return cache;
}

export type PredictionFixture = {
  id: string;
  conceptId: string;
  prompt: string;
  prediction: string;
  observed: string;
  verdict: PredictionVerdict;
  feedback: string;
};

export function getPredictionFixtures(): PredictionFixture[] {
  return getWhatIfScenarios().slice(0, 80).map((scenario, index) => {
    const same = scenario.before.value === scenario.after.value;
    const verdict: PredictionVerdict = same ? "correct" : index % 4 === 0 ? "wrongConceptual" : index % 4 === 1 ? "partiallyCorrect" : index % 4 === 2 ? "wrongReasonable" : "correct";
    return {
      id: stableId("pred", scenario.id),
      conceptId: scenario.conceptId,
      prompt: `Predict the change: ${scenario.question}`,
      prediction: verdict === "correct" ? `${scenario.after.name} → ${scenario.after.value} ${scenario.after.unit}` : "It must increase because everything increases.",
      observed: `${scenario.after.name} = ${scenario.after.value} ${scenario.after.unit}`,
      verdict,
      feedback:
        verdict === "correct" ? `The prediction matches the deterministic ${scenario.principle} result.`
          : verdict === "partiallyCorrect" ? "Direction was right; the scaling (linear vs square) was not."
            : verdict === "wrongReasonable" ? `A common intuition, but ${scenario.principle} says otherwise under ${scenario.assumption}.`
              : `The claim is conceptually off for ${scenario.conceptId}. ${scenario.principle}`,
    };
  });
}
