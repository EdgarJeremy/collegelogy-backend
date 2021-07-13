import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface ParticipantAttributes {
    id?: number;
    student_id?: number;
    room_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ParticipantInstance extends Sequelize.Instance<ParticipantAttributes>, ParticipantAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const ParticipantFactory: Factory<ParticipantInstance, ParticipantAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<ParticipantInstance, ParticipantAttributes> => {
    const attributes: SequelizeAttributes<ParticipantAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    };
    const Participant: Sequelize.Model<ParticipantInstance, ParticipantAttributes> = sequelize.define<
        ParticipantInstance,
        ParticipantAttributes
    >('participant', attributes, { underscored: true });

    Participant.associate = (models: ModelFactoryInterface): void => {
        Participant.belongsTo(models.User, { onDelete: 'cascade', as: 'student', foreignKey: 'student_id' });
        Participant.belongsTo(models.Room, { onDelete: 'cascade' });
        Participant.hasMany(models.Document, { onDelete: 'cascade' });
    };

    return Participant;
};
