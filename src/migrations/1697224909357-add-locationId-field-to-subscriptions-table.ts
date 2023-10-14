import { MigrationInterface, QueryRunner } from "typeorm";

export class addLocationIdToSubscriptions1697223456789 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD COLUMN location_id VARCHAR(255) REFERENCES locations(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
      DROP COLUMN location_id;
    `);
  }
}
