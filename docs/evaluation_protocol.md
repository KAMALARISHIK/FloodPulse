# FloodPulse Evaluation Protocol

This protocol defines the formal mathematical metrics, statistical rationale, and dataset partitioning policies governing all streamflow, flood extent, and road closure models in FloodPulse.

---

## 1. Why Standard Machine Learning "Accuracy" is Strictly Disallowed

In standard classification and regression problems, practitioners often resort to overall accuracy (e.g. classification accuracy or $R^2$). In hydrological streamflow and flood hazard modeling, **standard accuracy is deceptive and actively dangerous**:

1. **Extreme Class Imbalance**: Floods are rare tail events. A model that simply predicts "no flood" 365 days a year can achieve $>98\%$ classification accuracy while failing 100% of catastrophic disasters.
2. **Hydrological Bias Masking ($R^2$ Failure)**: The coefficient of determination ($R^2$) only measures linear correlation. A model that consistently predicts double the true discharge ($Q_{sim} = 2 \times Q_{obs}$) will achieve a misleading $R^2 = 1.0$, despite causing massive false alarm panics and evacuations.
3. **Temporal Autocorrelation**: River discharge possesses strong multi-day persistence. Standard cross-validation inflates metrics via auto-correlated temporal leakage.

Therefore, FloodPulse enforces hydrology-native benchmark criteria: NSE, KGE (with decomposition), event contingency scores (POD/FAR/CSI), and quantile calibration metrics.

---

## 2. Deterministic Streamflow Metrics

### 2.1 Nash-Sutcliffe Efficiency (NSE)
$$NSE = 1 - \frac{\sum_{t=1}^N (Q_{obs,t} - Q_{sim,t})^2}{\sum_{t=1}^N (Q_{obs,t} - \overline{Q_{obs}})^2}$$
- **Interpretation**: Normalizes mean squared error by the natural variance of the river discharge.
- **Reference Values**:
  - $NSE = 1.0$: Perfect simulation.
  - $NSE = 0.0$: Simulation has the same predictive power as the historical mean $\overline{Q_{obs}}$.
  - $NSE < 0.0$: Historical mean is a superior predictor compared to the model.

### 2.2 Kling-Gupta Efficiency (KGE)
$$KGE = 1 - \sqrt{(r - 1)^2 + (\alpha - 1)^2 + (\beta - 1)^2}$$
where:
- **$r$ (Linear Correlation)**: $\frac{\text{Cov}(Q_{obs}, Q_{sim})}{\sigma_{obs} \sigma_{sim}}$, evaluating timing and shape fidelity.
- **$\alpha$ (Variability Ratio)**: $\frac{\sigma_{sim}}{\sigma_{obs}}$, evaluating whether the model captures flashiness and hydrograph spread.
- **$\beta$ (Bias Ratio)**: $\frac{\mu_{sim}}{\mu_{obs}}$, evaluating long-term water balance conservation.

### 2.3 Peak Flow Error (PFE) & Peak Timing Error (PTE)
Flood impacts are determined by the single highest discharge crest and its arrival time:
- **Relative Peak Flow Error**:
  $$PFE_{rel} = \frac{\max(Q_{sim}) - \max(Q_{obs})}{\max(Q_{obs})}$$
- **Peak Timing Error (Lag)**:
  $$\Delta t_{peak} = t_{sim,max} - t_{obs,max} \quad (\text{days or hours})$$

---

## 3. Extreme Event Verification (Contingency Analysis)

Given a critical flood threshold $T$ (e.g. the 95th or 98th percentile of historical flow):
- **Hits ($H$)**: Event observed and predicted ($Q_{obs} \ge T, Q_{sim} \ge T$).
- **False Alarms ($F$)**: Event predicted but not observed ($Q_{obs} < T, Q_{sim} \ge T$).
- **Misses ($M$)**: Event observed but not predicted ($Q_{obs} \ge T, Q_{sim} < T$).
- **Correct Negatives ($CN$)**: Neither observed nor predicted ($Q_{obs} < T, Q_{sim} < T$).

### Key Ratios:
- **Probability of Detection (POD / Recall / Hit Rate)**:
  $$POD = \frac{H}{H + M} \in [0, 1] \quad (\text{Target: } 1.0)$$
- **False Alarm Ratio (FAR)**:
  $$FAR = \frac{F}{H + F} \in [0, 1] \quad (\text{Target: } 0.0)$$
- **Critical Success Index (CSI / Threat Score)**:
  $$CSI = \frac{H}{H + F + M} \in [0, 1] \quad (\text{Target: } 1.0)$$
  *Note*: Unlike overall accuracy, CSI does not reward the model for correct negatives ($CN$), making it sensitive strictly to flood event skill.

---

## 4. Probabilistic Calibration & Quantile Metrics

FloodPulse models output quantile intervals $\tau \in \{0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95\}$ to reflect precipitation uncertainty.

### 4.1 Asymmetric Pinball (Quantile) Loss
$$L_\tau(y, \hat{q}_\tau) = \frac{1}{N} \sum_{i=1}^N \max\left(\tau(y_i - \hat{q}_{\tau, i}), (1 - \tau)(\hat{q}_{\tau, i} - y_i)\right)$$
- At $\tau = 0.5$, pinball loss is equivalent to $0.5 \times MAE$.
- At $\tau = 0.95$, underestimating a flood crest is penalized 19 times more severely than overestimating it.

### 4.2 Continuous Ranked Probability Score (CRPS)
$$CRPS(y, F) = 2 \int_0^1 L_\tau(y, q_\tau) d\tau$$
Approximated numerically over predicted quantiles using composite trapezoidal integration. Measures both sharpness and calibration in original discharge units ($m^3/s$ or $mm/day$).

### 4.3 Prediction Interval Coverage Probability (PICP)
$$PICP = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(\hat{q}_{0.05, i} \le y_i \le \hat{q}_{0.95, i})$$
For a well-calibrated 90% prediction interval, $PICP \approx 0.90$.

---

## 5. Non-Negotiable Data Partitioning Policy

### 5.1 Strict Chronological Splitting
Random $k$-fold cross-validation or random train-test splitting is **strictly forbidden**. River systems retain memory in groundwater and soil moisture for weeks to months. Random splitting creates artificial lookahead leakage.
- **Training Period**: `1980-01-01` to `2005-12-31` (26 years)
- **Validation Period**: `2006-01-01` to `2012-12-31` (7 years)
- **Testing Period**: `2013-01-01` to `2020-12-31` (8 years)

### 5.2 Basin Holdout Splitting (Spatial Generalization)
To test ungauged basin performance (PUB - Predictions in Ungauged Basins):
- Calibration basins are used for parameter training.
- Designated holdout basins (e.g. Cauvery at Musiri) are strictly excluded from training and fine-tuning to evaluate zero-shot regionalization.
- `assert_no_basin_leakage` programmatically enforces that calibration and test basin sets have zero intersection.
