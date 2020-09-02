
type DisplayName = { displayName: string };
type SplittedName = {
    firstName: string,
    lastName: string,
};

type FullName = DisplayName & SplittedName;

function splitDisplayName(name: Partial<DisplayName>): SplittedName {
    if (!name || !name.displayName) {
        return { firstName: '', lastName: '' };
    }
    const names = name.displayName.split(' ');
    const first = names[0];
    const last = names.slice(1).join(' ');

    return {
        firstName: first,
        lastName: last,
    };
}

const NamesHelper = {

    split(name: Partial<DisplayName>): SplittedName { return splitDisplayName(name); },
    join(name: Partial<SplittedName>): DisplayName { return { displayName: `${name.firstName} ${name.lastName}` }; },

    ensure(name: Partial<FullName>): FullName {
        if (name.displayName && name.firstName && name.lastName) {
            return name as FullName;
        }

        if (name.displayName) {
            return {
                displayName: name.displayName,
                ...NamesHelper.split(name),
            };
        }

        return {
            ...NamesHelper.join(name),
            firstName: name.firstName,
            lastName: name.lastName,
        };
    },

    ensureFromUsers(user: Partial<FullName>, authUser: Partial<DisplayName>) {
        const n = {
            firstName: user ? user.firstName : '',
            lastName: user ? user.lastName : '',
            displayName: (user && user.displayName) || (authUser && authUser.displayName) || '',
        };
        return NamesHelper.ensure(n);
    },
};

export default NamesHelper;
