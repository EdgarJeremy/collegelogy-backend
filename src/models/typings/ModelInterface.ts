import Sequelize from 'sequelize';

export interface Factory<I, A> {
	(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): Sequelize.Model<I, A>;
}
