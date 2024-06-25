const browser = chrome || browser;

browser.runtime.onInstalled.addListener(() => {
    console.log('Element Shuffler extension installed');
});
