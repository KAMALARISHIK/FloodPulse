"""Event verification and contingency table metrics for flood exceedance events.

Computes Probability of Detection (POD / Hit Rate), False Alarm Ratio (FAR),
and Critical Success Index (CSI / Threat Score) at specified discharge thresholds
or percentile exceedances.
"""

from __future__ import annotations

from typing import Any

import numpy as np

from floodpulse.evaluation.metrics import _to_valid_pair_arrays


def contingency_table(
    observed: Any,
    simulated: Any,
    threshold: float | None = None,
    threshold_percentile: float | None = None,
) -> dict[str, int]:
    r"""Compute 2x2 contingency table for threshold exceedance events.

    Events are defined as $Q \ge T$.

    Categories:
    - Hits ($H$): $Q_{obs} \ge T$ and $Q_{sim} \ge T$
    - False Alarms ($F$): $Q_{obs} < T$ and $Q_{sim} \ge T$
    - Misses ($M$): $Q_{obs} \ge T$ and $Q_{sim} < T$
    - Correct Negatives ($CN$): $Q_{obs} < T$ and $Q_{sim} < T$

    Parameters
    ----------
    observed : array-like
        Observed streamflow series.
    simulated : array-like
        Simulated streamflow series.
    threshold : float, optional
        Absolute discharge threshold $T$.
    threshold_percentile : float, optional
        Percentile of the observed distribution to set as $T$ (between 0 and 100).
        Must specify exactly one of `threshold` or `threshold_percentile`.

    Returns
    -------
    dict[str, int]
        Dictionary with keys: "hits", "false_alarms", "misses", "correct_negatives", "total".
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)

    if threshold is None and threshold_percentile is None:
        msg = "Must provide either 'threshold' or 'threshold_percentile'."
        raise ValueError(msg)
    if threshold is not None and threshold_percentile is not None:
        msg = "Provide either 'threshold' or 'threshold_percentile', not both."
        raise ValueError(msg)

    if threshold is not None:
        thresh = float(threshold)
    else:
        assert threshold_percentile is not None
        thresh = float(np.percentile(obs, float(threshold_percentile)))

    obs_event = obs >= thresh
    sim_event = sim >= thresh

    hits = int(np.sum(obs_event & sim_event))
    false_alarms = int(np.sum((~obs_event) & sim_event))
    misses = int(np.sum(obs_event & (~sim_event)))
    correct_negatives = int(np.sum((~obs_event) & (~sim_event)))

    return {
        "hits": hits,
        "false_alarms": false_alarms,
        "misses": misses,
        "correct_negatives": correct_negatives,
        "total": int(obs.size),
    }


def probability_of_detection(
    observed: Any,
    simulated: Any,
    threshold: float | None = None,
    threshold_percentile: float | None = None,
) -> float:
    r"""Compute Probability of Detection (POD) / Hit Rate.

    Formula:
        $$POD = \frac{Hits}{Hits + Misses}$$

    Range: $[0, 1]$. Optimal score is 1.0.

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.
    threshold : float, optional
        Exceedance threshold.
    threshold_percentile : float, optional
        Percentile threshold (0..100).

    Returns
    -------
    float
        Probability of Detection. Returns 1.0 if no flood events occurred and none were predicted.
    """
    table = contingency_table(observed, simulated, threshold, threshold_percentile)
    denom = table["hits"] + table["misses"]
    if denom == 0:
        return 1.0 if table["false_alarms"] == 0 else 0.0
    return float(table["hits"] / denom)


def false_alarm_ratio(
    observed: Any,
    simulated: Any,
    threshold: float | None = None,
    threshold_percentile: float | None = None,
) -> float:
    r"""Compute False Alarm Ratio (FAR).

    Formula:
        $$FAR = \frac{False Alarms}{Hits + False Alarms}$$

    Range: $[0, 1]$. Optimal score is 0.0.

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.
    threshold : float, optional
        Exceedance threshold.
    threshold_percentile : float, optional
        Percentile threshold (0..100).

    Returns
    -------
    float
        False Alarm Ratio. Returns 0.0 if no positive events were predicted.
    """
    table = contingency_table(observed, simulated, threshold, threshold_percentile)
    denom = table["hits"] + table["false_alarms"]
    if denom == 0:
        return 0.0
    return float(table["false_alarms"] / denom)


def critical_success_index(
    observed: Any,
    simulated: Any,
    threshold: float | None = None,
    threshold_percentile: float | None = None,
) -> float:
    r"""Compute Critical Success Index (CSI) / Threat Score.

    Formula:
        $$CSI = \frac{Hits}{Hits + False Alarms + Misses}$$

    Range: $[0, 1]$. Optimal score is 1.0. Measures forecast accuracy specifically
    on event occurrence, penalizing both misses and false alarms without being inflated
    by frequent correct negatives.

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.
    threshold : float, optional
        Exceedance threshold.
    threshold_percentile : float, optional
        Percentile threshold (0..100).

    Returns
    -------
    float
        Critical Success Index. Returns 1.0 if no events occurred and none predicted.
    """
    table = contingency_table(observed, simulated, threshold, threshold_percentile)
    denom = table["hits"] + table["false_alarms"] + table["misses"]
    if denom == 0:
        return 1.0
    return float(table["hits"] / denom)


def flood_event_contingency(
    observed: Any,
    simulated: Any,
    threshold: float | None = None,
    threshold_percentile: float | None = None,
) -> dict[str, float]:
    """Compute all event verification metrics for a flood threshold.

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.
    threshold : float, optional
        Exceedance threshold.
    threshold_percentile : float, optional
        Percentile threshold (0..100).

    Returns
    -------
    dict[str, float]
        Dictionary with hits, false_alarms, misses, correct_negatives, pod, far, csi.
    """
    table = contingency_table(observed, simulated, threshold, threshold_percentile)
    pod = probability_of_detection(observed, simulated, threshold, threshold_percentile)
    far = false_alarm_ratio(observed, simulated, threshold, threshold_percentile)
    csi = critical_success_index(observed, simulated, threshold, threshold_percentile)

    return {
        "hits": float(table["hits"]),
        "false_alarms": float(table["false_alarms"]),
        "misses": float(table["misses"]),
        "correct_negatives": float(table["correct_negatives"]),
        "total": float(table["total"]),
        "pod": pod,
        "far": far,
        "csi": csi,
    }
