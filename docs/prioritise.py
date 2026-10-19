"""
Multi-criteria prioritisation of local organisations' needs, with stochastic sensitivity analysis
in the spirit of SMAA (Lahdelma, Hokkanen & Salminen 1998): weights drawn from a Dirichlet centred
on the base weights, and every score perturbed by U(-0.5, +0.5) to reflect judgement uncertainty.
Seed 80_000. Scores are the analyst's evidence-based judgements (1 = low, 5 = high), documented in the report.
"""
import json, numpy as np
crit = ["Severity", "Breadth", "Evidence", "Tractability", "Leverage", "Gap in provision"]
w0 = np.array([0.25, 0.15, 0.15, 0.20, 0.15, 0.10])
needs = {
 "Overheads not funded (true cost)":      [5, 5, 5, 5, 5, 4],
 "Compliance and due-diligence burden":   [4, 5, 5, 5, 3, 3],
 "Risk transferred, not shared":          [4, 4, 4, 4, 3, 4],
 "Reporting burden":                      [3, 4, 3, 3, 2, 3],
 "Finding and qualifying for funding":    [3, 4, 2, 3, 3, 2],
 "Survival of women- and refugee-led orgs":[5, 3, 4, 1, 2, 2],
 "Staff retention and pay gaps":          [4, 4, 3, 1, 1, 3],
}
names = list(needs); S = np.array([needs[n] for n in names], float)
base = S @ w0
rng = np.random.default_rng(80_000); R = 20000; conc = 5.0
ranks = np.zeros((R, len(names)), int); scores = np.zeros((R, len(names)))
for r in range(R):
    w = rng.dirichlet(w0 * conc)
    Sp = np.clip(S + rng.uniform(-1.0, 1.0, S.shape), 1, 5)
    sc = Sp @ w; scores[r] = sc
    ranks[r] = np.argsort(np.argsort(-sc)) + 1
# need-only view: severity, breadth, evidence (ignores what a tool can do)
need_only = S[:, :3] @ np.array([0.5, 0.25, 0.25])
# also equal weights check
eq = S @ (np.ones(6) / 6)
out = []
for i, n in enumerate(names):
    out.append(dict(need=n, base=round(float(base[i]), 2), equal_weights=round(float(eq[i]), 2), need_only=round(float(need_only[i]), 2),
                    p_first=round(float((ranks[:, i] == 1).mean()), 3), p_top3=round(float((ranks[:, i] <= 3).mean()), 3),
                    score_p10=round(float(np.percentile(scores[:, i], 10)), 2), score_p90=round(float(np.percentile(scores[:, i], 90)), 2),
                    median_rank=int(np.median(ranks[:, i]))))
out.sort(key=lambda d: -d["base"])
json.dump(dict(noise="weights Dirichlet(5*w0); scores +/-1.0 uniform", criteria=crit, weights=w0.tolist(), concentration=conc, draws=R, results=out), open("/home/claude/needs/priorities.json", "w"), indent=1)
for d in out: print(d)
