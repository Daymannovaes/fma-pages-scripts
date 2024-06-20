/*
Esse script exporta um método \`handleCurrentPageRedirect\` que pode ser chamado para lidar com o redirecionamento para a página de checkout.

Confirme que você está chamando \`handleCurrentPageRedirect()\` na página onde deseja lidar com o redirecionamento.

Como o script de redirecionamento funciona:
1. Ao abrir uma página com esse script, por padrão ele vai salvar todos os parâmetros da URL em localStorage.
  por exemplo, se a URL for \`https://www.fma.com.br/vendas1?utm_source=facebook&utm_medium=cpc&utm_campaign=blackfriday\`,
  os parâmetros salvos serão: \`{'utm_source': 'facebook', 'utm_medium': 'cpc', 'utm_campaign': 'blackfriday'}\`
2. Como passo intermediário, o usuário pode sair dessa página por algum motivo (por exemplo ir para um formulário de coleta de dados).
3. Durante esse fluxo, em algum momento o usuário precisa ser redicionado para essa mesma página anterior,
  mas com novos parâmetros que indicam que o usuário deve ser redirecionado para o checkout.
  Esses parâmetros são 2: step=checkout_redirect e checkout_url=<url do checkout>,
  exemplo: \`https://www.fma.com.br/vendas1?step=checkout_redirect&checkout_url=https%3A%2F%2Fpay.hotmart.com%2FSOMEIDHERE%3Foff%3Dsomeoffcode%26checkoutMode%3D10\`
4. Nesse momento, o script vai identificar os parametros de redirecionamento, e irá redirecionar
  o usuário para a URL de checkout, adicionando os parametros salvos em localStorage anteriormente.
  No caso: \`https://pay.hotmart.com/SOMEIDHERE?off=someoffcode&checkoutMode=10&utm_source=facebook&utm_medium=cpc&utm_campaign=blackfriday\`
*/
type QueryParams = Record<string, string>;

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

function getQueryParamsFromUrl(url: string): QueryParams {
  const params = new URLSearchParams(url);
  const queryParams: QueryParams = {};
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

function appendQueryParamsToUrl(url: URL, params: QueryParams) {
  const urlObj = new URL(url);
  for (const key in params) {
      urlObj.searchParams.set(key, params[key]);
  }
  return urlObj.toString();
}

function mergeParamsInLocalStorage(queryParams: QueryParams) {
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

function saveParamsInLocalStorage(queryParams: QueryParams) {
  localStorage.setItem('fma_params', JSON.stringify(queryParams));
}
