# FloodPulse Model Cards Directory

This directory stores standardized model cards detailing the lineage, training procedures, intended uses, and performance evaluations for all models developed across the FloodPulse platform:

1. `streamflow_lstm.md` *(Phase 2)*: Multi-basin probabilistic LSTM streamflow model.
2. `terrain_susceptibility.md` *(Phase 3)*: HAND and slope terrain flood susceptibility classifier.
3. `road_closure.md` *(Phase 4)*: Road segment fragility and closure probability estimator.

Each model card follows the standard Mitchell et al. (2019) framework:
- Model Details & Intended Use
- Training Data & Pretraining Lineage (Caravan -> CAMELS-IND)
- Quantitative Evaluation across temporal splits and hold-out basins
- Ethical Considerations & Failure Modes
