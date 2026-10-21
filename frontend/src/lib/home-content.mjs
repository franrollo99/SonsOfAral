function dayTimestamp(value) {
  if (!value) return NaN;
  // Interpret date-only API values in local time, not UTC.
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatConcertDate(value) {
  const timestamp = dayTimestamp(value);
  if (Number.isNaN(timestamp)) return "";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(timestamp);
}

export function pickNextConcert(items, today = new Date()) {
  const threshold = dayTimestamp(today);
  return (
    (Array.isArray(items) ? items : [])
      .filter((item) => item && dayTimestamp(item.fecha) >= threshold)
      .sort((a, b) => dayTimestamp(a.fecha) - dayTimestamp(b.fecha))[0] || null
  );
}

export function pickLatestRelease(items, today = new Date()) {
  const threshold = dayTimestamp(today);
  return (
    (Array.isArray(items) ? items : [])
      .filter(
        (item) => item && dayTimestamp(item.fechaLanzamiento) <= threshold,
      )
      .sort(
        (a, b) =>
          dayTimestamp(b.fechaLanzamiento) - dayTimestamp(a.fechaLanzamiento),
      )[0] || null
  );
}
