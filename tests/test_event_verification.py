"""Unit tests for threshold event verification and flood contingency metrics."""

from __future__ import annotations

import numpy as np
import pytest

from floodpulse.evaluation.event_verification import (
    contingency_table,
    critical_success_index,
    false_alarm_ratio,
    flood_event_contingency,
    probability_of_detection,
)


def test_contingency_table_known_values() -> None:
    """Verify manual contingency calculations:

    Threshold = 50.0
    Observed:  [10, 60, 70, 20, 80, 15, 90, 40] -> events at idx 1, 2, 4, 6 (4 events)
    Simulated: [10, 65, 30, 55, 85, 10, 95, 20] -> predictions at idx 1, 3, 4, 6 (4 predicted)

    Hits: idx 1, 4, 6 -> 3 hits
    False Alarms: idx 3 (obs=20, sim=55) -> 1 FA
    Misses: idx 2 (obs=70, sim=30) -> 1 Miss
    Correct Negatives: idx 0, 5, 7 -> 3 CN
    Total: 8
    """
    obs = np.array([10.0, 60.0, 70.0, 20.0, 80.0, 15.0, 90.0, 40.0])
    sim = np.array([10.0, 65.0, 30.0, 55.0, 85.0, 10.0, 95.0, 20.0])
    thresh = 50.0

    tbl = contingency_table(obs, sim, threshold=thresh)
    assert tbl["hits"] == 3
    assert tbl["false_alarms"] == 1
    assert tbl["misses"] == 1
    assert tbl["correct_negatives"] == 3
    assert tbl["total"] == 8

    # POD = H / (H + M) = 3 / (3 + 1) = 0.75
    assert probability_of_detection(obs, sim, threshold=thresh) == pytest.approx(0.75)

    # FAR = FA / (H + FA) = 1 / (3 + 1) = 0.25
    assert false_alarm_ratio(obs, sim, threshold=thresh) == pytest.approx(0.25)

    # CSI = H / (H + FA + M) = 3 / (3 + 1 + 1) = 3 / 5 = 0.60
    assert critical_success_index(obs, sim, threshold=thresh) == pytest.approx(0.60)


def test_percentile_threshold_contingency() -> None:
    """Test setting threshold dynamically via percentile."""
    obs = np.linspace(10.0, 100.0, 10)  # 10, 20, ..., 100
    sim = obs.copy()

    # With identical simulation and 80th percentile threshold, POD=1.0, FAR=0.0, CSI=1.0
    summary = flood_event_contingency(obs, sim, threshold_percentile=80.0)
    assert summary["pod"] == pytest.approx(1.0)
    assert summary["far"] == pytest.approx(0.0)
    assert summary["csi"] == pytest.approx(1.0)


def test_edge_cases_no_events() -> None:
    """Test boundary condition when no events occur in observed or simulated series."""
    obs = np.array([10.0, 12.0, 15.0])
    sim = np.array([11.0, 13.0, 14.0])
    thresh = 100.0  # Far above all values

    # Zero hits, zero misses, zero false alarms
    tbl = contingency_table(obs, sim, threshold=thresh)
    assert tbl["hits"] == 0
    assert tbl["false_alarms"] == 0
    assert tbl["misses"] == 0
    assert tbl["correct_negatives"] == 3

    assert probability_of_detection(obs, sim, threshold=thresh) == pytest.approx(1.0)
    assert false_alarm_ratio(obs, sim, threshold=thresh) == pytest.approx(0.0)
    assert critical_success_index(obs, sim, threshold=thresh) == pytest.approx(1.0)


def test_invalid_threshold_arguments() -> None:
    """Providing both or neither threshold arguments must raise ValueError."""
    obs = [10.0, 20.0]
    sim = [10.0, 20.0]

    with pytest.raises(ValueError, match="either 'threshold' or 'threshold_percentile'"):
        contingency_table(obs, sim)

    with pytest.raises(ValueError, match="not both"):
        contingency_table(obs, sim, threshold=15.0, threshold_percentile=50.0)
