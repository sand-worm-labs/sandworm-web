
export class UnexpectedBlockTypeError extends Error {
    constructor(
        public readonly blockId: string,
        public readonly expectedType: string,
        public readonly actualType: string
    ) {
        super(
            `Block ${blockId} is expected to be of type ${expectedType}, but it is of type ${actualType}`
        )
    }
}

export class BlockNotFoundError extends Error {
    constructor(public readonly blockId: string) {
        super(`Block ${blockId} not found`)
    }
}