import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export const predictAlloy = (data) => API.post("predict/", data);

// Feature 6: Compare multiple compositions
export const compareCompositions = (compositions, comparisonName) =>
  API.post("compare/", {
    compositions: compositions,
    comparison_name: comparisonName,
  });

// Feature 7: What-If Scenarios
export const runWhatIfScenario = (composition, elementName, variationPercentage, numSteps, scenarioName) =>
  API.post("what-if/", {
    composition: composition,
    element_name: elementName,
    variation_percentage: variationPercentage,
    num_steps: numSteps,
    scenario_name: scenarioName,
  });

// Get history of all runs
export const getAnalysisHistory = (limit = 50) =>
  API.get("history/", { params: { limit } });

// Get specific run details
export const getAnalysisDetail = (id) =>
  API.get(`history/${id}/`);
