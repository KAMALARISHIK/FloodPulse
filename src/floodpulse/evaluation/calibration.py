"""Probabilistic forecast calibration, quantile loss, CRPS, and reliability metrics.

Implements asymmetric pinball loss, Continuous Ranked Probability Score (CRPS)
from quantiles, Prediction Interval Coverage Probability (PICP), and reliability data.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import numpy as np


def _to_valid_probabilistic_arrays(
    observed: Any,
    predicted_quantiles: Any,
) -> tuple[np.ndarray, np.ndarray]:
    """Clean and filter observed and predicted quantile arrays, removing NaNs."""
    obs = np.asarray(observed, dtype=np.float64).ravel()
    preds = np.asarray(predicted_quantiles, dtype=np.float64)

    if preds.ndim == 1:
        preds = preds[:, np.newaxis]

    if obs.shape[0] != preds.shape[0]:
        msg = (
            f"Observed count ({obs.shape[0]}) does not match predictions count ({preds.shape[0]})."
        )
        raise ValueError(msg)

    # Valid mask where observed and all quantiles are finite
    valid_mask = np.isfinite(obs) & np.all(np.isfinite(preds), axis=1)
    obs_clean = obs[valid_mask]
    preds_clean = preds[valid_mask]

    if obs_clean.size == 0:
        msg = "No valid concurrent observations and predicted quantiles found."
        raise ValueError(msg)

    return obs_clean, preds_clean


def pinball_loss(
    observed: Any,
    predicted_quantile: Any,
    quantile: float,
) -> float:
    r"""Compute the asymmetric pinball (quantile) loss.

    Formula:
        $$L_\tau(y, \hat{y}_\tau) = \frac{1}{N} \sum_{i=1}^N \max\left(\tau (y_i - \hat{y}_\tau), (1 - \tau) (\hat{y}_\tau - y_i)\right)$$

    Parameters
    ----------
    observed : array-like
        Observed ground-truth values.
    predicted_quantile : array-like
        Predicted values for quantile $\tau$.
    quantile : float
        Target quantile level $\tau \in (0, 1)$.

    Returns
    -------
    float
        Average pinball loss.
    """
    if not (0.0 < quantile < 1.0):
        msg = f"Quantile must be strictly between 0 and 1, got {quantile}."
        raise ValueError(msg)

    obs, pred = _to_valid_probabilistic_arrays(observed, predicted_quantile)
    diff = obs[:, np.newaxis] - pred
    loss = np.maximum(quantile * diff, (quantile - 1.0) * diff)
    return float(np.mean(loss))


def multi_quantile_pinball_loss(
    observed: Any,
    predicted_quantiles: Any,
    quantiles: Sequence[float],
) -> dict[float, float]:
    """Compute pinball loss for each individual quantile in an ensemble.

    Parameters
    ----------
    observed : array-like
        Ground truth observations of shape (N,).
    predicted_quantiles : array-like
        Predicted quantiles of shape (N, Q), where Q is len(quantiles).
    quantiles : sequence of float
        List of target quantile levels, e.g. [0.05, 0.5, 0.95].

    Returns
    -------
    dict[float, float]
        Dictionary mapping each quantile level to its average pinball loss.
    """
    obs, preds = _to_valid_probabilistic_arrays(observed, predicted_quantiles)
    if preds.shape[1] != len(quantiles):
        msg = f"Prediction columns ({preds.shape[1]}) do not match quantiles length ({len(quantiles)})."
        raise ValueError(msg)

    result: dict[float, float] = {}
    for j, q in enumerate(quantiles):
        result[q] = pinball_loss(obs, preds[:, j], q)
    return result


def crps_from_quantiles(
    observed: Any,
    predicted_quantiles: Any,
    quantiles: Sequence[float],
) -> float:
    r"""Approximate the Continuous Ranked Probability Score (CRPS) from predicted quantiles.

    Uses the identity:
        $$CRPS(y, F) = 2 \int_0^1 L_\tau(y, q_\tau) d\tau$$
    approximated via numerical composite trapezoidal integration across sorted quantiles.

    Parameters
    ----------
    observed : array-like
        Ground truth observations.
    predicted_quantiles : array-like
        Predicted quantiles array of shape (N, Q).
    quantiles : sequence of float
        Evaluated quantile levels (must be in ascending order).

    Returns
    -------
    float
        Approximated CRPS score (lower is better, in original physical units).
    """
    q_arr = np.asarray(quantiles, dtype=np.float64)
    if not np.all(np.diff(q_arr) > 0):
        msg = "Quantiles must be strictly increasing."
        raise ValueError(msg)

    losses = multi_quantile_pinball_loss(observed, predicted_quantiles, quantiles)
    loss_vals = np.array([losses[q] for q in q_arr], dtype=np.float64)

    # Trapezoidal integration of 2 * loss(tau) over tau in [min(q), max(q)]
    # Normalized by the span if boundary quantiles do not extend to 0 and 1
    span = float(q_arr[-1] - q_arr[0])
    if span <= 0.0:
        return 0.0

    integral = float(np.trapezoid(2.0 * loss_vals, q_arr))
    # Rescale by span to approximate full [0, 1] unit integral
    return float(integral / span)


def prediction_interval_coverage(
    observed: Any,
    lower_quantile_pred: Any,
    upper_quantile_pred: Any,
) -> float:
    r"""Compute the Prediction Interval Coverage Probability (PICP).

    Formula:
        $$PICP = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(q_{lower,i} \le y_i \le q_{upper,i})$$

    Parameters
    ----------
    observed : array-like
        Observed ground truth values.
    lower_quantile_pred : array-like
        Lower bound predictions (e.g. q=0.05).
    upper_quantile_pred : array-like
        Upper bound predictions (e.g. q=0.95).

    Returns
    -------
    float
        Fraction of observations falling within the prediction interval $[0, 1]$.
    """
    obs = np.asarray(observed, dtype=np.float64).ravel()
    q_low = np.asarray(lower_quantile_pred, dtype=np.float64).ravel()
    q_high = np.asarray(upper_quantile_pred, dtype=np.float64).ravel()

    if not (obs.shape == q_low.shape == q_high.shape):
        msg = "Observed, lower, and upper prediction arrays must have identical shapes."
        raise ValueError(msg)

    valid_mask = np.isfinite(obs) & np.isfinite(q_low) & np.isfinite(q_high)
    if not np.any(valid_mask):
        msg = "No finite values in prediction interval inputs."
        raise ValueError(msg)

    covered = (obs[valid_mask] >= q_low[valid_mask]) & (obs[valid_mask] <= q_high[valid_mask])
    return float(np.mean(covered))


def reliability_diagram_data(
    observed: Any,
    predicted_quantiles: Any,
    quantiles: Sequence[float],
) -> dict[str, np.ndarray]:
    r"""Compute nominal vs. empirical probabilities for reliability evaluation.

    For each quantile $\tau$, computes:
        $$\text{Empirical}(\tau) = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(y_i \le \hat{q}_{\tau, i})$$

    In a perfectly calibrated model, $\text{Empirical}(\tau) = \tau$.

    Parameters
    ----------
    observed : array-like
        Observed ground truth values.
    predicted_quantiles : array-like
        Predicted quantiles array of shape (N, Q).
    quantiles : sequence of float
        Target nominal quantile levels.

    Returns
    -------
    dict[str, np.ndarray]
        Dictionary with:
        - "nominal": Array of nominal quantile levels $\tau$.
        - "empirical": Array of observed empirical coverage frequencies.
    """
    obs, preds = _to_valid_probabilistic_arrays(observed, predicted_quantiles)
    nominal = np.asarray(quantiles, dtype=np.float64)
    empirical = np.zeros_like(nominal)

    for j, _q in enumerate(quantiles):
        empirical[j] = np.mean(obs <= preds[:, j])

    return {
        "nominal": nominal,
        "empirical": empirical,
    }
