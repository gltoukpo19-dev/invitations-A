export function generateGoogleCalendarUrl({
  title,
  description,
  location,
}: {
  title: string;
  description: string;
  location: string;
}) {
  const text = encodeURIComponent(title);
  const details = encodeURIComponent(description);
  const loc = encodeURIComponent(location);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${loc}`;
}

export function downloadIcsFile({
  title,
  description,
  location,
}: {
  title: string;
  description: string;
  location: string;
}) {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VINO-ESVI//Invitation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${title.replace(/[\n\r]/g, " ")}`,
    `DESCRIPTION:${description.replace(/[\n\r]/g, "\\n")}`,
    `LOCATION:${location.replace(/[\n\r]/g, " ")}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invitation-vino-esvi.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
