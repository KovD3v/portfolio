// Shared by the site background and the texture lab.
export const paperSettings = [
  { name: "contrast", label: ["Contrast", "Contrasto"], value: .32, min: 0, max: 1, step: .01, group: "surface" },
  { name: "roughness", label: ["Grain", "Grana"], value: .92, min: 0, max: 1, step: .01, group: "surface" },
  { name: "fiber", label: ["Fibers", "Fibre"], value: .53, min: 0, max: 1, step: .01, group: "surface" },
  { name: "fiberSize", label: ["Fiber size", "Dimensione delle fibre"], value: .21, min: .01, max: 1, step: .01, group: "surface" },
  { name: "drops", label: ["Speckles", "Macchie"], value: 0, min: 0, max: 1, step: .01, group: "surface" },
  { name: "fade", label: ["Wear", "Usura"], value: .3, min: 0, max: 1, step: .01, group: "surface" },
  { name: "crumples", label: ["Crumples", "Increspature"], value: .2, min: 0, max: 1, step: .01, group: "shape" },
  { name: "crumpleSize", label: ["Crumple size", "Dimensione delle increspature"], value: .3, min: .01, max: 1, step: .01, group: "shape" },
  { name: "folds", label: ["Folds", "Pieghe"], value: .22, min: 0, max: 1, step: .01, group: "shape" },
  { name: "foldCount", label: ["Fold count", "Numero di pieghe"], value: 2, min: 1, max: 15, step: 1, group: "shape" },
  { name: "scale", label: ["Scale", "Scala"], value: .3, min: .1, max: 2, step: .01, group: "shape" },
  { name: "seed", label: ["Pattern seed", "Variante della trama"], value: 33, min: 0, max: 100, step: .1, group: "shape" },
];

export const paperDefaults = Object.fromEntries(paperSettings.map(({ name, value }) => [`u_${name}`, value]));
