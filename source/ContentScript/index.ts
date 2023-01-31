export const getWereadCookies = (): string[] => {
  const cookies = document.cookie.split(';');
  const wereadCookies = cookies.filter((cookie) => cookie.includes('weread'));
  return wereadCookies;
};
