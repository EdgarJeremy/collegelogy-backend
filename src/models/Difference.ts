import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface DifferenceAttributes {
    id?: number;
    percentage: number;
    a_id?: number;
    b_id?: number;
    task_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface DifferenceInstance extends Sequelize.Instance<DifferenceAttributes>, DifferenceAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const DifferenceFactory: Factory<DifferenceInstance, DifferenceAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<DifferenceInstance, DifferenceAttributes> => {
    const attributes: SequelizeAttributes<DifferenceAttributes> = {
        percentage: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    const Difference: Sequelize.Model<DifferenceInstance, DifferenceAttributes> = sequelize.define<
        DifferenceInstance,
        DifferenceAttributes
    >('difference', attributes, { underscored: true });

    Difference.associate = (models: ModelFactoryInterface): void => {
        Difference.belongsTo(models.Task, { onDelete: 'cascade' });
        Difference.belongsTo(models.Document, { onDelete: 'cascade', as: 'a', foreignKey: 'a_id' });
        Difference.belongsTo(models.Document, { onDelete: 'cascade', as: 'b', foreignKey: 'b_id' });
    };

    return Difference;
};
