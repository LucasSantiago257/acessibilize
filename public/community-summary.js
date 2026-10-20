// Cada relato observado conta igualmente. A data só ordena o histórico.
function summarizeResources(reports) {
  const summary = {};
  for (const report of reports) {
    for (const [key, status] of Object.entries(report.features || {})) {
      if (!['present', 'partial', 'absent'].includes(status)) continue;
      const item = summary[key] ||= { counts: { present: 0, partial: 0, absent: 0 }, total: 0 };
      item.counts[status]++;
      item.total++;
    }
  }
  for (const item of Object.values(summary)) {
    const statuses = Object.keys(item.counts).filter(k => item.counts[k] > 0);
    item.status = statuses.length === 1 ? statuses[0] : 'mixed';
  }
  return summary;
}
