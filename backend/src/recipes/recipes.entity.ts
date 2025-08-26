import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('recipes')
export class Recipes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  instructions: string;

  @Column('simple-array')
  ingredients: string[];

  @Column({ type: 'int', default: 4 })
  servings: number;

  @Column({ type: 'int', nullable: true })
  prepTime: number; // in minutes

  @Column({ type: 'int', nullable: true })
  cookTime: number; // in minutes

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: ['easy', 'medium', 'hard'], default: 'medium' })
  difficulty: 'easy' | 'medium' | 'hard';

  @Column({ type: 'simple-array', nullable: true })
  intolerances: string[];

  @Column({ type: 'simple-array', nullable: true })
  allergens: string[];

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  @Column({ type: 'enum', enum: ['public', 'private'], default: 'public' })
  visibility: 'public' | 'private';

  @ManyToOne(() => User, (user) => user.recipes)
  author: User;

  @Column()
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
