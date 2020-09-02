export enum Plans {
    monthly = 'monthly',
    annual = 'annual',
    canceled = 'canceled',
}

export enum PlansCategories {
    starter = 'starter',
    pro1 = 'pro 1',
    pro2 = 'pro 2',
}

export const categoryToClientsCount = {
    [PlansCategories.starter]: 3,
    [PlansCategories.pro1]: 12,
    [PlansCategories.pro2]: 25,
};

export const PlanUI = {
    [Plans.monthly]: {
        [PlansCategories.starter]: {
            price: 25,
            clientsNumber: categoryToClientsCount[PlansCategories.starter],
            subtitle: 'for Small Coaching Practices',
        },
        [PlansCategories.pro1]: {
            price: 99,
            clientsNumber: categoryToClientsCount[PlansCategories.pro1],
            subtitle: 'for Growing Practices',
        },
        [PlansCategories.pro2]: {
            price: 199,
            clientsNumber: categoryToClientsCount[PlansCategories.pro2],
            subtitle: 'for Established Practices',
        },
    },
    [Plans.annual]: {
        [PlansCategories.starter]: {
            price: 250,
            clientsNumber: categoryToClientsCount[PlansCategories.starter],
            subtitle: 'for Small Coaching Practices',
        },
        [PlansCategories.pro1]: {
            price: 990,
            clientsNumber: categoryToClientsCount[PlansCategories.pro1],
            subtitle: 'for Growing Practices',
        },
        [PlansCategories.pro2]: {
            price: 1990,
            clientsNumber: categoryToClientsCount[PlansCategories.pro2],
            subtitle: 'for Established Practices',
        },
    },
};

export function getPrevPlanCategory(currentPlanCategory: PlansCategories): PlansCategories {
    const keys = Object.keys(categoryToClientsCount) as PlansCategories[];
    const index = keys.findIndex(el => el === currentPlanCategory);

    if (index <= 0) {
        return null;
    }

    return keys[index - 1];
}
