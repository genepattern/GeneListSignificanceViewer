# FeatureSummaryViewer Documentation
## Description
Used to view a list of features from a predictor.


## Author
Ken Ross, Joshua Gould (Broad Institute),
gp-help@broadinstitute.org


## Summary
This is a tool that allows the user to view feature lists such as those produced by the KNN and weighted voting cross-validation prediction algorithms (KNNXValidation,  and WeightedVotingXValidation). These tables have three columns: feature name, feature description, and number of times features used (for leave-one-out cross-validation).

The viewer includes an interactive histogram of the features included in each cross validation run. Clicking on a point in the plot selects the corresponding element in the table and selecting an element in the table highlights the corresponding data point in the plot.

