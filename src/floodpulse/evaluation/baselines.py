"""Standard hydrological benchmark baselines for streamflow forecasting.

Implements Persistence (lagged observation) and Day-of-Year (DOY) Climatology
forecasters, supporting both deterministic and empirical quantile predictions.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import numpy as np
import pandas as pd


class PersistenceForecaster:
    r"""Persistence benchmark forecaster.

    Predicts streamflow at time t as the observed value at time t - lead_time:
    $$\hat{Q}_{t} = Q_{t - h}$$
    """

    def __init__(self, lead_time_steps: int = 1) -> None:
        """Initialize persistence forecaster.

        Parameters
        ----------
        lead_time_steps : int, default=1
            Number of discrete time steps to lag (e.g. 1 day ahead).
        """
        if lead_time_steps < 1:
            msg = f"lead_time_steps must be >= 1, got {lead_time_steps}."
            raise ValueError(msg)
        self.lead_time_steps = lead_time_steps

    def predict(self, series: Any) -> np.ndarray:
        """Generate persistence forecast from a continuous sequence.

        Parameters
        ----------
        series : array-like
            Historical streamflow observations.

        Returns
        -------
        np.ndarray
            Persistence forecast array of the same length as series. The initial
            `lead_time_steps` entries are populated with np.nan.
        """
        arr = np.asarray(series, dtype=np.float64).ravel()
        pred = np.full_like(arr, fill_value=np.nan)
        if arr.size > self.lead_time_steps:
            pred[self.lead_time_steps :] = arr[: -self.lead_time_steps]
        return pred


class DayOfYearClimatologyForecaster:
    """Historical Day-of-Year (DOY) Climatology forecaster.

    Calculates the long-term empirical distribution of streamflow for each day
    of the year (1..366) over the calibration/training period, supporting both
    deterministic (mean or median) and probabilistic (empirical quantile) predictions.
    """

    def __init__(self, aggregation: str = "median") -> None:
        """Initialize DOY Climatology forecaster.

        Parameters
        ----------
        aggregation : {"median", "mean"}, default="median"
            Central tendency metric for deterministic prediction.
        """
        if aggregation not in {"median", "mean"}:
            msg = f"aggregation must be 'median' or 'mean', got {aggregation}."
            raise ValueError(msg)
        self.aggregation = aggregation
        self._doy_climatology: dict[int, float] = {}
        self._doy_series: dict[int, np.ndarray] = {}
        self._global_fallback: float = np.nan

    def fit(self, dates: Any, series: Any) -> DayOfYearClimatologyForecaster:
        """Fit climatology on training timestamps and observed streamflow.

        Parameters
        ----------
        dates : array-like of datetime-like
            Timestamps corresponding to the training series.
        series : array-like of float
            Observed streamflow values during training.

        Returns
        -------
        DayOfYearClimatologyForecaster
            Self.
        """
        dt_index = pd.to_datetime(dates)
        vals = np.asarray(series, dtype=np.float64).ravel()

        if len(dt_index) != len(vals):
            msg = f"Length of dates ({len(dt_index)}) != length of series ({len(vals)})."
            raise ValueError(msg)

        valid_mask = np.isfinite(vals)
        if not np.any(valid_mask):
            msg = "Cannot fit climatology: no valid streamflow values in training data."
            raise ValueError(msg)

        dt_valid = dt_index[valid_mask]
        vals_valid = vals[valid_mask]

        self._global_fallback = (
            float(np.median(vals_valid))
            if self.aggregation == "median"
            else float(np.mean(vals_valid))
        )

        df = pd.DataFrame({"doy": dt_valid.dayofyear, "flow": vals_valid})

        self._doy_series.clear()
        self._doy_climatology.clear()

        for doy_val, group in df.groupby("doy"):
            doy_key = int(float(str(doy_val)))
            flow_vals = group["flow"].to_numpy(dtype=np.float64)
            self._doy_series[doy_key] = flow_vals
            if self.aggregation == "median":
                self._doy_climatology[doy_key] = float(np.median(flow_vals))
            else:
                self._doy_climatology[doy_key] = float(np.mean(flow_vals))

        return self

    def predict(self, dates: Any) -> np.ndarray:
        """Generate deterministic climatology predictions for given dates.

        Parameters
        ----------
        dates : array-like of datetime-like
            Dates to predict for.

        Returns
        -------
        np.ndarray
            1D array of predicted streamflow.
        """
        if not self._doy_climatology:
            msg = "Forecaster is not fitted. Call fit() first."
            raise RuntimeError(msg)

        dt_index = pd.to_datetime(dates)
        preds = np.zeros(len(dt_index), dtype=np.float64)

        for i, dt in enumerate(dt_index):
            doy = int(dt.dayofyear)
            preds[i] = self._doy_climatology.get(doy, self._global_fallback)

        return preds

    def predict_quantiles(
        self,
        dates: Any,
        quantiles: Sequence[float],
    ) -> np.ndarray:
        """Predict empirical streamflow quantiles for requested dates.

        Parameters
        ----------
        dates : array-like of datetime-like
            Dates to predict for.
        quantiles : sequence of float
            Quantile levels in (0, 1), e.g. [0.05, 0.5, 0.95].

        Returns
        -------
        np.ndarray
            Array of shape (N, len(quantiles)).
        """
        if not self._doy_series:
            msg = "Forecaster is not fitted. Call fit() first."
            raise RuntimeError(msg)

        dt_index = pd.to_datetime(dates)
        q_list = list(quantiles)
        out = np.zeros((len(dt_index), len(q_list)), dtype=np.float64)

        for i, dt in enumerate(dt_index):
            doy = int(dt.dayofyear)
            series_doy = self._doy_series.get(doy)
            if series_doy is not None and len(series_doy) > 0:
                out[i, :] = np.percentile(series_doy, [q * 100.0 for q in q_list])
            else:
                out[i, :] = self._global_fallback

        return out
