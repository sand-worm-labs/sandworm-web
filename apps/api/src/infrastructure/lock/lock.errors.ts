export class AlreadyAcquiredError extends Error {
    constructor(lockName: string) {
        super(`Lock ${lockName} is already acquired.`);
        this.name = 'AlreadyAcquiredError';
    }
}