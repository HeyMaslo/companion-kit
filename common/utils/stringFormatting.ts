export function capitalizeFirstLetter(str: string) {
    const m = /[a-zA-Z]/.exec(str);
    if (m) {
        const letter = str[m.index].toUpperCase();
        const after = str.substring(m.index + 1);
        return m.index > 0
            ? `${str.substring(0, m.index)}${letter}${after}`
            : `${letter}${after}`;
    }
    return str;
}

export function titleCase(str: string) {
    if (!str) return null;

    const splitStr = str.toLowerCase().split(' ');

    return splitStr.map(word => capitalizeFirstLetter(word)).join(' ');
}

export function escapeRegex(s: string): string {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function replace(str: string, search: string, replacement: string) {
    if (!str) {
        return '';
    }
    return str.replace(new RegExp(escapeRegex(search), 'g'), replacement);
}
