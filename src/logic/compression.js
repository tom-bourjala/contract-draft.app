import LZString from 'lz-string';

export function compressLZS(s) {
    return LZString.compressToEncodedURIComponent(s);
}

export function decompressLZS(s) {
    return LZString.decompressFromEncodedURIComponent(s);
}