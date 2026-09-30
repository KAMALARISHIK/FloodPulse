"""Hydrological evaluation metrics for streamflow forecasting.

Implements standard benchmark metrics including Nash-Sutcliffe Efficiency (NSE),
Kling-Gupta Efficiency (KGE) with constituent decomposition, Root Mean Squared
Error (RMSE), Mean Absolute Error (MAE), Peak Flow Error (PFE), and Peak Timing Error (PTE).
"""

from __future__ import annotations

from typing import Any

import numpy as np


def _to_valid_pair_arrays(
    observed: Any,
    simulated: Any,
) -> tuple[np.ndarray, np.ndarray]:
    """Convert inputs to 1D float arrays and mask out NaN/infinite pairs.

    Parameters
    ----------
    observed : array-like or xarray.DataArray
        Ground-truth streamflow observations.
    simulated : array-like or xarray.DataArray
        Model simulated/forecast streamflow.

    Returns
    -------
    tuple[np.ndarray, np.ndarray]
        Cleaned 1D numpy arrays containing only concurrent valid observations.

    Raises
    ------
    ValueError
        If inputs have mismatched lengths or contain no valid overlapping entries.
    """
    obs = np.asarray(observed, dtype=np.float64).ravel()
    sim = np.asarray(simulated, dtype=np.float64).ravel()

    if obs.shape != sim.shape:
        msg = f"Observed shape {obs.shape} does not match simulated shape {sim.shape}."
        raise ValueError(msg)

    valid_mask = np.isfinite(obs) & np.isfinite(sim)
    obs_clean = obs[valid_mask]
    sim_clean = sim[valid_mask]

    if obs_clean.size == 0:
        msg = "No concurrent valid (finite) observed and simulated values found."
        raise ValueError(msg)

    return obs_clean, sim_clean


def nash_sutcliffe_efficiency(
    observed: Any,
    simulated: Any,
) -> float:
    r"""Compute the Nash-Sutcliffe Efficiency (NSE).

    Formula:
        $$NSE = 1 - \frac{\sum_{t=1}^N (Q_{obs,t} - Q_{sim,t})^2}{\sum_{t=1}^N (Q_{obs,t} - \overline{Q_{obs}})^2}$$

    Range: $(-\infty, 1]$. $NSE = 1$ is a perfect match. $NSE = 0$ indicates model
    predictions are as accurate as the mean of the observed data.

    Parameters
    ----------
    observed : array-like
        Observed streamflow series.
    simulated : array-like
        Simulated streamflow series.

    Returns
    -------
    float
        Nash-Sutcliffe Efficiency score.
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)

    denom = np.sum((obs - np.mean(obs)) ** 2)
    if denom == 0.0:
        # Observed streamflow is constant
        return 1.0 if np.allclose(obs, sim) else -float("inf")

    numer = np.sum((obs - sim) ** 2)
    return float(1.0 - (numer / denom))


def kling_gupta_efficiency(
    observed: Any,
    simulated: Any,
    return_components: bool = False,
) -> float | dict[str, float]:
    r"""Compute the Kling-Gupta Efficiency (KGE; Gupta et al., 2009).

    Formula:
        $$KGE = 1 - \sqrt{(r - 1)^2 + (\alpha - 1)^2 + (\beta - 1)^2}$$
        where:
        - $r$ is the Pearson correlation coefficient
        - $\alpha = \sigma_{sim} / \sigma_{obs}$ (relative variability)
        - $\beta = \mu_{sim} / \mu_{obs}$ (bias ratio)

    Range: $(-\infty, 1]$. $KGE = 1$ is a perfect match.

    Parameters
    ----------
    observed : array-like
        Observed streamflow values.
    simulated : array-like
        Simulated streamflow values.
    return_components : bool, default=False
        If True, returns a dictionary containing {"kge", "r", "alpha", "beta"}.

    Returns
    -------
    float or dict[str, float]
        Overall KGE or dictionary of decomposed components.
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)

    std_obs = float(np.std(obs, ddof=0))
    std_sim = float(np.std(sim, ddof=0))
    mean_obs = float(np.mean(obs))
    mean_sim = float(np.mean(sim))

    # Correlation coefficient r
    if std_obs == 0.0 or std_sim == 0.0:
        r = 1.0 if np.allclose(obs, sim) else 0.0
    else:
        cov = np.cov(obs, sim, ddof=0)[0, 1]
        r = float(cov / (std_obs * std_sim))
        # Numerical guard against float precision errors
        r = float(np.clip(r, -1.0, 1.0))

    # Variability ratio alpha
    if std_obs == 0.0:
        alpha = 1.0 if std_sim == 0.0 else float("inf")
    else:
        alpha = std_sim / std_obs

    # Bias ratio beta
    if mean_obs == 0.0:
        beta = 1.0 if mean_sim == 0.0 else float("inf")
    else:
        beta = mean_sim / mean_obs

    # Kling-Gupta metric
    if not (np.isfinite(alpha) and np.isfinite(beta) and np.isfinite(r)):
        kge = -float("inf")
    else:
        ed = (r - 1.0) ** 2 + (alpha - 1.0) ** 2 + (beta - 1.0) ** 2
        kge = float(1.0 - np.sqrt(ed))

    if return_components:
        return {"kge": kge, "r": r, "alpha": alpha, "beta": beta}
    return kge


def root_mean_squared_error(
    observed: Any,
    simulated: Any,
) -> float:
    r"""Compute Root Mean Squared Error (RMSE).

    Formula:
        $$RMSE = \sqrt{\frac{1}{N} \sum_{t=1}^N (Q_{obs,t} - Q_{sim,t})^2}$$

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.

    Returns
    -------
    float
        RMSE in the same physical units as input.
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)
    return float(np.sqrt(np.mean((obs - sim) ** 2)))


def mean_absolute_error(
    observed: Any,
    simulated: Any,
) -> float:
    r"""Compute Mean Absolute Error (MAE).

    Formula:
        $$MAE = \frac{1}{N} \sum_{t=1}^N |Q_{obs,t} - Q_{sim,t}|$$

    Parameters
    ----------
    observed : array-like
        Observed values.
    simulated : array-like
        Simulated values.

    Returns
    -------
    float
        MAE in the same physical units as input.
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)
    return float(np.mean(np.abs(obs - sim)))


def peak_flow_error(
    observed: Any,
    simulated: Any,
    relative: bool = True,
) -> float:
    r"""Calculate error in maximum peak streamflow discharge.

    Parameters
    ----------
    observed : array-like
        Observed streamflow series.
    simulated : array-like
        Simulated streamflow series.
    relative : bool, default=True
        If True, returns relative fractional error $(Q_{sim}^{max} - Q_{obs}^{max}) / Q_{obs}^{max}$.
        If False, returns absolute error $Q_{sim}^{max} - Q_{obs}^{max}$.

    Returns
    -------
    float
        Peak flow error.
    """
    obs, sim = _to_valid_pair_arrays(observed, simulated)
    peak_obs = float(np.max(obs))
    peak_sim = float(np.max(sim))

    diff = peak_sim - peak_obs
    if relative:
        if peak_obs == 0.0:
            return 0.0 if peak_sim == 0.0 else float("inf")
        return float(diff / peak_obs)
    return float(diff)


def peak_timing_error(
    observed: Any,
    simulated: Any,
    time_coords: Any | None = None,
) -> float:
    r"""Calculate the time lag between the simulated and observed peak streamflows.

    Positive values indicate delayed simulated peak; negative values indicate premature peak.
    Formula:
        $$\Delta t_{peak} = t_{sim,max} - t_{obs,max}$$

    Parameters
    ----------
    observed : array-like
        Observed streamflow series.
    simulated : array-like
        Simulated streamflow series.
    time_coords : array-like, optional
        Timestamps or coordinate array corresponding to the series. If None,
        integer step indices are used. If datetime-like, difference is expressed
        in days (or fractional days).

    Returns
    -------
    float
        Lag between simulated and observed peaks in coordinate units (or integer index steps).
    """
    obs = np.asarray(observed, dtype=np.float64).ravel()
    sim = np.asarray(simulated, dtype=np.float64).ravel()

    if obs.shape != sim.shape:
        msg = f"Observed shape {obs.shape} does not match simulated shape {sim.shape}."
        raise ValueError(msg)

    # Use valid values
    if not (np.any(np.isfinite(obs)) and np.any(np.isfinite(sim))):
        msg = "No finite values in observed or simulated series to identify peak timing."
        raise ValueError(msg)

    # Mask nans with -infinity to locate peak among finite values
    obs_masked = np.where(np.isfinite(obs), obs, -float("inf"))
    sim_masked = np.where(np.isfinite(sim), sim, -float("inf"))

    idx_peak_obs = int(np.argmax(obs_masked))
    idx_peak_sim = int(np.argmax(sim_masked))

    if time_coords is None:
        return float(idx_peak_sim - idx_peak_obs)

    times = np.asarray(time_coords).ravel()
    if times.shape != obs.shape:
        msg = f"time_coords shape {times.shape} does not match series shape {obs.shape}."
        raise ValueError(msg)

    t_obs = times[idx_peak_obs]
    t_sim = times[idx_peak_sim]

    if hasattr(t_sim - t_obs, "total_seconds"):
        # timedelta object: convert to days
        return float((t_sim - t_obs).total_seconds() / 86400.0)
    if np.issubdtype(times.dtype, np.datetime64):
        # numpy datetime64
        diff_ns = (t_sim - t_obs).astype("timedelta64[s]").astype(np.float64)
        return float(diff_ns / 86400.0)

    # Numeric coordinate
    return float(t_sim - t_obs)


def evaluate_streamflow_all(
    observed: Any,
    simulated: Any,
) -> dict[str, float]:
    """Calculate all standard deterministic streamflow metrics at once.

    Parameters
    ----------
    observed : array-like
        Observed streamflow series.
    simulated : array-like
        Simulated streamflow series.

    Returns
    -------
    dict[str, float]
        Dictionary with nse, kge, rmse, mae, peak_flow_error, peak_timing_error.
    """
    kge_comp = kling_gupta_efficiency(observed, simulated, return_components=True)
    assert isinstance(kge_comp, dict)

    return {
        "nse": nash_sutcliffe_efficiency(observed, simulated),
        "kge": kge_comp["kge"],
        "kge_r": kge_comp["r"],
        "kge_alpha": kge_comp["alpha"],
        "kge_beta": kge_comp["beta"],
        "rmse": root_mean_squared_error(observed, simulated),
        "mae": mean_absolute_error(observed, simulated),
        "peak_flow_error_rel": peak_flow_error(observed, simulated, relative=True),
        "peak_timing_error_steps": peak_timing_error(observed, simulated),
    }
