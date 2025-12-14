// yyyy.mm.dd 형식으로 변환
export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd}`;
};
