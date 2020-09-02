
export function prepareEmail(email: string) {
    return email && email.toLowerCase()
        .replace(/ /gi, '');
}
