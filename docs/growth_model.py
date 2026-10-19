"""
Adoption model for Aidfolio, a free tool for local humanitarian organisations (monthly steps, 36 months).
Bass diffusion (Mahajan, Muller & Bass 1995 averages: p=0.03, q=0.38 per YEAR, converted to monthly)
plus (a) intermediary seeding: intermediaries (INGOs, pooled funds, NGO forums) recommend the tool
to their partner lists, and (b) a peer-referral loop with coefficient K = shares x conversion.
Monte Carlo over uncertain parameters; seed 70_000. All parameters are assumptions, stated below.
"""
import json, numpy as np
rng = np.random.default_rng(70_000)
R, T = 5000, 36

def run(scn, rng):
    M = rng.uniform(5_000, 20_000, R)                   # reachable local orgs (assumption)
    p = rng.uniform(0.01, 0.03, R) / 12                 # external influence, monthly
    q = rng.uniform(0.30, 0.50, R) / 12                 # word of mouth, monthly
    share = rng.uniform(1, 3, R)                         # peers told per activated org
    conv = rng.uniform(0.05, 0.20, R)                    # share of those who activate
    K = share * conv * scn["referral_on"]                # referral coefficient
    inter_rate = scn["intermediaries_per_month"] * rng.uniform(0.5, 1.5, R)
    list_size = rng.uniform(10, 60, R)                   # partners per intermediary list
    act = rng.uniform(0.25, 0.60, R)                     # activation of recommended partners
    churn = rng.uniform(0.01, 0.04, R)                   # monthly loss of active orgs
    A = np.zeros((R, T + 1)); cum = np.zeros(R); new_prev = np.zeros(R)
    for t in range(1, T + 1):
        rem = np.maximum(M - cum, 0)
        bass = (p + q * cum / M) * rem
        seeded = np.minimum(inter_rate * list_size * act, rem)
        referred = np.minimum(K * new_prev, rem)
        new = np.minimum(bass + seeded + referred, rem)
        cum += new; new_prev = new
        A[:, t] = A[:, t - 1] * (1 - churn) + new
    return A

SCN = {
    "Organic only": dict(intermediaries_per_month=0, referral_on=0),
    "Organic + peer referral": dict(intermediaries_per_month=0, referral_on=1),
    "Plus 1 intermediary a month": dict(intermediaries_per_month=1, referral_on=1),
    "Plus 3 intermediaries a month": dict(intermediaries_per_month=3, referral_on=1),
}
out = {}
for name, s in SCN.items():
    A = run(s, rng)
    out[name] = {f"m{t}": dict(p10=round(float(np.percentile(A[:, t], 10))), p50=round(float(np.percentile(A[:, t], 50))),
                                 p90=round(float(np.percentile(A[:, t], 90)))) for t in (6, 12, 24, 36)}
# referral amplification
Ks = rng.uniform(1, 3, 100000) * rng.uniform(0.05, 0.2, 100000)
out["K"] = dict(p10=round(float(np.percentile(Ks, 10)), 3), p50=round(float(np.percentile(Ks, 50)), 3), p90=round(float(np.percentile(Ks, 90)), 3),
               share_above_1=float((Ks >= 1).mean()))
json.dump(out, open("/home/claude/plan/growth_results.json", "w"), indent=1)
print(json.dumps(out, indent=1))
