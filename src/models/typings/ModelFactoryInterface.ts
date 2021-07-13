import Sequelize from 'sequelize';
import { UserInstance, UserAttributes } from '../User';
import { TokenInstance, TokenAttributes } from '../Token';
import { RoomAttributes, RoomInstance } from '../Room';
import { ParticipantAttributes, ParticipantInstance } from '../Participant';
import { TaskAttributes, TaskInstance } from '../Task';
import { DocumentAttributes, DocumentInstance } from '../Document';
import { DifferenceAttributes, DifferenceInstance } from '../Difference';

interface Obj {
	[s: string]: any;
}

export default interface ModelFactoryInterface extends Obj {
	sequelize: Sequelize.Sequelize;
	Sequelize: Sequelize.SequelizeStatic;
	User: Sequelize.Model<UserInstance, UserAttributes>;
	Token: Sequelize.Model<TokenInstance, TokenAttributes>;
	Room: Sequelize.Model<RoomInstance, RoomAttributes>;
	Participant: Sequelize.Model<ParticipantInstance, ParticipantAttributes>;
	Task: Sequelize.Model<TaskInstance, TaskAttributes>;
	Document: Sequelize.Model<DocumentInstance, DocumentAttributes>;
	Difference: Sequelize.Model<DifferenceInstance, DifferenceAttributes>;
}
