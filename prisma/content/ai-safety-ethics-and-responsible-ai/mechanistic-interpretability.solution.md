**Mechanistic interpretability** aims to **reverse-engineer** trained networks into human-understandable algorithms: identify internal **features** (directions encoding concepts) and **circuits** (subgraphs of weights/attention heads/MLPs implementing a behaviour), the way one would decompile a program.

**Key ideas**

- **Features as directions** in activation space, not single neurons.
- **Superposition:** models pack more features than neurons by using near-orthogonal directions, so neurons are **polysemantic**.
- **Sparse autoencoders (SAEs)** / dictionary learning decompose activations into sparse, more monosemantic features (e.g. "Golden Gate Bridge", "code bug", "deception-related" features).
- **Circuits and induction heads:** attention-head pairs that implement in-context copying; modular arithmetic, indirect-object identification circuits.
- **Causal tools:** activation patching, ablation, steering vectors, logit lens, attribution graphs to test that a component is *causally* responsible.

**Why labs invest**

1. **Safety/alignment:** verify what a model is actually computing, detect deception, hidden goals, backdoors, or dangerous capabilities beyond behavioural testing (which may be gamed).
2. **Control:** steer or suppress features (e.g. reduce sycophancy), monitor internals at runtime.
3. **Debugging and reliability:** explain hallucinations, refusals, jailbreaks.
4. **Scientific understanding** and better training/architecture decisions.
5. **Regulatory and trust value** where evidence of understanding is needed.

**Limitations:** scaling to frontier models is hard, interpretations can be incomplete or misleading, SAE features cover only part of the computation, and results may not transfer across models.
