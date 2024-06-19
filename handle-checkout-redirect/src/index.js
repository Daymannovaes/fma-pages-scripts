export function handleCurrentPageRedirect() {
  const params = getQueryParamsFromCurrentPage();

  if (Object.keys(params).length === 0) {
    return console.log('fma-redirect handleCurrentPageRedirect empty');
  }

  if (shouldRedirectToCheckout()) {
      redirectToCheckout();
  } else {
    mergeParamsInLocalStorage(params);
  }
}

function getQueryParamsFromCurrentPage() {
  return getQueryParamsFromUrl(window.location.search);
}

function getQueryParamsFromUrl(url) {
  const params = new URLSearchParams(url);
  const queryParams = {};
  params.forEach((value, key) => {
      queryParams[key] = value;
  });
  return queryParams;
}

function shouldRedirectToCheckout() {
  const params = getQueryParamsFromCurrentPage();
  return params.step === 'checkout_redirect' && params.checkout_url;
}

function redirectToCheckout() {
  const { checkout_url } = getQueryParamsFromCurrentPage();
  const checkoutUrl = new URL(decodeURIComponent(checkout_url));

  const savedParams = getParamsFromLocalStorage();

  const finalUrl = appendQueryParamsToUrl(checkoutUrl, savedParams);

  window.location.href = finalUrl;
}

function appendQueryParamsToUrl(url, params) {
  const urlObj = new URL(url);
  for (const key in params) {
      urlObj.searchParams.set(key, params[key]);
  }
  return urlObj.toString();
}

function mergeParamsInLocalStorage(queryParams) {
  const storedParams = getParamsFromLocalStorage();
  const mergedParams = { ...storedParams, ...queryParams };

  saveParamsInLocalStorage(mergedParams);

}

function getParamsFromLocalStorage() {
  try {
    const storedParams = localStorage.getItem('fma_params');
    return storedParams ? JSON.parse(storedParams) : {};
  } catch (error) {
    console.error('fma-redirect getParamsFromLocalStorage error', error);
    return {};
  }
}

function saveParamsInLocalStorage(queryParams) {
  localStorage.setItem('fma_params', JSON.stringify(queryParams));
}
