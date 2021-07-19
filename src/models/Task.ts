import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { DocumentInstance } from './Document';

export interface TaskAttributes {
    id?: number;
    name: string;
    description: string;
    due_date: Date;
    file: string;
    filename: string;
    checked: boolean;
    room_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface TaskInstance extends Sequelize.Instance<TaskAttributes>, TaskAttributes {
    getDocuments: Sequelize.HasManyGetAssociationsMixin<DocumentInstance>;
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const TaskFactory: Factory<TaskInstance, TaskAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<TaskInstance, TaskAttributes> => {
    const attributes: SequelizeAttributes<TaskAttributes> = {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        file: {
            type: DataTypes.BLOB('long'),
            allowNull: true
        },
        filename: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        checked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    const Task: Sequelize.Model<TaskInstance, TaskAttributes> = sequelize.define<
        TaskInstance,
        TaskAttributes
    >('task', attributes, { underscored: true });

    Task.associate = (models: ModelFactoryInterface): void => {
        Task.belongsTo(models.Room, { onDelete: 'cascade' });
        Task.hasMany(models.Document, { onDelete: 'cascade' });
    };

    return Task;
};
