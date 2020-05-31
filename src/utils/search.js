const getUrlParameter = (name) => {
  const url = window.location.href;
  const nameClean = name.replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[?&]${nameClean}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export default getUrlParameter;
