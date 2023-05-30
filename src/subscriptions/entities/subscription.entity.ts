import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Movie } from 'src/movies/entities/movie.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Movie, (movie) => movie.subscriptions)
  // @JoinColumn not only defines which side of the relation contains the join column with a foreign key,
  // but also allows you to customize join column name and referenced column name.
  // el JoinColumn basicamente se usa para poner las foreign keys
  @JoinColumn({ name: 'movie_id' }) // the JoinColumn decorator is optional for @ManyToOne, but required for @OneToOne
  // si bien es opcional, se lo tengo que poner xq sino no le puedo cambiar el nombre de movieId a movie_id
  // otra cosa importante, por defecto se mapea el movieId a la primary key de la Movie entity,
  // sin embargo, si quisieramos mapearlo a otra columna, se hace usando el referencedColumnName
  // Ejemplo: @JoinColumn({ referencedColumnName: "name" })
  movie: Movie;

  // esto lo pongo para luego poner hacer subscription.movieId
  // ademas si no le pongo el "name: 'movie_id'", me crear otra columna (ademas de la movie_id que me genera en la parte de arriba con el JoinColumn)
  // en la bd con el nombre "movieId"
  // entonces esta referencia sirve para decir este movieId es el mismo que el movie_id del JoinColumn de arriba
  // y de esta manera, no me crea otra columna
  @Column('uuid', { name: 'movie_id' })
  movieId: string;

  @Column('uuid', { name: 'user_id' })
  public userId: string;

  @ManyToOne(() => User, (user) => user.subscriptions)
  // esto del @JoinColumn() se lo pongo para que no llame a la columna "userId", xq quiero los nombres snake_case
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}

// Join columns are always a reference to some other columns (using a foreign key). By default your relation always refers to the primary column of the related entity. If you want to create relation with other columns of the related entity - you can specify them in @JoinColumn as well:

// @ManyToOne(type => Category)
// @JoinColumn({ referencedColumnName: "name" })
// category: Category;

// The relation now refers to name of the Category entity, instead of id.
// Column name for that relation will become categoryName.

// las relaciones de foreign keys no son al pedo, me evitan que me inserten cualquier valor en la columna referenciada
// es decir, solo (sino tira error) permite insertar valores que existan en la tabla referenciada
