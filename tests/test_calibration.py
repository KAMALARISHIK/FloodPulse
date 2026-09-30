"""Unit tests for probabilistic calibration, pinball loss, CRPS, and reliability."""

from __future__ import annotations

import numpy as np
import pytest

from floodpulse.evaluation.calibration import (
    crps_from_quantiles,
    multi_quantile_pinball_loss,
    pinball_loss,
    prediction_interval_coverage,
    reliability_diagram_data,
)


def test_pinball_loss_known_values() -> None:
    """Pinball loss at tau=0.5 must equal 0.5 * MAE:

    For y = [10, 20, 30] and y_hat = [12, 18, 35]:
    Errors: [-2, +2, -5]
    Abs errors: [2, 2, 5], MAE = 9 / 3 = 3.0
    At tau=0.5: pinball loss = 0.5 * 3.0 = 1.5
    """
    obs = np.array([10.0, 20.0, 30.0])
    pred_median = np.array([12.0, 18.0, 35.0])

    loss_50 = pinball_loss(obs, pred_median, quantile=0.5)
    assert loss_50 == pytest.approx(1.5)


def test_pinball_loss_asymmetry() -> None:
    """At tau=0.9, underprediction (obs > pred) is penalized 9x more than overprediction."""
    obs = np.array([10.0])

    # Case A: Underprediction by 10 units (obs=10, pred=0)
    loss_under = pinball_loss(obs, np.array([0.0]), quantile=0.9)
    # Loss = 0.9 * (10 - 0) = 9.0
    assert loss_under == pytest.approx(9.0)

    # Case B: Overprediction by 10 units (obs=10, pred=20)
    loss_over = pinball_loss(obs, np.array([20.0]), quantile=0.9)
    # Loss = (0.9 - 1) * (10 - 20) = -0.1 * -10 = 1.0
    assert loss_over == pytest.approx(1.0)


def test_multi_quantile_loss_and_crps() -> None:
    """Test multi-quantile pinball evaluation and CRPS approximation."""
    obs = np.array([10.0, 20.0, 30.0, 40.0])
    quantiles = [0.1, 0.5, 0.9]

    # Predictions where q10 < q50 < q90
    preds = np.array(
        [
            [8.0, 10.0, 12.0],
            [17.0, 20.0, 24.0],
            [26.0, 30.0, 33.0],
            [35.0, 40.0, 44.0],
        ]
    )

    losses = multi_quantile_pinball_loss(obs, preds, quantiles)
    assert 0.1 in losses
    assert 0.5 in losses
    assert 0.9 in losses

    crps = crps_from_quantiles(obs, preds, quantiles)
    assert crps >= 0.0
    assert np.isfinite(crps)


def test_prediction_interval_coverage() -> None:
    """Test PICP calculation across nominal intervals."""
    obs = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
    # Lower bound below all obs except idx 4 (obs=50, low=52 -> not covered)
    low = np.array([5.0, 15.0, 25.0, 35.0, 52.0])
    high = np.array([15.0, 25.0, 35.0, 45.0, 60.0])

    # Covered at idx 0, 1, 2, 3 -> 4 / 5 = 0.80
    picp = prediction_interval_coverage(obs, low, high)
    assert picp == pytest.approx(0.80)


def test_reliability_diagram_data() -> None:
    """Check reliability diagram nominal and empirical calculations."""
    obs = np.array([10.0, 20.0, 30.0, 40.0])
    # Predictions matching exactly the observations at median
    preds = np.column_stack([obs - 5.0, obs, obs + 5.0])
    quantiles = [0.25, 0.50, 0.75]

    rel = reliability_diagram_data(obs, preds, quantiles)
    assert np.allclose(rel["nominal"], [0.25, 0.50, 0.75])
    # At q=0.50 (where pred == obs), obs <= pred is 4/4 = 1.0
    assert 0.0 <= rel["empirical"][0] <= 1.0


def test_invalid_quantile_inputs() -> None:
    """Invalid quantiles (<0 or >1) or unsorted quantiles should raise ValueError."""
    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        pinball_loss([10.0], [10.0], quantile=0.0)

    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        pinball_loss([10.0], [10.0], quantile=1.2)

    with pytest.raises(ValueError, match="strictly increasing"):
        crps_from_quantiles([10.0], [[10.0, 10.0]], quantiles=[0.9, 0.1])
