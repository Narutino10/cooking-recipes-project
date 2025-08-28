import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recipes } from '../recipes/recipes.entity';
import { User } from '../users/user.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => Recipes, { nullable: false })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipes;

  @Column({ nullable: false })
  recipeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
