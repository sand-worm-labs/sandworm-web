import { setSeederFactory } from 'typeorm-extension';
import { VoteEntity } from '../entities';
import { fake } from '../utils';


export default setSeederFactory(VoteEntity, () => {
    const vote = new VoteEntity();
    vote.isUpvoted = fake.datatype.boolean();

    return vote;
});