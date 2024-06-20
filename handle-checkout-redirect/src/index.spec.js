import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleCurrentPageRedirect } from './handle-checkout-redirect';

describe('handleCurrentPageRedirect', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Spy on localStorage methods
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    // Restore the original methods after each test
    vi.restoreAllMocks();
  });

  it('should do nothing if without params', () => {
    delete window.location;
    window.location = new URL('https://www.fma.com.br/vendas1');

    handleCurrentPageRedirect();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should save params', () => {
    delete window.location;
    window.location = new URL('https://www.fma.com.br/vendas1?utm_source=facebook&utm_medium=cpc&utm_campaign=blackfriday');

    handleCurrentPageRedirect();
    expect(localStorage.setItem).toHaveBeenCalledWith('fma_params', '{\"utm_source\":\"facebook\",\"utm_medium\":\"cpc\",\"utm_campaign\":\"blackfriday\"}');
  });

  it('should redirect with params', () => {
    delete window.location;
    window.location = new URL('https://www.fma.com.br/vendas1?utm_source=facebook&utm_medium=cpc&utm_campaign=blackfriday');
    handleCurrentPageRedirect(); // first call will save params in local storage

    window.location = new URL('https://www.fma.com.br/vendas1?step=checkout_redirect&checkout_url=https%3A%2F%2Fpay.hotmart.com%2FSOMEIDHERE%3Foff%3Dsomeoffcode%26checkoutMode%3D10');
    handleCurrentPageRedirect(); // second call see the redirect instruction, and will redirect user setting the window.location property

    expect(window.location.toString()).toBe('https://pay.hotmart.com/SOMEIDHERE?off=someoffcode&checkoutMode=10&utm_source=facebook&utm_medium=cpc&utm_campaign=blackfriday');
  });
});
