"""Unit tests for chronological and basin holdout splitting protocols."""

from __future__ import annotations

import pandas as pd
import pytest

from floodpulse.evaluation.splits import (
    LeakageError,
    assert_no_basin_leakage,
    assert_no_temporal_leakage,
    basin_holdout_split,
    chronological_split,
)


def test_chronological_split_clean_separation() -> None:
    """Chronological split must partition dates with zero overlap."""
    dates = pd.date_range("1980-01-01", "2020-12-31", freq="D")
    df = pd.DataFrame({"flow": range(len(dates))}, index=dates)

    train_df, val_df, test_df = chronological_split(
        df,
        train_end="2005-12-31",
        val_end="2012-12-31",
        test_end="2020-12-31",
    )

    assert train_df.index.max() == pd.Timestamp("2005-12-31")
    assert val_df.index.min() == pd.Timestamp("2006-01-01")
    assert val_df.index.max() == pd.Timestamp("2012-12-31")
    assert test_df.index.min() == pd.Timestamp("2013-01-01")
    assert test_df.index.max() == pd.Timestamp("2020-12-31")

    # Assert no temporal leakage
    assert_no_temporal_leakage(train_df.index, val_df.index)
    assert_no_temporal_leakage(val_df.index, test_df.index)


def test_temporal_leakage_assertion_raises() -> None:
    """Overlapping training and test dates must trigger LeakageError."""
    train_dates = pd.date_range("2000-01-01", "2010-12-31", freq="D")
    leaking_eval_dates = pd.date_range("2010-06-01", "2015-12-31", freq="D")

    with pytest.raises(LeakageError, match="Temporal leakage detected"):
        assert_no_temporal_leakage(train_dates, leaking_eval_dates)


def test_temporal_buffer_violation() -> None:
    """Buffer violations must raise LeakageError."""
    train_dates = pd.date_range("2000-01-01", "2000-01-10", freq="D")
    eval_dates = pd.date_range("2000-01-12", "2000-01-20", freq="D")

    # Gap is 2 days. Requiring a 7-day buffer must raise LeakageError.
    with pytest.raises(LeakageError, match="buffer"):
        assert_no_temporal_leakage(train_dates, eval_dates, buffer_days=7)


def test_basin_holdout_split_and_leakage() -> None:
    """Basin holdout must isolate designated basins with zero overlap."""
    df = pd.DataFrame(
        {
            "basin_id": ["basin_A", "basin_B", "basin_C", "basin_D"],
            "area": [100, 200, 300, 400],
        }
    )

    holdout = ["basin_C", "basin_D"]
    train_basins_df, holdout_basins_df = basin_holdout_split(
        df, basin_col="basin_id", holdout_basin_ids=holdout
    )

    assert set(train_basins_df["basin_id"]) == {"basin_A", "basin_B"}
    assert set(holdout_basins_df["basin_id"]) == {"basin_C", "basin_D"}

    # Overlapping basin sets must raise LeakageError
    with pytest.raises(LeakageError, match="Spatial basin leakage detected"):
        assert_no_basin_leakage(["basin_A", "basin_B"], ["basin_B", "basin_C"])


def test_random_split_fails_temporal_leakage() -> None:
    """Demonstrate why random train/test splitting is invalid in hydrology:

    Random sampling draws training samples from future dates, violating causality.
    """
    # Random split simulated: train has day 10, test has day 5
    random_train = pd.to_datetime(["2010-01-01", "2010-01-10"])
    random_test = pd.to_datetime(["2010-01-05"])

    with pytest.raises(LeakageError, match="Temporal leakage detected"):
        assert_no_temporal_leakage(random_train, random_test)
