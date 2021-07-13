import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface RoomAttributes {
    id?: number;
    name: string;
    code: string;
    owner_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface RoomInstance extends Sequelize.Instance<RoomAttributes>, RoomAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const RoomFactory: Factory<RoomInstance, RoomAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<RoomInstance, RoomAttributes> => {
    const attributes: SequelizeAttributes<RoomAttributes> = {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(6),
            allowNull: false
        }
    };
    const Room: Sequelize.Model<RoomInstance, RoomAttributes> = sequelize.define<
        RoomInstance,
        RoomAttributes
    >('room', attributes, { underscored: true });

    Room.associate = (models: ModelFactoryInterface): void => {
        Room.belongsTo(models.User, { onDelete: 'cascade', as: 'owner', foreignKey: 'owner_id' });
        Room.hasMany(models.Participant, { onDelete: 'cascade' });
        Room.hasMany(models.Task, { onDelete: 'cascade' });
    };

    return Room;
};
