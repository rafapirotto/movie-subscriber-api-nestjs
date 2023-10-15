import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUniqueConstraintInSubscriptionTable1697323451963
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [result] = await queryRunner.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'subscriptions' AND constraint_type = 'UNIQUE';
    `);
    const constraintName: string = result.constraint_name;
    await queryRunner.query(`
      ALTER TABLE subscriptions
      DROP CONSTRAINT "${constraintName}";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD CONSTRAINT subscription_composite_key UNIQUE (user_id, movie_id);
    `);
  }
}
