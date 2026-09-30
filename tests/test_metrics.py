"""Unit tests for hydrological evaluation metrics."""

from __future__ import annotations

import numpy as np
import pytest
import xarray as xr

from floodpulse.evaluation.metrics import (
    evaluate_streamflow_all,
    kling_gupta_efficiency,
    mean_absolute_error,
    nash_sutcliffe_efficiency,
    peak_flow_error,
    peak_timing_error,
    root_mean_squared_error,
)


def test_perfect_prediction_known_values() -> None:
    """A perfect simulation should yield NSE=1, KGE=1, RMSE=0, MAE=0, PFE=0, PTE=0."""
    obs = np.array([10.0, 25.0, 50.0, 100.0, 30.0, 15.0])
    sim = obs.copy()

    assert nash_sutcliffe_efficiency(obs, sim) == pytest.approx(1.0)

    kge_res = kling_gupta_efficiency(obs, sim, return_components=True)
    assert isinstance(kge_res, dict)
    assert kge_res["kge"] == pytest.approx(1.0)
    assert kge_res["r"] == pytest.approx(1.0)
    assert kge_res["alpha"] == pytest.approx(1.0)
    assert kge_res["beta"] == pytest.approx(1.0)

    assert root_mean_squared_error(obs, sim) == pytest.approx(0.0)
    assert mean_absolute_error(obs, sim) == pytest.approx(0.0)
    assert peak_flow_error(obs, sim, relative=True) == pytest.approx(0.0)
    assert peak_flow_error(obs, sim, relative=False) == pytest.approx(0.0)
    assert peak_timing_error(obs, sim) == pytest.approx(0.0)


def test_mean_predictor_nse_zero() -> None:
    """Predicting the historical mean should yield NSE = 0.0."""
    obs = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
    sim = np.full_like(obs, fill_value=np.mean(obs))

    assert nash_sutcliffe_efficiency(obs, sim) == pytest.approx(0.0)


def test_kge_components_known_values() -> None:
    """Test KGE decomposition with deliberate bias, variance, and correlation changes."""
    obs = np.array([10.0, 20.0, 30.0, 40.0])
    # sim with double variance and 1.5x mean
    sim = 2.0 * obs

    comp = kling_gupta_efficiency(obs, sim, return_components=True)
    assert isinstance(comp, dict)
    assert comp["r"] == pytest.approx(1.0)
    assert comp["alpha"] == pytest.approx(2.0)
    assert comp["beta"] == pytest.approx(2.0)

    expected_kge = 1.0 - np.sqrt((1.0 - 1.0) ** 2 + (2.0 - 1.0) ** 2 + (2.0 - 1.0) ** 2)
    assert comp["kge"] == pytest.approx(expected_kge)


def test_nan_handling_and_xarray_compatibility() -> None:
    """Interleaved NaNs must be filtered out without distorting concurrent metrics."""
    obs_raw = [10.0, np.nan, 30.0, 40.0, 50.0, 60.0]
    sim_raw = [10.0, 20.0, np.nan, 40.0, 50.0, 60.0]

    obs_xr = xr.DataArray(obs_raw, dims=["time"])
    sim_xr = xr.DataArray(sim_raw, dims=["time"])

    # Valid concurrent points are index 0, 3, 4, 5 -> both arrays equal [10, 40, 50, 60]
    nse = nash_sutcliffe_efficiency(obs_xr, sim_xr)
    assert nse == pytest.approx(1.0)

    mae = mean_absolute_error(obs_xr, sim_xr)
    assert mae == pytest.approx(0.0)


def test_peak_flow_and_timing_errors() -> None:
    """Test peak flow magnitude and timing lag calculations."""
    obs = np.array([10.0, 20.0, 100.0, 40.0, 10.0])  # Peak at idx 2, val 100
    sim = np.array([10.0, 20.0, 30.0, 120.0, 10.0])  # Peak at idx 3, val 120

    # Relative peak flow error = (120 - 100) / 100 = 0.20
    assert peak_flow_error(obs, sim, relative=True) == pytest.approx(0.20)
    # Absolute peak flow error = 120 - 100 = 20
    assert peak_flow_error(obs, sim, relative=False) == pytest.approx(20.0)

    # Simulated peak delayed by 1 step (idx 3 - idx 2 = 1)
    assert peak_timing_error(obs, sim) == pytest.approx(1.0)

    # With datetime coordinates
    dates = np.array(
        ["2020-08-01", "2020-08-02", "2020-08-03", "2020-08-04", "2020-08-05"],
        dtype="datetime64[D]",
    )
    assert peak_timing_error(obs, sim, time_coords=dates) == pytest.approx(1.0)


def test_edge_cases_and_exceptions() -> None:
    """Edge cases: mismatched sizes, all NaNs, zero variance."""
    with pytest.raises(ValueError, match="does not match"):
        nash_sutcliffe_efficiency([1, 2], [1, 2, 3])

    with pytest.raises(ValueError, match="No concurrent valid"):
        nash_sutcliffe_efficiency([np.nan, 2.0], [1.0, np.nan])

    # Constant observed flow with identical sim: NSE = 1.0
    const_obs = np.array([5.0, 5.0, 5.0, 5.0])
    const_sim = np.array([5.0, 5.0, 5.0, 5.0])
    assert nash_sutcliffe_efficiency(const_obs, const_sim) == 1.0

    # Constant observed flow with different sim: NSE = -inf
    diff_sim = np.array([5.0, 6.0, 5.0, 4.0])
    assert nash_sutcliffe_efficiency(const_obs, diff_sim) == -float("inf")


def test_evaluate_streamflow_all_summary() -> None:
    """Check summary dictionary helper returns all core fields."""
    obs = np.array([10.0, 20.0, 50.0, 30.0, 10.0])
    sim = np.array([12.0, 22.0, 48.0, 28.0, 11.0])

    summary = evaluate_streamflow_all(obs, sim)
    assert "nse" in summary
    assert "kge" in summary
    assert "rmse" in summary
    assert "mae" in summary
    assert "peak_flow_error_rel" in summary
    assert "peak_timing_error_steps" in summary
