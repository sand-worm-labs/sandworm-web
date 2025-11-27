import {  Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLinks {
  @ApiProperty({
    type: String,
    example: '@johndoe',
  })
  telegram?: string;

  @ApiProperty({
    type: String,
    example: '@johndoe',
  })
  twitter?: string;

  @ApiProperty({
    type: String,
    example: 'johndoe',
  })
  github?: string;

  @ApiProperty({
    type: String,
    example: 'johndoe#1234',
  })
  discord?: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email?: string;

  @ApiProperty({
    type: String,
    example: '@johndoe',
  })
  warpcast?: string;
}

export class Wallet {
  @ApiProperty({
    type: String,
    example: 'ethereum',
  })
  chain: string;

  @ApiProperty({
    type: String,
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address: string;
}

export class UserSettingResponse {
  @ApiProperty({
    type: String,
  })
  id: number | string;

  @ApiProperty({
    type: String,
  })
  userId: number | string;

  @ApiProperty({
    type: () => SocialLinks,
  })
  @Expose({ groups: ['me', 'admin'] })
  socialLinks?: SocialLinks;

  @ApiProperty({
    type: String,
    example: 'Available for collaboration',
  })
  statusText: string;

  @ApiProperty({
    type: Date,
    example: '2024-01-15T10:30:00Z',
  })
  statusUpdatedAt: Date;

  @ApiProperty({
    enum: ['light', 'dark'],
    example: 'dark',
  })
  theme: 'light' | 'dark';

  @ApiProperty({
    type: [Wallet],
    example: [
      { chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { chain: 'solana', address: 'So1ana1234567890abcdef1234567890abcdef12' },
    ],
  })
  wallets: Wallet[];
}