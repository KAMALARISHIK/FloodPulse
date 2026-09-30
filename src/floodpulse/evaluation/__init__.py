"""Evaluation protocols, hydrological metrics, probabilistic calibration, and baselines."""

from floodpulse.evaluation.baselines import (
    DayOfYearClimatologyForecaster,
    PersistenceForecaster,
)
from floodpulse.evaluation.calibration import (
    crps_from_quantiles,
    multi_quantile_pinball_loss,
    pinball_loss,
    prediction_interval_coverage,
    reliability_diagram_data,
)
from floodpulse.evaluation.event_verification import (
    contingency_table,
    critical_success_index,
    false_alarm_ratio,
    flood_event_contingency,
    probability_of_detection,
)
from floodpulse.evaluation.metrics import (
    kling_gupta_efficiency,
    mean_absolute_error,
    nash_sutcliffe_efficiency,
    peak_flow_error,
    peak_timing_error,
    root_mean_squared_error,
)
from floodpulse.evaluation.splits import (
    LeakageError,
    assert_no_basin_leakage,
    assert_no_temporal_leakage,
    basin_holdout_split,
    chronological_split,
)

__all__ = [
    "nash_sutcliffe_efficiency",
    "kling_gupta_efficiency",
    "root_mean_squared_error",
    "mean_absolute_error",
    "peak_flow_error",
    "peak_timing_error",
    "probability_of_detection",
    "false_alarm_ratio",
    "critical_success_index",
    "contingency_table",
    "flood_event_contingency",
    "pinball_loss",
    "multi_quantile_pinball_loss",
    "crps_from_quantiles",
    "prediction_interval_coverage",
    "reliability_diagram_data",
    "PersistenceForecaster",
    "DayOfYearClimatologyForecaster",
    "chronological_split",
    "basin_holdout_split",
    "assert_no_temporal_leakage",
    "assert_no_basin_leakage",
    "LeakageError",
]
