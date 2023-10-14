import { MigrationInterface, QueryRunner } from "typeorm";

export class addLocationsToExistingSubscriptions1697225207160 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      UPDATE subscriptions
      SET location_id = '001';
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      UPDATE subscriptions
      SET location_id = NULL;
    `);
	}
}
