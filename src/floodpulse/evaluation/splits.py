"""Data partitioning utilities enforcing strict temporal and spatial (basin) separation.

Eliminates lookahead and spatial data leakage by disallowing random cross-validation
and strictly partitioning sequences chronologically and by discrete river basin IDs.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import pandas as pd


class LeakageError(Exception):
    """Exception raised when temporal or spatial (basin) data leakage is detected."""


def assert_no_temporal_leakage(
    train_dates: Any,
    eval_dates: Any,
    buffer_days: int = 0,
) -> None:
    """Verify that no temporal overlap exists between training and evaluation series.

    Parameters
    ----------
    train_dates : array-like
        Collection of training timestamps.
    eval_dates : array-like
        Collection of evaluation/test timestamps.
    buffer_days : int, default=0
        Required gap in days between maximum training timestamp and minimum evaluation timestamp.

    Raises
    ------
    LeakageError
        If maximum training date is greater than or equal to minimum evaluation date minus buffer.
    """
    train_dt = pd.to_datetime(train_dates)
    eval_dt = pd.to_datetime(eval_dates)

    if len(train_dt) == 0 or len(eval_dt) == 0:
        return

    max_train = train_dt.max()
    min_eval = eval_dt.min()

    allowed_boundary = min_eval - pd.Timedelta(days=buffer_days)

    if max_train >= allowed_boundary:
        msg = (
            f"Temporal leakage detected: max training date ({max_train.strftime('%Y-%m-%d')}) "
            f"overlaps with or violates buffer before min evaluation date "
            f"({min_eval.strftime('%Y-%m-%d')}, required boundary < {allowed_boundary.strftime('%Y-%m-%d')})."
        )
        raise LeakageError(msg)


def assert_no_basin_leakage(
    train_basin_ids: Sequence[str] | set[str] | Any,
    eval_basin_ids: Sequence[str] | set[str] | Any,
) -> None:
    """Verify that no basin IDs overlap between training and evaluation partitions.

    Parameters
    ----------
    train_basin_ids : sequence or set of str
        Basin identifiers assigned to training partition.
    eval_basin_ids : sequence or set of str
        Basin identifiers assigned to evaluation/test partition.

    Raises
    ------
    LeakageError
        If any basin ID appears in both partitions.
    """
    set_train = {str(b) for b in train_basin_ids}
    set_eval = {str(b) for b in eval_basin_ids}

    overlap = set_train.intersection(set_eval)
    if overlap:
        msg = f"Spatial basin leakage detected! Overlapping basin IDs: {sorted(overlap)}"
        raise LeakageError(msg)


def chronological_split(
    df: pd.DataFrame,
    date_col: str | None = None,
    train_end: str | pd.Timestamp = "2005-12-31",
    val_end: str | pd.Timestamp = "2012-12-31",
    test_end: str | pd.Timestamp | None = "2020-12-31",
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Split a DataFrame chronologically into train, validation, and test subsets.

    Parameters
    ----------
    df : pd.DataFrame
        Input data table.
    date_col : str, optional
        Name of timestamp column. If None, DataFrame index is used.
    train_end : str or Timestamp, default='2005-12-31'
        Inclusive cutoff for training period.
    val_end : str or Timestamp, default='2012-12-31'
        Inclusive cutoff for validation period.
    test_end : str or Timestamp, optional, default='2020-12-31'
        Inclusive cutoff for testing period.

    Returns
    -------
    tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]
        (train_df, val_df, test_df)

    Raises
    ------
    LeakageError
        If temporal ordering is violated.
    """
    dates = pd.to_datetime(df[date_col] if date_col is not None else df.index)
    t_end = pd.to_datetime(train_end)
    v_end = pd.to_datetime(val_end)

    if t_end >= v_end:
        msg = f"train_end ({train_end}) must be strictly earlier than val_end ({val_end})."
        raise ValueError(msg)

    mask_train = dates <= t_end
    mask_val = (dates > t_end) & (dates <= v_end)

    if test_end is not None:
        te_end = pd.to_datetime(test_end)
        if v_end >= te_end:
            msg = f"val_end ({val_end}) must be strictly earlier than test_end ({test_end})."
            raise ValueError(msg)
        mask_test = (dates > v_end) & (dates <= te_end)
    else:
        mask_test = dates > v_end

    df_train = df.loc[mask_train].copy()
    df_val = df.loc[mask_val].copy()
    df_test = df.loc[mask_test].copy()

    # Enforce leakage assertions
    if len(df_train) > 0 and len(df_val) > 0:
        d_train = df_train[date_col] if date_col else df_train.index
        d_val = df_val[date_col] if date_col else df_val.index
        assert_no_temporal_leakage(d_train, d_val)

    if len(df_val) > 0 and len(df_test) > 0:
        d_val = df_val[date_col] if date_col else df_val.index
        d_test = df_test[date_col] if date_col else df_test.index
        assert_no_temporal_leakage(d_val, d_test)

    return df_train, df_val, df_test


def basin_holdout_split(
    df: pd.DataFrame,
    basin_col: str,
    holdout_basin_ids: Sequence[str] | set[str],
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split a multi-basin DataFrame into calibration basins and holdout basins.

    Parameters
    ----------
    df : pd.DataFrame
        Dataset containing records across multiple basins.
    basin_col : str
        Column containing basin identifiers.
    holdout_basin_ids : sequence of str
        Identifiers of basins reserved exclusively for out-of-basin generalization testing.

    Returns
    -------
    tuple[pd.DataFrame, pd.DataFrame]
        (train_basins_df, holdout_basins_df)
    """
    holdout_set = {str(b) for b in holdout_basin_ids}
    is_holdout = df[basin_col].astype(str).isin(holdout_set)

    df_train_basins = df.loc[~is_holdout].copy()
    df_holdout_basins = df.loc[is_holdout].copy()

    train_ids = df_train_basins[basin_col].unique()
    eval_ids = df_holdout_basins[basin_col].unique()

    assert_no_basin_leakage(train_ids, eval_ids)

    return df_train_basins, df_holdout_basins
