export const convertTimestampToDatetimeLocalString = (t: number) => {
  const date = new Date(t);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = "00";

  // Combine date-time components
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const datetimeLocalToTimestamp = (formattedDate: string) => {
  const [datePart, timePart] = formattedDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Note: The month in the Date constructor is 0-indexed.
  const dateObj = new Date(year, month - 1, day, hour, minute);

  return dateObj.getTime();
};
