import { getChild, setValue } from './Api';

function getTotalResponses (user: object): number {
    return Object.keys(user).reduce((total: number, roadId: string): number => {
        const roadTotal = Object.keys(user[roadId])
            .reduce((prev: number, curr: string) => prev + Object.keys(user[roadId][curr]).length, 0);
        return total + roadTotal;
    }, 0);
}

function arrayToObjectRanking (array: string[]): object {
    const obj = {};
    array.map((key, index) => {
        obj[key] = index;
    });

    return obj;
}

export async function updateRanking () {
    const proposals = await getChild('proposals');
    function countTotalPoints (roadProposals) {
        return Object.keys(roadProposals).reduce((total: number, roadId: string): number => {
            return total + Object.keys(roadProposals[roadId]).reduce((roadTotal: number, pId: string) => {
                return roadTotal + proposals[pId].currentUnits;
            }, 0);
        }, 0);
    }
    const userProposals = await getChild('userProposals');
    const proposalArray = Object.keys(userProposals).sort((uidA: string, uidB: string): number => {
        const userA = countTotalPoints(userProposals[uidA].proposals);
        const userB = countTotalPoints(userProposals[uidB].proposals);
        return userB - userA;
    });
    const proposalRanking = arrayToObjectRanking(proposalArray);

    const userDings = await getChild('userDings');
    const dingArray = Object.keys(userDings).sort((uidA: string, uidB: string): number => {
        const userA = Object.keys(userDings[uidA]).length;
        const userB = Object.keys(userDings[uidB]).length;
        return userB - userA;
    });
    const dingRanking = arrayToObjectRanking(dingArray);

    const userResponses = await getChild('userResponses');
    const responseArray = Object.keys(userResponses).sort((uidA: string, uidB: string): number => {
        const userA = getTotalResponses(userResponses[uidA]);
        const userB = getTotalResponses(userResponses[uidB]);
        return userB - userA;
    });
    const responseRanking = arrayToObjectRanking(responseArray);

    const now = Date.now();
    console.log('update rankings');
    await setValue(`rankings/${now}`, {
        proposalRanking,
        dingRanking,
        responseRanking,
    });
    await setValue(`rankings/head`, now);
}
