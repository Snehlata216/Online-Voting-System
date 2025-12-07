// src/utils/reportMappers.js

export function mapCandidatesToCsvRows(candidates = []) {
  return candidates.map((c) => ({
    CandidateID: c.candidateId ?? c.id ?? "",
    Name: c.name ?? "",
    Party: c.party ?? "",
    Votes: c.votes ?? c.totalVotes ?? 0,
    Percent: typeof c.percent !== "undefined" ? c.percent : "",
  }));
}

export function mapTurnoutToCsvRows(byConstituency = []) {
  return byConstituency.map((r) => ({
    Constituency: r.constituency ?? "Unknown",
    Registered: r.registered ?? 0,
    Votes: r.votes ?? 0,
    TurnoutPercent: r.turnoutPercent ?? 0,
  }));
}

export function mapPollToCsvRows(results = []) {
  return results.map((r, idx) => ({
    Option: r.text ?? `Option ${idx + 1}`,
    Votes: r.votes ?? 0,
    Percentage: r.percentage ?? 0,
  }));
}

export function mapFeedbackToCsvRows(feedback = []) {
  return feedback.map((f) => ({
    FeedbackID: f.id ?? f.feedbackId ?? "",
    VoterID: f.voterId ?? "",
    Rating: f.rating ?? "",
    Message: f.message ?? "",
    CreatedAt: f.createdAt ? new Date(f.createdAt).toISOString() : "",
  }));
}

export function csvFilename(prefix = "export") {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.csv`;
}
