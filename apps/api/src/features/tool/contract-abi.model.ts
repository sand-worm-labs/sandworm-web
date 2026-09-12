import { Field, ObjectType } from '@nestjs/graphql';
import { StringField } from '@sandworm/graphql';

// Shared by any tool that lets a user pick a real function or event off a
// contract's verified ABI instead of typing/guessing a signature by hand
// (calldata_decoder today; any future log/event-decoding tool tomorrow).
@ObjectType()
export class ContractFunction {
  @StringField()
  name!: string;

  /** Full canonical signature, e.g. "transfer(address,uint256)". */
  @StringField()
  signature!: string;

  /** 4-byte selector, hex-encoded without a 0x prefix. */
  @StringField()
  selector!: string;
}

@ObjectType()
export class ContractEvent {
  @StringField()
  name!: string;

  /** Full canonical signature, e.g. "Transfer(address,address,uint256)". */
  @StringField()
  signature!: string;

  /** 32-byte topic0, hex-encoded without a 0x prefix. */
  @StringField()
  topic0!: string;
}

@ObjectType()
export class ContractAbi {
  @Field(() => [ContractFunction])
  functions!: ContractFunction[];

  @Field(() => [ContractEvent])
  events!: ContractEvent[];
}
