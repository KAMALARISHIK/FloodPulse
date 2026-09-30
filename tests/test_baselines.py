"""Unit tests for baseline hydrological forecasters (Persistence and Climatology)."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from floodpulse.evaluation.baselines import (
    DayOfYearClimatologyForecaster,
    PersistenceForecaster,
)


def test_persistence_forecaster_1step() -> None:
    """Persistence with 1-step lead time shifts series by 1 and fills index 0 with NaN."""
    series = np.array([10.0, 15.0, 30.0, 25.0])
    forecaster = PersistenceForecaster(lead_time_steps=1)
    preds = forecaster.predict(series)

    assert np.isnan(preds[0])
    assert np.allclose(preds[1:], [10.0, 15.0, 30.0])


def test_persistence_forecaster_multistep() -> None:
    """Persistence with 2-step lead time shifts series by 2."""
    series = np.array([10.0, 15.0, 30.0, 25.0])
    forecaster = PersistenceForecaster(lead_time_steps=2)
    preds = forecaster.predict(series)

    assert np.isnan(preds[0])
    assert np.isnan(preds[1])
    assert np.allclose(preds[2:], [10.0, 15.0])


def test_doy_climatology_median_and_mean() -> None:
    """Climatology must compute exact mean/median per day-of-year across multiple years."""
    # Two years of data for Jan 1 and Jan 2
    dates = pd.to_datetime(["2018-01-01", "2018-01-02", "2019-01-01", "2019-01-02"])
    # Jan 1 flows: [10, 30] -> median=20, mean=20
    # Jan 2 flows: [20, 80] -> median=50, mean=50
    flows = np.array([10.0, 20.0, 30.0, 80.0])

    clim_med = DayOfYearClimatologyForecaster(aggregation="median").fit(dates, flows)
    eval_dates = pd.to_datetime(["2020-01-01", "2020-01-02"])
    preds = clim_med.predict(eval_dates)

    assert preds[0] == pytest.approx(20.0)
    assert preds[1] == pytest.approx(50.0)


def test_doy_climatology_quantiles() -> None:
    """Check that DayOfYearClimatologyForecaster predicts sorted empirical quantiles."""
    dates = pd.date_range("2010-01-01", "2015-12-31", freq="D")
    rng = np.random.default_rng(42)
    # Seasonal synthetic flow
    doy = dates.dayofyear.to_numpy()
    flows = 50.0 + 30.0 * np.sin(2 * np.pi * doy / 365.25) + rng.normal(0, 5, size=len(dates))

    clim = DayOfYearClimatologyForecaster().fit(dates, flows)
    test_dates = pd.date_range("2016-01-01", "2016-01-10", freq="D")
    quantiles = [0.1, 0.5, 0.9]

    q_preds = clim.predict_quantiles(test_dates, quantiles=quantiles)
    assert q_preds.shape == (10, 3)

    # Monotonicity check across quantiles
    assert np.all(q_preds[:, 0] <= q_preds[:, 1])
    assert np.all(q_preds[:, 1] <= q_preds[:, 2])


def test_unfitted_forecaster_error() -> None:
    """Predicting with unfitted climatology must raise RuntimeError."""
    clim = DayOfYearClimatologyForecaster()
    with pytest.raises(RuntimeError, match="not fitted"):
        clim.predict(["2020-01-01"])
