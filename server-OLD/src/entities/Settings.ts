import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type AIProvider = 'openrouter' | 'sillytavern';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'simple-enum',
    enum: ['openrouter', 'sillytavern'],
    default: 'openrouter'
  })
  aiProvider!: AIProvider;

  @Column({ type: 'varchar', nullable: true })
  sillytavernIp?: string;

  @Column({ type: 'varchar', nullable: true })
  sillytavernPort?: string;

  @Column({ type: 'varchar', nullable: true })
  openrouterApiKey?: string;

  @Column({ type: 'varchar', default: 'mocha' })
  theme!: string;

  @Column({ type: 'boolean', default: false })
  onboardingCompleted!: boolean;

  @Column({ type: 'integer', nullable: true })
  onboardingStep?: number;
}
