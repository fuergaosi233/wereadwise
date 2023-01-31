import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});
console.emoji('🦄', 'background script loaded');

browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    details?.requestHeaders?.push({
      name: 'referer',
      value: 'https://readwise.io/access_token',
    });
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ['https://readwise.io/access_token']},
  ['requestHeaders', 'blocking', 'extraHeaders']
);

browser.runtime.getBrowserInfo().then((info) => {
  console.emoji('🦄', 'browser info', info);
});
