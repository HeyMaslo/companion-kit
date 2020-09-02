import db from 'server/services/db';
import { UserProfile, UserRoles } from 'common/models';

export async function getPayingCoaches() {
    const users = (await db.value.collection('users').get())
        .docs.map(d => d.data() as UserProfile);

    const coaches = users.filter(u => UserRoles.Helper.contains(u.roles, UserRoles.Coach));

    const freeAccessCoaches = coaches.filter(u => u.freeAccess);
    const paying = coaches.filter(u => !u.freeAccess && u.billing && !u.billing.cancelAt && !u.billing.paymentFailed);

    return {
        freeAccessCoaches,
        payingCoaches: paying,
    };
}

export async function getPayingCoachesHtml() {
    const result = await getPayingCoaches();

    const lines = [
        `<h3> Free access accounts: ${result.freeAccessCoaches.length} </h3>`,
        '<table>',
        `<th>
            <td>Name</td>
            <td>Email</td>
            <td>Has billing</td>
        </th>`,
        ...result.freeAccessCoaches.map((u, index) => `<tr>
            <td> ${index + 1} </td>
            <td> ${u.firstName} ${u.lastName} </td>
            <td> <b>${u.email}</b> </td>
            <td> ${!!u.billing && !u.billing.cancelAt && !u.billing.paymentFailed} </td>
        </tr>`),
        '</table>',

        `<h3> Payed accounts: ${result.payingCoaches.length} </h3>`,
        '<table>',
        `<th>
            <td>Name</td>
            <td>Email</td>
            <td>Plan</td>
            <td>Trial Ends</td>
        </th>
        `,
        ...result.payingCoaches
            .map((u, index) => `
            <tr>
                <td> ${index + 1} </td>
                <td>${u.firstName} ${u.lastName} </td>
                <td> ${u.email} </td>
                <td> ${u.billing.plan} ${u.billing.planCategory || 'old'} </td>
                <td> ${u.billing.trialPeriondEnd ? new Date(u.billing.trialPeriondEnd * 1000).toUTCString() : '?'} </td>
            </tr>`),
        '</table>',
    ];

    return lines.join('\r\n');
}
