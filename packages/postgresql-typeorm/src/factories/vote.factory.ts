import { setSeederFactory } from 'typeorm-extension';
import { VoteEntity } from '../entities';

export default setSeederFactory(VoteEntity, (fake) => {
    const vote = new VoteEntity();

    // vote.userId = 1;      // adjust as needed
    // vote.documentId = 1;  // adjust as needed
    vote.isUpvoted = fake.datatype.boolean();

    return vote;
});