import { MigrationInterface, QueryRunner } from "typeorm";

export class addCinemaIdToSubscriptions1697223456789 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD COLUMN cinema_id VARCHAR(255) REFERENCES cinemas(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      DROP COLUMN cinema_id;
    `);
  }
}
