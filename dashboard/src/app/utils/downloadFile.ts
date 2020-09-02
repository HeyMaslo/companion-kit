import logger from 'common/logger';

export function downloadFile(url: string, filename?: string): boolean {
    if (/(iP)/g.test(navigator.userAgent)) {
        logger.log('Your device does not support files downloading. Please try again in desktop browser.');
        window.open(url, '_blank');
        return false;
    }

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('target', '_blank');

    if (link.download !== undefined) {
        const fileName = filename || url.substring(url.lastIndexOf('/') + 1, url.length);
        link.download = fileName;
    }

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        link.dispatchEvent(event);
        return true;
    }

    // Force file download (whether supported by server).
    if (url.indexOf('?') === -1) {
        url += '?download';
    }

    window.open(url, '_blank');
    return true;
}
